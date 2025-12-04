#pragma once

#include <stdint.h>

void max3010x_init_i2c();
void max3010x_writeRegister_uint16(uint16_t cmd);
void max3010x_wake_up();
void max3010x_start_meassurement();
void max3010x_read_temp_humidity(float *temperature, float *humidity);