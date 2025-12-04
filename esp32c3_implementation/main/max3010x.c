#pragma once

#include "max3010x.h"
#include "driver/i2c.h"
#include "esp_log.h"
#include <esp_err.h>
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_mac.h"
#include <math.h>

static const char *TAG = "max3010x";

#define I2C_MASTER_SCL_IO 6
#define I2C_MASTER_SDA_IO 5
#define I2C_NUM I2C_NUM_0
#define MAX3010X_ADDR 0x70
#define TEMP_MIN 20
#define TEMP_MAX 28
#define HUM_MIN 40
#define HUM_MAX 70

void max3010x_init_i2c()
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = GPIO_NUM_5,
        .scl_io_num = GPIO_NUM_6,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = 400000,
    };
    i2c_param_config(I2C_NUM, &conf);
    ESP_ERROR_CHECK(i2c_driver_install(I2C_NUM, conf.mode, 0, 0, 0));
}

void max3010x_writeRegister_uint16(uint16_t cmd)
{
    uint8_t buf[2] = {cmd >> 8, cmd & 0xFF};
    ESP_ERROR_CHECK(i2c_master_write_to_device(I2C_NUM, MAX3010X_ADDR, buf, 2, pdMS_TO_TICKS(50)));
}

void max3010x_wake_up()
{
    max3010x_writeRegister_uint16(0x3517);
    vTaskDelay(pdMS_TO_TICKS(50));
}

void max3010x_start_meassurement()
{
    // CS enabled, Read temp first, normal mode
    max3010x_writeRegister_uint16(0x7CA2);
    vTaskDelay(pdMS_TO_TICKS(50));
}

void max3010x_read_temp_humidity(float *temperature, float *humidity)
{
    max3010x_wake_up();
    max3010x_start_meassurement();

    // Read 6 bytes (2 temp + 1 CRC + 2 RH + 1 CRC)
    uint8_t data[6];
    ESP_ERROR_CHECK(i2c_master_read_from_device(I2C_NUM, MAX3010X_ADDR, data, 6, pdMS_TO_TICKS(1000)));
    // honestly don't care about crc bytes xD
    uint16_t tempBytes = (data[0] << 8) | data[1];
    uint16_t humidBytes = (data[3] << 8) | data[4];

    *temperature = -45 + 175 * ((float)tempBytes / (powf(2, 16)));
    *humidity = 100 * ((float)humidBytes / (powf(2, 16)));

    max3010x_writeRegister_uint16(0xB098);
}