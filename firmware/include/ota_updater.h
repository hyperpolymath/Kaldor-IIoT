/**
 * Kaldor IIoT - OTA Update Handler
 */

#ifndef OTA_UPDATER_H
#define OTA_UPDATER_H

#include <Arduino.h>
#include <HTTPUpdate.h>
#include <ArduinoOTA.h>

class OTAUpdater {
private:
    String deviceId;
    bool updateInProgress;

public:
    OTAUpdater();
    void begin(const String& devId);
    void handle();
    void update(const String& url);
    bool isUpdateInProgress();
};

#endif // OTA_UPDATER_H
