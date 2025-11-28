/**
 * Kaldor IIoT - OTA Update Implementation
 */

#include "ota_updater.h"

OTAUpdater::OTAUpdater() : updateInProgress(false) {}

void OTAUpdater::begin(const String& devId) {
    deviceId = devId;

    // Configure ArduinoOTA
    ArduinoOTA.setHostname(deviceId.c_str());
    ArduinoOTA.setPassword("kaldor_ota_2024");

    ArduinoOTA.onStart([]() {
        String type;
        if (ArduinoOTA.getCommand() == U_FLASH) {
            type = "sketch";
        } else {
            type = "filesystem";
        }
        Serial.println("Start updating " + type);
    });

    ArduinoOTA.onEnd([]() {
        Serial.println("\nUpdate complete");
    });

    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    });

    ArduinoOTA.onError([](ota_error_t error) {
        Serial.printf("Error[%u]: ", error);
        if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
        else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
        else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
        else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
        else if (error == OTA_END_ERROR) Serial.println("End Failed");
    });

    ArduinoOTA.begin();
}

void OTAUpdater::handle() {
    ArduinoOTA.handle();
}

void OTAUpdater::update(const String& url) {
    Serial.println("Starting HTTP OTA update from: " + url);
    updateInProgress = true;

    WiFiClient client;
    httpUpdate.setLedPin(LED_BUILTIN, LOW);

    t_httpUpdate_return ret = httpUpdate.update(client, url);

    switch (ret) {
        case HTTP_UPDATE_FAILED:
            Serial.printf("HTTP_UPDATE_FAILED Error (%d): %s\n",
                httpUpdate.getLastError(),
                httpUpdate.getLastErrorString().c_str());
            break;

        case HTTP_UPDATE_NO_UPDATES:
            Serial.println("HTTP_UPDATE_NO_UPDATES");
            break;

        case HTTP_UPDATE_OK:
            Serial.println("HTTP_UPDATE_OK");
            ESP.restart();
            break;
    }

    updateInProgress = false;
}

bool OTAUpdater::isUpdateInProgress() {
    return updateInProgress;
}
