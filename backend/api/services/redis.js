/**
 * Kaldor IIoT - Redis Service
 */

const redis = require('redis');
const logger = require('./logger');

class RedisService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  async connect() {
    const config = {
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DB || '0')
    };

    this.client = redis.createClient(config);

    this.client.on('error', (err) => {
      logger.error('Redis error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      this.connected = true;
      logger.info('Redis connected');
    });

    this.client.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    await this.client.connect();
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, expirySeconds = null) {
    try {
      const stringValue = JSON.stringify(value);
      if (expirySeconds) {
        await this.client.setEx(key, expirySeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  isConnected() {
    return this.connected;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      logger.info('Redis disconnected');
    }
  }
}

module.exports = new RedisService();
