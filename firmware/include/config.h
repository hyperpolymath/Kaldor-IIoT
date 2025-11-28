/**
 * Kaldor IIoT - Configuration Header
 *
 * All configuration constants and pin definitions
 */

#ifndef CONFIG_H
#define CONFIG_H

// Firmware version
#define FIRMWARE_VERSION "1.0.0"

// WiFi Configuration
#define WIFI_SSID "KALDOR_FACTORY"
#define WIFI_PASSWORD "your_wifi_password_here"

// MQTT Configuration
#define MQTT_BROKER "mqtt.kaldor.local"
#define MQTT_PORT 8883
#define MQTT_USER "kaldor_device"
#define MQTT_PASSWORD "your_mqtt_password_here"

// Pin Definitions
#define I2C_SDA 21
#define I2C_SCL 22

// Ultrasonic sensor pins
#define ULTRASONIC_TRIG 25
#define ULTRASONIC_ECHO 26

// DHT Temperature sensor
#define DHT_PIN 27
#define DHT_TYPE DHT22

// Analog inputs
#define ANALOG_SENSOR_1 34
#define ANALOG_SENSOR_2 35

// Measurement thresholds
#define BBW_MIN_THRESHOLD 50.0   // mm
#define BBW_MAX_THRESHOLD 200.0  // mm
#define TEMP_MAX_THRESHOLD 80.0  // Celsius
#define VIB_MAX_THRESHOLD 5.0    // g

// Sensor calibration
#define BBW_CALIBRATION_OFFSET 0.0
#define BBW_CALIBRATION_SCALE 1.0

// Data retention
#define MAX_BUFFER_SIZE 1000
#define BUFFER_FLUSH_SIZE 100

#endif // CONFIG_H
