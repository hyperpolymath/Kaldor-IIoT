# Kaldor IIoT - Hardware Setup Guide

Complete guide for assembling and configuring the BBW sensor board.

## Table of Contents

1. [Bill of Materials](#bill-of-materials)
2. [PCB Assembly](#pcb-assembly)
3. [Sensor Installation](#sensor-installation)
4. [Power Supply](#power-supply)
5. [Network Configuration](#network-configuration)
6. [Firmware Installation](#firmware-installation)
7. [Calibration](#calibration)
8. [Troubleshooting](#troubleshooting)

## Bill of Materials

### Core Components

| Component | Part Number | Quantity | Supplier | Notes |
|-----------|-------------|----------|----------|-------|
| ESP32 Dev Board | ESP32-WROOM-32 | 1 | Espressif | Main microcontroller |
| Ultrasonic Sensor | HC-SR04 | 1 | Generic | Distance measurement |
| Temperature/Humidity | DHT22 | 1 | Adafruit | Environmental monitoring |
| Accelerometer | ADXL345 | 1 | Adafruit | Vibration detection |
| Voltage Regulator | LM7805 | 1 | Texas Instruments | 5V regulation |
| Power Jack | DC-005 | 1 | Generic | 5.5mm x 2.1mm |

### Passive Components

| Component | Value | Quantity | Notes |
|-----------|-------|----------|-------|
| Capacitor | 100µF 25V | 2 | Power filtering |
| Capacitor | 10µF 16V | 4 | Bypass capacitors |
| Resistor | 10kΩ | 4 | Pull-up resistors |
| Resistor | 330Ω | 3 | LED current limiting |
| LED | Red | 1 | Status indicator |
| LED | Green | 1 | WiFi indicator |
| LED | Blue | 1 | MQTT indicator |

### Connectors & Hardware

- JST-XH 2.54mm connectors (4-pin) x 3
- Dupont wire set
- M3 standoffs and screws
- Enclosure (IP65 rated)
- Cable glands

## PCB Assembly

### Step 1: Component Placement

1. **Inspect PCB**: Check for defects or damage
2. **Solder Power Components**:
   - Install voltage regulator (LM7805)
   - Add power capacitors (100µF near input/output)
   - Install power jack

3. **Install ESP32**:
   - Use pin headers for removable mounting
   - Ensure proper alignment
   - Test continuity

4. **Add Passive Components**:
   - Solder resistors first
   - Then capacitors
   - Finally LEDs (observe polarity!)

### Step 2: Sensor Connections

#### Ultrasonic Sensor (HC-SR04)

```
ESP32 Pin    HC-SR04 Pin
---------    -----------
GPIO 25   →  TRIG
GPIO 26   ←  ECHO
5V        →  VCC
GND       →  GND
```

#### Temperature Sensor (DHT22)

```
ESP32 Pin    DHT22 Pin
---------    ---------
GPIO 27   →  DATA
3.3V      →  VCC
GND       →  GND
```

#### Accelerometer (ADXL345)

```
ESP32 Pin    ADXL345 Pin
---------    -----------
GPIO 21   ←→ SDA
GPIO 22   →  SCL
3.3V      →  VCC
GND       →  GND
```

## Sensor Installation

### Mounting the Ultrasonic Sensor

1. **Position**: Mount perpendicular to beam surface
2. **Distance**: 100-300mm from target
3. **Alignment**: Use laser level for accuracy
4. **Securing**: Use vibration-dampening mounts

### Installing Temperature Sensor

1. Mount away from heat sources
2. Ensure good air circulation
3. Protect from direct sunlight
4. Secure cable to prevent movement

### Accelerometer Mounting

1. Mount directly on loom frame
2. Ensure rigid attachment
3. Align axes with machine directions
4. Use threadlocker on mounting screws

## Power Supply

### Requirements

- Input: 12V DC, 2A minimum
- Consumption: ~500mA typical, 1A peak
- Connector: 5.5mm x 2.1mm barrel jack
- Protection: Reverse polarity protection recommended

### Wiring

```
Power Supply        BBW Board
------------        ---------
+12V (Red)    →     Power Jack Center Pin
GND (Black)   →     Power Jack Outer Shell
```

### Power Quality

- Use filtered power supply
- Add ferrite beads on power cable
- Keep power cables away from sensor cables
- Ground enclosure to earth ground

## Network Configuration

### WiFi Setup

1. On first boot, device creates AP: `Kaldor-BBW-XXXXXX`
2. Connect to AP (password: `kaldor2024`)
3. Navigate to `http://192.168.4.1`
4. Enter your WiFi credentials
5. Save and reboot

### Static IP (Optional)

Edit `include/config.h`:

```cpp
#define USE_STATIC_IP true
#define STATIC_IP IPAddress(192, 168, 1, 100)
#define GATEWAY IPAddress(192, 168, 1, 1)
#define SUBNET IPAddress(255, 255, 255, 0)
```

## Firmware Installation

### Using PlatformIO

1. **Install PlatformIO**: https://platformio.org/install
2. **Open project**:
   ```bash
   cd firmware
   pio run
   ```
3. **Connect ESP32** via USB
4. **Upload firmware**:
   ```bash
   pio run --target upload
   ```
5. **Monitor output**:
   ```bash
   pio device monitor
   ```

### Using Arduino IDE

1. Install ESP32 board support
2. Open `firmware/src/main.cpp`
3. Select board: "ESP32 Dev Module"
4. Set upload speed: 921600
5. Configure WiFi credentials in `config.h`
6. Upload

## Calibration

### Ultrasonic Sensor Calibration

1. **Prepare reference**:
   - Place flat target at exactly 100mm
   - Use calibrated ruler or gauge block

2. **Run calibration**:
   - Connect to serial monitor
   - Send command: `CAL_START`
   - Wait for 100 readings
   - Note calibration factor

3. **Update firmware**:
   ```cpp
   // In config.h
   #define BBW_CALIBRATION_SCALE 1.0234  // Your factor
   #define BBW_CALIBRATION_OFFSET 0.0
   ```

4. **Verify**:
   - Test at 50mm, 100mm, 150mm
   - Error should be < ±1mm

### Temperature Calibration

1. Use reference thermometer
2. Compare readings at 20°C, 25°C, 30°C
3. Apply offset if needed:
   ```cpp
   #define TEMP_CALIBRATION_OFFSET -0.5  // °C
   ```

## Installation Checklist

- [ ] All components soldered correctly
- [ ] No solder bridges or cold joints
- [ ] Power supply voltage verified (5V at ESP32)
- [ ] Sensor connections tested
- [ ] Firmware uploaded successfully
- [ ] WiFi connection established
- [ ] MQTT broker connection verified
- [ ] Sensors calibrated
- [ ] LEDs functioning correctly
- [ ] Enclosure properly sealed
- [ ] Mounting secure and stable
- [ ] Cable management complete
- [ ] Documentation updated with serial number

## Troubleshooting

### ESP32 Won't Boot

- Check power supply voltage (should be 5V)
- Verify USB cable (use data cable, not charge-only)
- Press BOOT button during upload
- Check for shorts on power rails

### WiFi Connection Fails

- Verify SSID and password
- Check 2.4GHz band (ESP32 doesn't support 5GHz)
- Move closer to access point
- Check WiFi signal strength (RSSI > -80 dBm)

### Sensor Reading Invalid

- **Ultrasonic**: Check wiring, ensure clear line of sight
- **DHT22**: Verify pull-up resistor (10kΩ)
- **ADXL345**: Check I2C address (0x53), verify SDA/SCL

### MQTT Not Connecting

- Verify broker address and port
- Check firewall rules
- Ensure credentials are correct
- Test with mosquitto_sub tool

## Safety Warnings

⚠️ **Electrical Safety**
- Always disconnect power before making changes
- Use appropriate fuse ratings
- Ensure proper grounding

⚠️ **Mechanical Safety**
- Secure all mounting hardware
- Use vibration-resistant connectors
- Protect cables from moving parts

⚠️ **Environmental**
- Verify IP rating matches environment
- Protect from excessive heat/cold
- Keep away from moisture

## Support

For technical support:
- Email: hardware@kaldor-iiot.example.com
- Documentation: https://docs.kaldor-iiot.example.com
- GitHub Issues: Report hardware problems

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
