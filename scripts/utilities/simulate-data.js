#!/usr/bin/env node
/**
 * Kaldor IIoT - Data Simulator
 *
 * Generates realistic sensor data for testing and development
 */

const mqtt = require('mqtt');

// Configuration
const config = {
  broker: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  username: process.env.MQTT_USERNAME || 'kaldor_backend',
  password: process.env.MQTT_PASSWORD || 'mqtt_password',
  loomId: process.env.LOOM_ID || 'LOOM-001',
  deviceId: process.env.DEVICE_ID || 'BBW-SIMULATOR-001',
  interval: parseInt(process.env.INTERVAL || '1000'), // ms
};

console.log('╔═══════════════════════════════════════════╗');
console.log('║   Kaldor IIoT - Data Simulator           ║');
console.log('╚═══════════════════════════════════════════╝');
console.log('');
console.log(`Loom ID: ${config.loomId}`);
console.log(`Device ID: ${config.deviceId}`);
console.log(`Interval: ${config.interval}ms`);
console.log('');

// Connect to MQTT
const client = mqtt.connect(config.broker, {
  username: config.username,
  password: config.password,
});

client.on('connect', () => {
  console.log('✓ Connected to MQTT broker');
  console.log('📊 Starting data simulation...\n');

  // Start simulation
  let counter = 0;
  setInterval(() => {
    const data = generateSensorData();
    publishData(data);
    counter++;

    if (counter % 10 === 0) {
      console.log(`📈 Published ${counter} measurements`);
    }
  }, config.interval);
});

client.on('error', (error) => {
  console.error('❌ MQTT error:', error);
  process.exit(1);
});

/**
 * Generate realistic sensor data
 */
function generateSensorData() {
  // Base values with realistic variation
  const baseBBW = 125; // mm
  const baseTemp = 24; // °C
  const baseVib = 0.3; // g

  // Add realistic noise and trends
  const time = Date.now() / 1000;
  const slowTrend = Math.sin(time / 3600) * 2; // Hourly trend
  const fastNoise = (Math.random() - 0.5) * 1; // Random noise

  const bbw = baseBBW + slowTrend + fastNoise;
  const temperature = baseTemp + Math.sin(time / 7200) * 3 + (Math.random() - 0.5) * 0.5;
  const vibration = baseVib + (Math.random() - 0.5) * 0.1 + Math.abs(Math.sin(time / 60)) * 0.2;

  // Calculate statistics (simulated from rolling window)
  const stddev = 0.5 + Math.random() * 0.3;

  return {
    timestamp: Date.now(),
    device_id: config.deviceId,
    loom_id: config.loomId,
    measurements: {
      bbw_avg: parseFloat(bbw.toFixed(2)),
      bbw_min: parseFloat((bbw - stddev).toFixed(2)),
      bbw_max: parseFloat((bbw + stddev).toFixed(2)),
      bbw_stddev: parseFloat(stddev.toFixed(2)),
      temperature: parseFloat(temperature.toFixed(1)),
      vibration: parseFloat(vibration.toFixed(2)),
    },
    system: {
      uptime: Math.floor(time),
      free_heap: 256000 + Math.floor(Math.random() * 10000),
      wifi_rssi: -50 - Math.floor(Math.random() * 20),
      buffer_size: 0,
    },
  };
}

/**
 * Publish data to MQTT
 */
function publishData(data) {
  const topic = `kaldor/loom/${config.loomId}/bbw/processed`;
  const payload = JSON.stringify(data);

  client.publish(topic, payload, { qos: 0 }, (err) => {
    if (err) {
      console.error('❌ Publish error:', err);
    }
  });

  // Occasionally generate an alert
  if (Math.random() < 0.01) {
    generateAlert(data);
  }
}

/**
 * Generate test alert
 */
function generateAlert(data) {
  const alert = {
    timestamp: Date.now(),
    device_id: config.deviceId,
    loom_id: config.loomId,
    alert_type: 'bbw_out_of_range',
    value: data.measurements.bbw_avg,
    severity: 'warning',
  };

  const topic = `kaldor/loom/${config.loomId}/alerts`;
  client.publish(topic, JSON.stringify(alert), { qos: 1, retain: true });

  console.log(`⚠️  Alert generated: ${alert.alert_type}`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping simulation...');
  client.end();
  process.exit(0);
});
