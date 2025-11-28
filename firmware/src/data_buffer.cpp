/**
 * Kaldor IIoT - Data Buffer Implementation
 */

#include "data_buffer.h"
#include <SPIFFS.h>
#include <ArduinoJson.h>

DataBuffer::DataBuffer() : maxSize(100), bufferFile("/buffer.dat") {}

void DataBuffer::begin(size_t size) {
    maxSize = size;
    buffer.reserve(size);

    // Try to load existing buffered data
    loadFromFile();
}

void DataBuffer::add(const SensorData& data) {
    if (buffer.size() >= maxSize) {
        // Buffer full - remove oldest entry
        buffer.erase(buffer.begin());
    }

    buffer.push_back(data);

    // Persist to flash every 10 entries
    if (buffer.size() % 10 == 0) {
        saveToFile();
    }
}

bool DataBuffer::isFull() {
    return buffer.size() >= maxSize;
}

size_t DataBuffer::size() {
    return buffer.size();
}

SensorData DataBuffer::get(int index) {
    if (index >= 0 && index < buffer.size()) {
        return buffer[index];
    }
    return SensorData{};
}

void DataBuffer::clear() {
    buffer.clear();
    SPIFFS.remove(bufferFile.c_str());
}

bool DataBuffer::saveToFile() {
    File file = SPIFFS.open(bufferFile.c_str(), "w");
    if (!file) {
        return false;
    }

    // Write buffer size
    file.write((uint8_t*)&maxSize, sizeof(maxSize));

    size_t count = buffer.size();
    file.write((uint8_t*)&count, sizeof(count));

    // Write all entries
    for (const auto& data : buffer) {
        file.write((uint8_t*)&data, sizeof(SensorData));
    }

    file.close();
    return true;
}

bool DataBuffer::loadFromFile() {
    if (!SPIFFS.exists(bufferFile.c_str())) {
        return false;
    }

    File file = SPIFFS.open(bufferFile.c_str(), "r");
    if (!file) {
        return false;
    }

    // Read buffer size
    size_t savedMaxSize;
    file.read((uint8_t*)&savedMaxSize, sizeof(savedMaxSize));

    // Read count
    size_t count;
    file.read((uint8_t*)&count, sizeof(count));

    // Read all entries
    buffer.clear();
    for (size_t i = 0; i < count; i++) {
        SensorData data;
        file.read((uint8_t*)&data, sizeof(SensorData));
        buffer.push_back(data);
    }

    file.close();

    Serial.printf("Loaded %d buffered readings from flash\n", buffer.size());
    return true;
}
