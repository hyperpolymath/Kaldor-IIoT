/**
 * Kaldor IIoT - Database Service
 *
 * PostgreSQL/TimescaleDB connection and query management
 */

const { Pool } = require('pg');
const logger = require('./logger');

class DatabaseService {
  constructor() {
    this.pool = null;
    this.connected = false;
  }

  /**
   * Connect to database
   */
  async connect() {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'kaldor_iiot',
      user: process.env.DB_USER || 'kaldor',
      password: process.env.DB_PASSWORD,
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };

    this.pool = new Pool(config);

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.connected = true;
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('Unexpected database error:', err);
      this.connected = false;
    });
  }

  /**
   * Store measurement data
   */
  async storeMeasurement(data) {
    const query = `
      INSERT INTO bbw_measurements (
        time, loom_id, device_id, bbw_avg, bbw_min, bbw_max, bbw_stddev,
        temperature, vibration, quality_flag, metadata
      ) VALUES (
        NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
    `;

    const values = [
      data.loom_id,
      data.device_id,
      data.measurements?.bbw_avg || data.bbw,
      data.measurements?.bbw_min,
      data.measurements?.bbw_max,
      data.measurements?.bbw_stddev,
      data.measurements?.temperature,
      data.measurements?.vibration,
      data.quality || data.measurements?.quality || 100,
      JSON.stringify(data.system || {})
    ];

    try {
      await this.pool.query(query, values);
      return true;
    } catch (error) {
      logger.error('Failed to store measurement:', error);
      throw error;
    }
  }

  /**
   * Store alert
   */
  async storeAlert(data) {
    const query = `
      INSERT INTO alerts (
        loom_id, device_id, alert_type, severity, value, message, acknowledged
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const values = [
      data.loom_id,
      data.device_id,
      data.alert_type,
      data.severity || 'warning',
      data.value,
      data.message || null,
      false
    ];

    try {
      const result = await this.pool.query(query, values);
      logger.info(`Alert stored with ID: ${result.rows[0].id}`);
      return result.rows[0].id;
    } catch (error) {
      logger.error('Failed to store alert:', error);
      throw error;
    }
  }

  /**
   * Get measurements for a loom
   */
  async getMeasurements(loomId, options = {}) {
    const {
      startTime = new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime = new Date(),
      interval = '1 minute',
      limit = 1000
    } = options;

    const query = `
      SELECT
        time_bucket($1, time) AS bucket,
        loom_id,
        AVG(bbw_avg) as bbw_avg,
        MIN(bbw_min) as bbw_min,
        MAX(bbw_max) as bbw_max,
        AVG(bbw_stddev) as bbw_stddev,
        AVG(temperature) as temperature,
        AVG(vibration) as vibration,
        AVG(quality_flag) as quality
      FROM bbw_measurements
      WHERE loom_id = $2
        AND time >= $3
        AND time <= $4
      GROUP BY bucket, loom_id
      ORDER BY bucket DESC
      LIMIT $5
    `;

    try {
      const result = await this.pool.query(query, [
        interval,
        loomId,
        startTime,
        endTime,
        limit
      ]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get measurements:', error);
      throw error;
    }
  }

  /**
   * Get alerts
   */
  async getAlerts(options = {}) {
    const {
      loomId = null,
      severity = null,
      acknowledged = null,
      limit = 100,
      offset = 0
    } = options;

    let query = 'SELECT * FROM alerts WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (loomId) {
      query += ` AND loom_id = $${paramCount++}`;
      values.push(loomId);
    }

    if (severity) {
      query += ` AND severity = $${paramCount++}`;
      values.push(severity);
    }

    if (acknowledged !== null) {
      query += ` AND acknowledged = $${paramCount++}`;
      values.push(acknowledged);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);

    try {
      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get alerts:', error);
      throw error;
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId, userId) {
    const query = `
      UPDATE alerts
      SET acknowledged = true,
          acknowledged_at = NOW(),
          acknowledged_by = $2
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [alertId, userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to acknowledge alert:', error);
      throw error;
    }
  }

  /**
   * Get looms
   */
  async getLooms() {
    const query = 'SELECT * FROM looms ORDER BY name';

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get looms:', error);
      throw error;
    }
  }

  /**
   * Get loom by ID
   */
  async getLoomById(loomId) {
    const query = 'SELECT * FROM looms WHERE id = $1';

    try {
      const result = await this.pool.query(query, [loomId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get loom:', error);
      throw error;
    }
  }

  /**
   * Update loom configuration
   */
  async updateLoomConfig(loomId, config) {
    const query = `
      UPDATE looms
      SET configuration = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [loomId, JSON.stringify(config)]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update loom config:', error);
      throw error;
    }
  }

  /**
   * Execute raw query
   */
  async query(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result;
    } catch (error) {
      logger.error('Query failed:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.connected = false;
      logger.info('Database connection closed');
    }
  }
}

module.exports = new DatabaseService();
