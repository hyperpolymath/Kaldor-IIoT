/**
 * Kaldor IIoT - Analytics Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../services/database');
const logger = require('../services/logger');

/**
 * @swagger
 * /api/v1/analytics/summary:
 *   get:
 *     summary: Get analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: loom_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics summary
 */
router.get('/summary', async (req, res) => {
  try {
    const { loom_id } = req.query;

    // Get summary statistics
    const query = `
      SELECT
        COUNT(*) as total_measurements,
        AVG(bbw_avg) as avg_bbw,
        MIN(bbw_min) as min_bbw,
        MAX(bbw_max) as max_bbw,
        AVG(temperature) as avg_temperature,
        AVG(vibration) as avg_vibration,
        AVG(quality_flag) as avg_quality
      FROM bbw_measurements
      WHERE loom_id = $1
        AND time >= NOW() - INTERVAL '24 hours'
    `;

    const result = await db.query(query, [loom_id]);
    const summary = result.rows[0];

    // Get alert counts
    const alertQuery = `
      SELECT
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_alerts,
        COUNT(*) FILTER (WHERE severity = 'warning') as warning_alerts,
        COUNT(*) FILTER (WHERE acknowledged = false) as unacknowledged_alerts
      FROM alerts
      WHERE loom_id = $1
        AND created_at >= NOW() - INTERVAL '24 hours'
    `;

    const alertResult = await db.query(alertQuery, [loom_id]);
    const alerts = alertResult.rows[0];

    res.json({
      success: true,
      data: {
        summary,
        alerts,
        period: '24 hours'
      }
    });
  } catch (error) {
    logger.error('Get analytics summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

module.exports = router;
