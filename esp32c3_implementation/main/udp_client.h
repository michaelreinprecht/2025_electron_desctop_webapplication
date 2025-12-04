#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

void udp_client_start(void);
void udp_client_send_data(float temperature, float humidity);
// Optional -> udp_client_send_data für byte array, weil universal!
