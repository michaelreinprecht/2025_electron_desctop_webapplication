#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "esp_log.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "nvs_flash.h"

#include "wifi_handler.h"
#include "max3010x.h"
#include "udp_client.h"

static const char *TAG = "main";

void app_main(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    wifi_init_static_ip(); // Wi-Fi
    max3010x_init_i2c();   // Sensor setup

    udp_client_start(); // Udp client startup

    while (1)
    {
        float temperature, humidity;
        max3010x_read_temp_humidity(&temperature, &humidity);

        // Serial send
        // JSON Struct -> serialized to ByteArray -> deserialized to JSON Struct
        // How does JSON Struct need to look ...?
        // sensors: ['temp', 'humidity']
        // values: [['tempValue'],['humidityValue']],

        // chart: 'temperatureChart'
        // sensor: 'temp',
        // value: 'value',
        // valuename: '°C',
        // time: -> doesn't need to be sent just use now
        // scale: ....
        // min: ....
        // max: ....
        // color: ....
        // cleanupTime: ...

        printf("{\"temp\": %.2f, \"humidity\": %.2f}\n", temperature, humidity);
        // Udp send
        udp_client_send_data(temperature, humidity);

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
