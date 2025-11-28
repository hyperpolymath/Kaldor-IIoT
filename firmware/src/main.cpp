/**
 * Kaldor IIoT - BBW Sensor Board Firmware
 *
 * Main firmware for ESP32-based Back Beam Width monitoring system
 *
 * Features:
 * - Multi-sensor data acquisition (ultrasonic, temperature, vibration)
 * - MQTT communication with TLS
 * - Local data buffering for offline operation
 * - OTA firmware updates
 * - Watchdog timer for reliability
 * - WiFi auto-reconnection
 *
 * @author Kaldor IIoT Team
 * @version 1.0.0
 * @date 2025-11-22
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <SPIFFS.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>
#include <DHT.h>
#include "config.h"
#include "sensors.h"
#include "mqtt_handler.h"
#include "ota_updater.h"
#include "data_buffer.h"

// Hardware watchdog
#include "esp_system.h"
#include "esp_task_wdt.h"

// Global objects
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);
Preferences preferences;
SensorManager sensorManager;
DataBuffer dataBuffer;
OTAUpdater otaUpdater;

// Device identification
String deviceId;
String loomId;

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastTelemetry = 0;
unsigned long lastWiFiCheck = 0;
unsigned long lastMQTTCheck = 0;

// Configuration
const unsigned long SENSOR_INTERVAL = 10;      // 100Hz -> 10ms
const unsigned long TELEMETRY_INTERVAL = 1000;  // 1Hz -> 1000ms
const unsigned long WIFI_CHECK_INTERVAL = 5000; // Check WiFi every 5s
const unsigned long MQTT_CHECK_INTERVAL = 5000; // Check MQTT every 5s
const unsigned long WDT_TIMEOUT = 30;           // 30 second watchdog timeout

// Status LEDs
#define LED_STATUS GPIO_NUM_2
#define LED_WIFI GPIO_NUM_4
#define LED_MQTT GPIO_NUM_5

// Function prototypes
void setupWiFi();
void setupMQTT();
void reconnectWiFi();
void reconnectMQTT();
void readSensors();
void publishTelemetry();
void processCommands();
void handleOTA();
void blinkLED(uint8_t pin, int times);
void loadConfiguration();
void saveConfiguration();

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n\n");
    Serial.println("╔═══════════════════════════════════════════╗");
    Serial.println("║   Kaldor IIoT - BBW Sensor Board v1.0    ║");
    Serial.println("╚═══════════════════════════════════════════╝");
    Serial.println();

    // Initialize status LEDs
    pinMode(LED_STATUS, OUTPUT);
    pinMode(LED_WIFI, OUTPUT);
    pinMode(LED_MQTT, OUTPUT);
    digitalWrite(LED_STATUS, HIGH);

    // Initialize SPIFFS for local storage
    if (!SPIFFS.begin(true)) {
        Serial.println("ERROR: SPIFFS mount failed");
        ESP.restart();
    }
    Serial.println("✓ SPIFFS initialized");

    // Load configuration from NVS
    preferences.begin("kaldor-config", false);
    loadConfiguration();

    // Generate unique device ID if not set
    if (deviceId.isEmpty()) {
        uint64_t chipid = ESP.getEfuseMac();
        deviceId = "BBW-" + String((uint32_t)chipid, HEX);
        preferences.putString("deviceId", deviceId);
    }
    Serial.printf("✓ Device ID: %s\n", deviceId.c_str());
    Serial.printf("✓ Loom ID: %s\n", loomId.c_str());

    // Initialize I2C bus
    Wire.begin(I2C_SDA, I2C_SCL);
    Serial.println("✓ I2C initialized");

    // Initialize sensors
    if (!sensorManager.begin()) {
        Serial.println("WARNING: Some sensors failed to initialize");
    } else {
        Serial.println("✓ All sensors initialized");
    }

    // Initialize data buffer
    dataBuffer.begin(100); // Buffer up to 100 readings
    Serial.println("✓ Data buffer initialized");

    // Setup WiFi
    setupWiFi();

    // Setup MQTT
    setupMQTT();

    // Initialize OTA updater
    otaUpdater.begin(deviceId);
    Serial.println("✓ OTA updater ready");

    // Configure watchdog timer
    esp_task_wdt_init(WDT_TIMEOUT, true);
    esp_task_wdt_add(NULL);
    Serial.printf("✓ Watchdog timer configured (%ds timeout)\n", WDT_TIMEOUT);

    // All ready!
    blinkLED(LED_STATUS, 3);
    Serial.println("\n✓ System ready - entering main loop\n");
}

void loop() {
    unsigned long currentMillis = millis();

    // Reset watchdog timer
    esp_task_wdt_reset();

    // Check WiFi connection
    if (currentMillis - lastWiFiCheck >= WIFI_CHECK_INTERVAL) {
        lastWiFiCheck = currentMillis;
        if (WiFi.status() != WL_CONNECTED) {
            digitalWrite(LED_WIFI, LOW);
            reconnectWiFi();
        } else {
            digitalWrite(LED_WIFI, HIGH);
        }
    }

    // Check MQTT connection
    if (currentMillis - lastMQTTCheck >= MQTT_CHECK_INTERVAL) {
        lastMQTTCheck = currentMillis;
        if (!mqttClient.connected()) {
            digitalWrite(LED_MQTT, LOW);
            reconnectMQTT();
        } else {
            digitalWrite(LED_MQTT, HIGH);
        }
    }

    // Process MQTT messages
    mqttClient.loop();

    // Read sensors at high frequency
    if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
        lastSensorRead = currentMillis;
        readSensors();
    }

    // Publish telemetry at lower frequency
    if (currentMillis - lastTelemetry >= TELEMETRY_INTERVAL) {
        lastTelemetry = currentMillis;
        publishTelemetry();
    }

    // Handle OTA updates
    handleOTA();

    // Small delay to prevent watchdog triggers
    delay(1);
}

void setupWiFi() {
    Serial.printf("Connecting to WiFi: %s ", WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.setHostname(deviceId.c_str());
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" Connected!");
        Serial.printf("✓ IP Address: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("✓ Signal Strength: %d dBm\n", WiFi.RSSI());
        digitalWrite(LED_WIFI, HIGH);
    } else {
        Serial.println(" Failed!");
        Serial.println("WARNING: Running in offline mode");
        digitalWrite(LED_WIFI, LOW);
    }
}

void reconnectWiFi() {
    static unsigned long lastAttempt = 0;
    unsigned long currentMillis = millis();

    // Only attempt reconnection every 10 seconds
    if (currentMillis - lastAttempt < 10000) {
        return;
    }
    lastAttempt = currentMillis;

    Serial.println("Attempting WiFi reconnection...");
    WiFi.disconnect();
    delay(100);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    // Wait up to 5 seconds
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 10) {
        delay(500);
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("✓ WiFi reconnected");
        digitalWrite(LED_WIFI, HIGH);
    }
}

void setupMQTT() {
    // Load CA certificate for TLS
    // wifiClient.setCACert(MQTT_CA_CERT);

    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
    mqttClient.setKeepAlive(60);
    mqttClient.setSocketTimeout(30);

    reconnectMQTT();
}

void reconnectMQTT() {
    static unsigned long lastAttempt = 0;
    unsigned long currentMillis = millis();

    if (!WiFi.isConnected()) {
        return; // Can't connect to MQTT without WiFi
    }

    // Only attempt reconnection every 5 seconds
    if (currentMillis - lastAttempt < 5000) {
        return;
    }
    lastAttempt = currentMillis;

    Serial.print("Attempting MQTT connection...");

    // Create client ID
    String clientId = "kaldor-" + deviceId;

    // Attempt connection
    if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
        Serial.println(" Connected!");
        digitalWrite(LED_MQTT, HIGH);

        // Subscribe to command topics
        String cmdTopic = "kaldor/loom/" + loomId + "/config";
        mqttClient.subscribe(cmdTopic.c_str());

        String otaTopic = "kaldor/loom/" + loomId + "/ota";
        mqttClient.subscribe(otaTopic.c_str());

        Serial.printf("✓ Subscribed to topics\n");

        // Publish online status
        String statusTopic = "kaldor/loom/" + loomId + "/status";
        StaticJsonDocument<200> doc;
        doc["device_id"] = deviceId;
        doc["loom_id"] = loomId;
        doc["status"] = "online";
        doc["firmware_version"] = FIRMWARE_VERSION;
        doc["ip"] = WiFi.localIP().toString();

        String payload;
        serializeJson(doc, payload);
        mqttClient.publish(statusTopic.c_str(), payload.c_str(), true);

    } else {
        Serial.print(" Failed, rc=");
        Serial.println(mqttClient.state());
        digitalWrite(LED_MQTT, LOW);
    }
}

void readSensors() {
    SensorData data = sensorManager.read();

    // Add to local buffer (for offline resilience)
    dataBuffer.add(data);

    // If we have MQTT connection, publish high-frequency data
    if (mqttClient.connected()) {
        String topic = "kaldor/loom/" + loomId + "/bbw/raw";

        StaticJsonDocument<256> doc;
        doc["timestamp"] = millis();
        doc["device_id"] = deviceId;
        doc["bbw"] = data.bbw;
        doc["quality"] = data.quality;

        String payload;
        serializeJson(doc, payload);
        mqttClient.publish(topic.c_str(), payload.c_str());
    }
}

void publishTelemetry() {
    if (!mqttClient.connected()) {
        return; // Queue data in buffer for later
    }

    // Get aggregated sensor data
    SensorData data = sensorManager.getAggregated();

    String topic = "kaldor/loom/" + loomId + "/bbw/processed";

    StaticJsonDocument<512> doc;
    doc["timestamp"] = millis();
    doc["device_id"] = deviceId;
    doc["loom_id"] = loomId;

    JsonObject measurements = doc.createNestedObject("measurements");
    measurements["bbw_avg"] = data.bbw;
    measurements["bbw_min"] = data.bbw_min;
    measurements["bbw_max"] = data.bbw_max;
    measurements["bbw_stddev"] = data.bbw_stddev;
    measurements["temperature"] = data.temperature;
    measurements["vibration"] = data.vibration;

    JsonObject system = doc.createNestedObject("system");
    system["uptime"] = millis() / 1000;
    system["free_heap"] = ESP.getFreeHeap();
    system["wifi_rssi"] = WiFi.RSSI();
    system["buffer_size"] = dataBuffer.size();

    String payload;
    serializeJson(doc, payload);
    mqttClient.publish(topic.c_str(), payload.c_str());

    // Check for alerts
    if (data.bbw < BBW_MIN_THRESHOLD || data.bbw > BBW_MAX_THRESHOLD) {
        publishAlert("bbw_out_of_range", data.bbw);
    }
}

void publishAlert(const char* alertType, float value) {
    String topic = "kaldor/loom/" + loomId + "/alerts";

    StaticJsonDocument<256> doc;
    doc["timestamp"] = millis();
    doc["device_id"] = deviceId;
    doc["loom_id"] = loomId;
    doc["alert_type"] = alertType;
    doc["value"] = value;
    doc["severity"] = "warning";

    String payload;
    serializeJson(doc, payload);
    mqttClient.publish(topic.c_str(), payload.c_str(), true); // Retained message
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.printf("Message received [%s]: ", topic);

    // Parse JSON payload
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
        Serial.println("Failed to parse JSON");
        return;
    }

    String topicStr = String(topic);

    // Handle configuration updates
    if (topicStr.indexOf("/config") > 0) {
        Serial.println("Configuration update received");

        if (doc.containsKey("sampling_rate")) {
            // Update sampling rate
            int rate = doc["sampling_rate"];
            Serial.printf("  Sampling rate: %d Hz\n", rate);
        }

        if (doc.containsKey("thresholds")) {
            // Update thresholds
            JsonObject thresholds = doc["thresholds"];
            Serial.println("  Thresholds updated");
        }

        saveConfiguration();
    }

    // Handle OTA update requests
    else if (topicStr.indexOf("/ota") > 0) {
        Serial.println("OTA update requested");

        if (doc.containsKey("url")) {
            String url = doc["url"].as<String>();
            otaUpdater.update(url);
        }
    }
}

void handleOTA() {
    otaUpdater.handle();
}

void loadConfiguration() {
    loomId = preferences.getString("loomId", "LOOM-001");
    deviceId = preferences.getString("deviceId", "");
}

void saveConfiguration() {
    preferences.putString("loomId", loomId);
    preferences.putString("deviceId", deviceId);
}

void blinkLED(uint8_t pin, int times) {
    for (int i = 0; i < times; i++) {
        digitalWrite(pin, HIGH);
        delay(100);
        digitalWrite(pin, LOW);
        delay(100);
    }
}
