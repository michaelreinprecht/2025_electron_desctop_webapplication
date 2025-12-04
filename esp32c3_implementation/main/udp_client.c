#include "udp_client.h"
#include <string.h>
#include <errno.h>
#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"

#include "esp_log.h"
#include "esp_netif.h"
#include "lwip/sockets.h"

#define HOST_IP_ADDR "10.0.0.10"
#define PORT 6666

static const char *TAG = "udp_client";

static int udp_sock = -1;
static struct sockaddr_in dest_addr;

// Queue used to send messages to the UDP task
static QueueHandle_t udp_queue;

// Structure for queued outgoing data
typedef struct
{
    float temp;
    float humidity;
} udp_data_t;

void udp_client_send_data(float temp, float humidity)
{
    if (udp_queue == NULL)
        return;

    udp_data_t msg = {
        .temp = temp,
        .humidity = humidity};

    xQueueSend(udp_queue, &msg, 0);
}

static void udp_client_task(void *pvParameters)
{
    udp_queue = xQueueCreate(10, sizeof(udp_data_t));

    dest_addr.sin_addr.s_addr = inet_addr(HOST_IP_ADDR);
    dest_addr.sin_family = AF_INET;
    dest_addr.sin_port = htons(PORT);

    udp_sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_IP);
    if (udp_sock < 0)
    {
        ESP_LOGE(TAG, "Unable to create socket: errno %d", errno);
        vTaskDelete(NULL);
        return;
    }

    ESP_LOGI(TAG, "UDP socket ready → %s:%d", HOST_IP_ADDR, PORT);

    udp_data_t incoming;

    while (1)
    {

        // Wait for data to send
        if (xQueueReceive(udp_queue, &incoming, portMAX_DELAY))
        {

            char buffer[128];
            int len = snprintf(buffer, sizeof(buffer),
                               "{\"temp\": %.2f, \"humidity\": %.2f}",
                               incoming.temp, incoming.humidity);

            int err = sendto(udp_sock, buffer, len, 0,
                             (struct sockaddr *)&dest_addr, sizeof(dest_addr));

            if (err < 0)
            {
                ESP_LOGE(TAG, "UDP send failed: errno %d", errno);
            }
            else
            {
                ESP_LOGI(TAG, "Sent: %s", buffer);
            }
        }
    }
}

void udp_client_start(void)
{
    xTaskCreate(udp_client_task, "udp_client", 4096, NULL, 5, NULL);
}
