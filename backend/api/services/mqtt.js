/**
 * Kaldor IIoT - MQTT Service
 *
 * Handles MQTT broker connection and message routing
 */

const mqtt = require('mqtt');
const EventEmitter = require('events');
const logger = require('./logger');

class MQTTService extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  /**
   * Connect to MQTT broker
   */
  async connect(io) {
    const options = {
      clientId: process.env.MQTT_CLIENT_ID || 'kaldor-api-server',
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000
    };

    this.client = mqtt.connect(process.env.MQTT_BROKER_URL, options);

    this.client.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      logger.info('MQTT broker connected');

      // Subscribe to all loom topics
      this.subscribeToTopics();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });

    this.client.on('error', (error) => {
      logger.error('MQTT error:', error);
    });

    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      logger.warn(`MQTT reconnect attempt ${this.reconnectAttempts}`);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error('Max MQTT reconnect attempts reached');
        this.client.end();
      }
    });

    this.client.on('close', () => {
      this.connected = false;
      logger.warn('MQTT connection closed');
    });

    this.client.on('offline', () => {
      this.connected = false;
      logger.warn('MQTT client offline');
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MQTT connection timeout'));
      }, 30000);

      this.client.on('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.client.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Subscribe to MQTT topics
   */
  subscribeToTopics() {
    const topics = [
      'kaldor/loom/+/bbw/raw',
      'kaldor/loom/+/bbw/processed',
      'kaldor/loom/+/status',
      'kaldor/loom/+/alerts'
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          logger.info(`Subscribed to ${topic}`);
        }
      });
    });
  }

  /**
   * Handle incoming MQTT messages
   */
  handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());

      // Extract loom ID from topic
      const topicParts = topic.split('/');
      const loomId = topicParts[2];
      data.loom_id = loomId;

      // Route message based on topic
      if (topic.includes('/bbw/processed')) {
        this.emit('measurement', data);
        logger.debug(`Measurement received from ${loomId}`);
      } else if (topic.includes('/alerts')) {
        this.emit('alert', data);
        logger.info(`Alert received from ${loomId}: ${data.alert_type}`);
      } else if (topic.includes('/status')) {
        this.emit('status', data);
        logger.debug(`Status update from ${loomId}: ${data.status}`);
      } else if (topic.includes('/bbw/raw')) {
        this.emit('raw_measurement', data);
        // High-frequency data - only log occasionally
        if (Math.random() < 0.01) {
          logger.debug(`Raw measurement from ${loomId}`);
        }
      }
    } catch (error) {
      logger.error('Failed to parse MQTT message:', error);
    }
  }

  /**
   * Publish message to MQTT topic
   */
  publish(topic, payload, options = {}) {
    if (!this.connected) {
      logger.warn('Cannot publish - MQTT not connected');
      return false;
    }

    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);

    this.client.publish(topic, message, options, (err) => {
      if (err) {
        logger.error(`Failed to publish to ${topic}:`, err);
      } else {
        logger.debug(`Published to ${topic}`);
      }
    });

    return true;
  }

  /**
   * Send configuration to device
   */
  sendConfig(loomId, config) {
    const topic = `kaldor/loom/${loomId}/config`;
    return this.publish(topic, config, { qos: 1 });
  }

  /**
   * Send OTA update command
   */
  sendOTAUpdate(loomId, firmwareUrl) {
    const topic = `kaldor/loom/${loomId}/ota`;
    const payload = { url: firmwareUrl };
    return this.publish(topic, payload, { qos: 1 });
  }

  /**
   * Check if connected to broker
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Disconnect from broker
   */
  async disconnect() {
    if (this.client) {
      return new Promise((resolve) => {
        this.client.end(false, () => {
          this.connected = false;
          logger.info('MQTT client disconnected');
          resolve();
        });
      });
    }
  }
}

module.exports = new MQTTService();
