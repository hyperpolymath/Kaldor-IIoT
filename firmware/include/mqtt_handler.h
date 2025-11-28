/**
 * Kaldor IIoT - MQTT Handler
 */

#ifndef MQTT_HANDLER_H
#define MQTT_HANDLER_H

#include <Arduino.h>
#include <PubSubClient.h>

// Forward declaration
void mqttCallback(char* topic, byte* payload, unsigned int length);

#endif // MQTT_HANDLER_H
