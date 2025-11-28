/**
 * Kaldor IIoT - Sensor Management
 *
 * Handles all sensor reading and processing
 */

#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <Adafruit_ADXL345_U.h>
#include <DHT.h>

struct SensorData {
    float bbw;           // Back Beam Width (mm)
    float bbw_min;       // Minimum in window
    float bbw_max;       // Maximum in window
    float bbw_stddev;    // Standard deviation
    float temperature;   // Temperature (C)
    float vibration;     // Vibration (g)
    uint8_t quality;     // Signal quality (0-100)
    unsigned long timestamp;
};

class SensorManager {
private:
    Adafruit_ADXL345_Unified accel;
    DHT dht;

    float bbwReadings[100];
    int readingIndex;
    int numReadings;

    float readUltrasonic();
    float readTemperature();
    float readVibration();
    uint8_t calculateQuality();
    void updateStatistics();

    float bbw_sum;
    float bbw_sum_sq;
    float current_min;
    float current_max;
    float current_avg;
    float current_stddev;

public:
    SensorManager();
    bool begin();
    SensorData read();
    SensorData getAggregated();
    void calibrate();
    bool selfTest();
};

#endif // SENSORS_H
