# Kaldor IIoT - Firmware

ESP32-based firmware for the Back Beam Width (BBW) monitoring sensor board.

## Features

- **Real-time Monitoring**: 100Hz sensor sampling with statistical processing
- **Multi-Sensor Support**: Ultrasonic distance, temperature, vibration
- **MQTT Communication**: Secure MQTT over TLS
- **Offline Resilience**: Local data buffering with automatic sync
- **OTA Updates**: Over-the-air firmware updates
- **Watchdog Protection**: Automatic recovery from crashes
- **WiFi Auto-Reconnect**: Robust network handling

## Hardware Requirements

### ESP32 Development Board
- ESP32-WROOM-32 or compatible
- Minimum 4MB flash
- PSRAM recommended for larger buffers

### Sensors
- **Ultrasonic Distance Sensor**: HC-SR04 or compatible
  - TRIG: GPIO 25
  - ECHO: GPIO 26
  - Range: 20-400cm
  - Accuracy: ±3mm

- **Temperature/Humidity**: DHT22
  - Data: GPIO 27
  - Range: -40°C to 80°C
  - Accuracy: ±0.5°C

- **Accelerometer**: ADXL345
  - I2C Address: 0x53
  - SDA: GPIO 21
  - SCL: GPIO 22
  - Range: ±16g

### Pin Configuration

```
ESP32 Pin | Function          | Component
----------|-------------------|------------------
GPIO 2    | Status LED        | Built-in LED
GPIO 4    | WiFi LED          | External LED
GPIO 5    | MQTT LED          | External LED
GPIO 21   | I2C SDA           | ADXL345
GPIO 22   | I2C SCL           | ADXL345
GPIO 25   | Ultrasonic TRIG   | HC-SR04
GPIO 26   | Ultrasonic ECHO   | HC-SR04
GPIO 27   | DHT Data          | DHT22
GPIO 34   | Analog Input 1    | Reserved
GPIO 35   | Analog Input 2    | Reserved
```

## Building and Flashing

### Using PlatformIO

1. Install PlatformIO Core or IDE
2. Open project directory
3. Configure WiFi and MQTT credentials in `include/config.h`
4. Build and upload:

```bash
# Build
pio run

# Upload via USB
pio run --target upload

# Upload via OTA (after first flash)
pio run --target upload --upload-port kaldor-bbw-001.local

# Monitor serial output
pio device monitor
```

### Using Arduino IDE

1. Install ESP32 board support
2. Install required libraries (see platformio.ini)
3. Open `src/main.cpp`
4. Configure board: ESP32 Dev Module
5. Set partition scheme: Default 4MB with spiffs
6. Upload

## Configuration

Edit `include/config.h`:

```cpp
// WiFi
#define WIFI_SSID "your_network"
#define WIFI_PASSWORD "your_password"

// MQTT Broker
#define MQTT_BROKER "mqtt.example.com"
#define MQTT_PORT 8883
#define MQTT_USER "device_user"
#define MQTT_PASSWORD "device_password"

// Thresholds
#define BBW_MIN_THRESHOLD 50.0
#define BBW_MAX_THRESHOLD 200.0
```

## Calibration

1. Connect to serial monitor (115200 baud)
2. Place sensor at known reference distance (100mm)
3. Uncomment calibration code in `setup()`:
   ```cpp
   sensorManager.calibrate();
   ```
4. Upload and run
5. Note the calibration factor
6. Update `BBW_CALIBRATION_SCALE` in config.h
7. Re-upload firmware

## MQTT Topics

### Publish Topics

- `kaldor/loom/{loom_id}/bbw/raw` - High-frequency raw measurements (100Hz)
- `kaldor/loom/{loom_id}/bbw/processed` - Aggregated telemetry (1Hz)
- `kaldor/loom/{loom_id}/status` - Device status and health
- `kaldor/loom/{loom_id}/alerts` - Alert notifications

### Subscribe Topics

- `kaldor/loom/{loom_id}/config` - Configuration updates
- `kaldor/loom/{loom_id}/ota` - OTA update commands

## Message Formats

### Raw Measurement
```json
{
  "timestamp": 1234567890,
  "device_id": "BBW-A1B2C3D4",
  "bbw": 125.4,
  "quality": 95
}
```

### Processed Telemetry
```json
{
  "timestamp": 1234567890,
  "device_id": "BBW-A1B2C3D4",
  "loom_id": "LOOM-001",
  "measurements": {
    "bbw_avg": 125.4,
    "bbw_min": 123.1,
    "bbw_max": 127.8,
    "bbw_stddev": 1.2,
    "temperature": 24.5,
    "vibration": 0.3
  },
  "system": {
    "uptime": 86400,
    "free_heap": 256000,
    "wifi_rssi": -65,
    "buffer_size": 0
  }
}
```

### Alert
```json
{
  "timestamp": 1234567890,
  "device_id": "BBW-A1B2C3D4",
  "loom_id": "LOOM-001",
  "alert_type": "bbw_out_of_range",
  "value": 205.3,
  "severity": "warning"
}
```

## LED Indicators

| LED | State | Meaning |
|-----|-------|---------|
| Status | Blinking 3x | System startup |
| Status | Solid | System running |
| WiFi | Solid | Connected |
| WiFi | Off | Disconnected |
| MQTT | Solid | Connected |
| MQTT | Off | Disconnected |

## Troubleshooting

### WiFi Won't Connect
- Check SSID and password in config.h
- Verify 2.4GHz network (ESP32 doesn't support 5GHz)
- Check signal strength (RSSI should be > -80 dBm)

### MQTT Won't Connect
- Verify broker address and port
- Check username/password
- Ensure broker allows client ID format "kaldor-{device_id}"
- Verify firewall rules

### Sensor Readings Invalid
- Check sensor connections
- Verify power supply (3.3V for I2C, 5V for HC-SR04)
- Run self-test diagnostics
- Perform calibration

### Device Resets Unexpectedly
- Check power supply stability (minimum 500mA)
- Monitor serial output for exception decoder
- Increase watchdog timeout
- Check for memory leaks (free heap)

## OTA Updates

### Via Network

1. Compile new firmware
2. Host binary on web server
3. Publish MQTT message:
   ```json
   {
     "url": "http://updates.example.com/firmware.bin"
   }
   ```
   to topic: `kaldor/loom/{loom_id}/ota`

### Via ArduinoOTA

1. Ensure device is on same network
2. Use PlatformIO OTA upload:
   ```bash
   pio run --target upload --upload-port kaldor-bbw-001.local
   ```

## Development

### Adding New Sensors

1. Add pin definitions to `include/config.h`
2. Update `SensorData` struct in `include/sensors.h`
3. Implement read function in `src/sensors.cpp`
4. Update `read()` and `getAggregated()` methods
5. Update MQTT message format

### Modifying Sampling Rate

Edit `SENSOR_INTERVAL` in `src/main.cpp`:
```cpp
const unsigned long SENSOR_INTERVAL = 10;  // 100Hz
```

Note: Higher rates require more processing power and network bandwidth.

## Testing

### Unit Tests
```bash
pio test
```

### Hardware Test Mode
Uncomment in `setup()`:
```cpp
sensorManager.selfTest();
```

## License

Proprietary - Kaldor IIoT Team

## Support

For issues or questions, contact: support@kaldor-iiot.example.com
