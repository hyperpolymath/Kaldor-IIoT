/**
 * Kaldor IIoT - Measurement Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../services/database');
const logger = require('../services/logger');

/**
 * @swagger
 * /api/v1/measurements:
 *   get:
 *     summary: Get measurements for a loom
 *     tags: [Measurements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: loom_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           default: "1 minute"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1000
 *     responses:
 *       200:
 *         description: Measurement data
 */
router.get('/', async (req, res) => {
  try {
    const { loom_id, start_time, end_time, interval, limit } = req.query;

    if (!loom_id) {
      return res.status(400).json({
        success: false,
        error: 'loom_id is required'
      });
    }

    const options = {
      startTime: start_time ? new Date(start_time) : undefined,
      endTime: end_time ? new Date(end_time) : undefined,
      interval: interval || '1 minute',
      limit: parseInt(limit) || 1000
    };

    const measurements = await db.getMeasurements(loom_id, options);

    res.json({
      success: true,
      data: measurements,
      count: measurements.length
    });
  } catch (error) {
    logger.error('Get measurements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve measurements'
    });
  }
});

module.exports = router;
