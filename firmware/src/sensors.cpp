/**
 * Kaldor IIoT - Sensor Implementation
 */

#include "sensors.h"
#include "config.h"
#include <math.h>

SensorManager::SensorManager()
    : accel(12345), dht(DHT_PIN, DHT_TYPE), readingIndex(0), numReadings(0),
      bbw_sum(0), bbw_sum_sq(0), current_min(9999), current_max(0) {

    for (int i = 0; i < 100; i++) {
        bbwReadings[i] = 0;
    }
}

bool SensorManager::begin() {
    bool success = true;

    // Initialize ultrasonic sensor pins
    pinMode(ULTRASONIC_TRIG, OUTPUT);
    pinMode(ULTRASONIC_ECHO, INPUT);
    digitalWrite(ULTRASONIC_TRIG, LOW);

    // Initialize DHT sensor
    dht.begin();
    Serial.println("  ✓ Temperature sensor initialized");

    // Initialize accelerometer
    if (!accel.begin()) {
        Serial.println("  ✗ ADXL345 not found");
        success = false;
    } else {
        accel.setRange(ADXL345_RANGE_16_G);
        Serial.println("  ✓ Accelerometer initialized");
    }

    // Perform self-test
    if (!selfTest()) {
        Serial.println("  ⚠ Sensor self-test failed");
        success = false;
    } else {
        Serial.println("  ✓ Sensor self-test passed");
    }

    return success;
}

SensorData SensorManager::read() {
    SensorData data;
    data.timestamp = millis();

    // Read BBW from ultrasonic sensor
    data.bbw = readUltrasonic();

    // Apply calibration
    data.bbw = (data.bbw + BBW_CALIBRATION_OFFSET) * BBW_CALIBRATION_SCALE;

    // Update rolling statistics
    bbwReadings[readingIndex] = data.bbw;
    readingIndex = (readingIndex + 1) % 100;
    if (numReadings < 100) numReadings++;

    updateStatistics();

    // Read other sensors at lower frequency
    static unsigned long lastSlowRead = 0;
    if (millis() - lastSlowRead > 1000) {
        lastSlowRead = millis();
        data.temperature = readTemperature();
        data.vibration = readVibration();
    }

    data.quality = calculateQuality();

    return data;
}

SensorData SensorManager::getAggregated() {
    SensorData data;
    data.timestamp = millis();

    data.bbw = current_avg;
    data.bbw_min = current_min;
    data.bbw_max = current_max;
    data.bbw_stddev = current_stddev;
    data.temperature = readTemperature();
    data.vibration = readVibration();
    data.quality = calculateQuality();

    return data;
}

float SensorManager::readUltrasonic() {
    // Send trigger pulse
    digitalWrite(ULTRASONIC_TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(ULTRASONIC_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(ULTRASONIC_TRIG, LOW);

    // Read echo pulse
    long duration = pulseIn(ULTRASONIC_ECHO, HIGH, 30000); // 30ms timeout

    if (duration == 0) {
        return -1; // Measurement failed
    }

    // Calculate distance in mm
    // Speed of sound = 343 m/s = 0.343 mm/μs
    // Distance = (duration / 2) * 0.343
    float distance = (duration / 2.0) * 0.343;

    return distance;
}

float SensorManager::readTemperature() {
    float temp = dht.readTemperature();

    if (isnan(temp)) {
        return -999; // Error value
    }

    return temp;
}

float SensorManager::readVibration() {
    sensors_event_t event;
    accel.getEvent(&event);

    // Calculate magnitude of acceleration
    float magnitude = sqrt(
        event.acceleration.x * event.acceleration.x +
        event.acceleration.y * event.acceleration.y +
        event.acceleration.z * event.acceleration.z
    );

    // Subtract gravity (9.8 m/s²)
    magnitude = abs(magnitude - 9.8);

    return magnitude;
}

uint8_t SensorManager::calculateQuality() {
    if (numReadings < 10) {
        return 50; // Not enough data
    }

    // Quality based on:
    // 1. Standard deviation (lower is better)
    // 2. Number of valid readings
    // 3. Sensor health

    uint8_t quality = 100;

    // Penalize high variability
    if (current_stddev > 5.0) {
        quality -= 20;
    } else if (current_stddev > 2.0) {
        quality -= 10;
    }

    // Penalize if we have invalid readings
    int invalidCount = 0;
    for (int i = 0; i < numReadings; i++) {
        if (bbwReadings[i] < 0) {
            invalidCount++;
        }
    }
    quality -= (invalidCount * 100) / numReadings;

    return max(0, min(100, quality));
}

void SensorManager::updateStatistics() {
    if (numReadings == 0) return;

    // Calculate mean
    bbw_sum = 0;
    bbw_sum_sq = 0;
    current_min = 9999;
    current_max = -9999;

    int validCount = 0;
    for (int i = 0; i < numReadings; i++) {
        float value = bbwReadings[i];
        if (value > 0) { // Valid reading
            bbw_sum += value;
            bbw_sum_sq += value * value;
            current_min = min(current_min, value);
            current_max = max(current_max, value);
            validCount++;
        }
    }

    if (validCount > 0) {
        current_avg = bbw_sum / validCount;

        // Calculate standard deviation
        float variance = (bbw_sum_sq / validCount) - (current_avg * current_avg);
        current_stddev = sqrt(max(0.0f, variance));
    } else {
        current_avg = 0;
        current_stddev = 0;
        current_min = 0;
        current_max = 0;
    }
}

void SensorManager::calibrate() {
    Serial.println("Starting calibration...");
    Serial.println("Please ensure BBW is at known reference (100mm)");
    delay(5000);

    // Take multiple readings
    float sum = 0;
    int count = 0;

    for (int i = 0; i < 100; i++) {
        float reading = readUltrasonic();
        if (reading > 0) {
            sum += reading;
            count++;
        }
        delay(100);
    }

    if (count > 0) {
        float avgReading = sum / count;
        float calibrationFactor = 100.0 / avgReading;

        Serial.printf("Calibration complete:\n");
        Serial.printf("  Average reading: %.2f mm\n", avgReading);
        Serial.printf("  Calibration factor: %.4f\n", calibrationFactor);
        Serial.printf("  Update BBW_CALIBRATION_SCALE to %.4f in config.h\n", calibrationFactor);
    } else {
        Serial.println("Calibration failed - no valid readings");
    }
}

bool SensorManager::selfTest() {
    bool success = true;

    // Test ultrasonic sensor
    float ultrasonicReading = readUltrasonic();
    if (ultrasonicReading < 0 || ultrasonicReading > 1000) {
        Serial.println("  ✗ Ultrasonic sensor test failed");
        success = false;
    }

    // Test temperature sensor
    float tempReading = readTemperature();
    if (tempReading < -50 || tempReading > 100) {
        Serial.println("  ✗ Temperature sensor test failed");
        success = false;
    }

    // Test accelerometer
    sensors_event_t event;
    if (!accel.getEvent(&event)) {
        Serial.println("  ✗ Accelerometer test failed");
        success = false;
    }

    return success;
}
