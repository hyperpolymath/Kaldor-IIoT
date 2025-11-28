# Kaldor IIoT - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Monitoring Looms](#monitoring-looms)
5. [Alerts and Notifications](#alerts-and-notifications)
6. [Analytics](#analytics)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)

## Introduction

Kaldor IIoT is an advanced monitoring system designed to track and analyze the Back Beam Width (BBW) of industrial looms in real-time. The system provides:

- **Real-time monitoring** of BBW measurements
- **Automated alerts** for out-of-range conditions
- **Historical data analysis** and trends
- **Predictive maintenance** recommendations
- **Quality reporting** for production runs

## Getting Started

### Logging In

1. Navigate to the dashboard URL (e.g., `http://kaldor-iiot.local`)
2. Enter your username and password
3. Click "Sign In"

**Default Credentials** (Change immediately after first login):
- Username: `admin`
- Password: `admin123`

### First Time Setup

After logging in for the first time:

1. Change your password in Settings
2. Verify all looms are showing in the dashboard
3. Check that all sensors are reporting data
4. Configure alert thresholds for your production requirements

## Dashboard Overview

The main dashboard displays:

### Summary Cards

- **Total Looms**: Number of looms being monitored
- **Active Looms**: Looms currently in production
- **Alerts**: Number of unacknowledged alerts
- **System Health**: Overall system health percentage

### Loom Status Grid

Each loom card shows:
- Loom name and location
- Current status (Active, Idle, Warning, Error)
- Model information
- Quick status indicator

Click on any loom card to view detailed information.

## Monitoring Looms

### Loom Detail View

The loom detail page provides:

#### Real-Time Metrics

- **BBW (Current)**: Current back beam width measurement
- **Temperature**: Current environmental temperature
- **Vibration**: Vibration level (acceleration)
- **Quality**: Signal quality percentage

#### Historical Trends

- 24-hour BBW trend graph
- Min/max/average values
- Standard deviation over time

### Understanding Measurements

**BBW (Back Beam Width)**
- Normal range: 50-200 mm (configurable)
- Tolerance: ±2 mm typical
- Update frequency: 1 second

**Temperature**
- Normal range: 15-35°C
- High temperature alert: > 35°C
- Critical alert: > 40°C

**Vibration**
- Normal: < 1.0 g
- Warning: 1.0-3.0 g
- Critical: > 3.0 g

## Alerts and Notifications

### Alert Types

1. **BBW Out of Range**: Measurement outside configured thresholds
2. **High Temperature**: Environmental temperature too high
3. **Excessive Vibration**: Abnormal vibration detected
4. **Sensor Failure**: Sensor malfunction or communication loss
5. **Device Offline**: Loom sensor board not responding

### Alert Severity Levels

- **Critical** (Red): Immediate action required
- **Warning** (Yellow): Attention needed soon
- **Info** (Blue): Informational only

### Managing Alerts

To acknowledge an alert:

1. Go to the Alerts page
2. Find the alert in the list
3. Click "Acknowledge" button
4. Add a comment (optional)

### Notification Settings

Configure notifications in Settings:

- **Email Alerts**: Receive emails for critical alerts
- **SMS Alerts**: Text messages for urgent issues
- **Notification Schedule**: Set quiet hours

## Analytics

### Quality Reports

Generate quality reports for production runs:

1. Navigate to Analytics
2. Select loom and time period
3. Click "Generate Report"
4. View or download PDF

Reports include:
- Average BBW measurements
- Standard deviation
- Min/max values
- Quality score
- Recommendations

### Predictive Maintenance

The system analyzes historical data to predict maintenance needs:

- **Health Score**: 0-100 scale of loom condition
- **Trend Analysis**: Increasing/decreasing variability
- **Recommendations**: Suggested maintenance actions
- **Urgency Level**: Low/Medium/High priority

### Anomaly Detection

Automatic detection of unusual patterns:

- Statistical analysis (z-score > 3)
- Trend changes
- Unexpected variations
- Pattern recognition

## Configuration

### Loom Configuration

To configure a loom:

1. Go to loom detail page
2. Click "Configure" button
3. Adjust settings:
   - BBW thresholds (min/max)
   - Sampling rate
   - Alert sensitivity
   - Temperature limits
   - Vibration thresholds

4. Click "Save"

Configuration is sent to the device in real-time.

### User Management

Administrators can:

1. Add new users (Settings → Users → Add User)
2. Assign roles (Admin, Operator, Viewer)
3. Manage permissions
4. Reset passwords

### System Settings

- **Data Retention**: How long to keep historical data
- **Update Frequency**: Dashboard refresh rate
- **Display Units**: Metric/Imperial
- **Time Zone**: Local time zone
- **Language**: Interface language (if supported)

## Troubleshooting

### Loom Shows "Offline"

1. Check physical power to sensor board
2. Verify network connection (WiFi/Ethernet)
3. Check MQTT broker status
4. View device logs for errors

### Inaccurate Readings

1. Verify sensor calibration
2. Check sensor mounting and alignment
3. Clean sensor lenses
4. Inspect cables for damage
5. Recalibrate if necessary

### No Alerts Received

1. Check alert threshold configuration
2. Verify notification settings (email/SMS)
3. Check spam folder for email alerts
4. Verify SMTP/Twilio configuration

### Dashboard Not Updating

1. Check internet connection
2. Refresh browser page
3. Clear browser cache
4. Try different browser
5. Check for system maintenance

### Cannot Login

1. Verify username and password
2. Check Caps Lock is off
3. Try password reset
4. Contact administrator
5. Check browser cookies enabled

## Best Practices

### Daily Operations

- Check dashboard at start of shift
- Acknowledge all alerts promptly
- Monitor trends for gradual changes
- Report anomalies to maintenance

### Weekly Tasks

- Review weekly quality reports
- Check predictive maintenance scores
- Verify all looms reporting correctly
- Update configurations as needed

### Monthly Maintenance

- Clean all sensors
- Verify calibration
- Review alert thresholds
- Update firmware if available
- Backup configuration settings

## Support

### Getting Help

- **User Manual**: This document
- **FAQ**: See FAQ.md
- **Technical Support**: support@kaldor-iiot.example.com
- **Phone**: +1-234-567-8900
- **Hours**: Monday-Friday, 8AM-5PM EST

### Reporting Issues

When reporting an issue, include:

1. Loom ID and device ID
2. Description of problem
3. Steps to reproduce
4. Screenshots if applicable
5. Time and date of occurrence

## Glossary

- **BBW**: Back Beam Width
- **IIoT**: Industrial Internet of Things
- **MQTT**: Message Queuing Telemetry Transport
- **Sensor Board**: ESP32-based measurement device
- **Threshold**: Min/max acceptable value
- **Telemetry**: Remote measurement data
- **OTA**: Over-The-Air (firmware update)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**For**: Kaldor IIoT v1.0.0
