/**
 * Kaldor IIoT - Data Buffer for Offline Resilience
 */

#ifndef DATA_BUFFER_H
#define DATA_BUFFER_H

#include <Arduino.h>
#include "sensors.h"
#include <vector>

class DataBuffer {
private:
    std::vector<SensorData> buffer;
    size_t maxSize;
    String bufferFile;

public:
    DataBuffer();
    void begin(size_t size);
    void add(const SensorData& data);
    bool isFull();
    size_t size();
    SensorData get(int index);
    void clear();
    bool saveToFile();
    bool loadFromFile();
};

#endif // DATA_BUFFER_H
