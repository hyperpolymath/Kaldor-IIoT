/**
 * Kaldor IIoT - Alert Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../services/database');
const logger = require('../services/logger');

/**
 * @swagger
 * /api/v1/alerts:
 *   get:
 *     summary: Get alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: loom_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *       - in: query
 *         name: acknowledged
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/', async (req, res) => {
  try {
    const options = {
      loomId: req.query.loom_id,
      severity: req.query.severity,
      acknowledged: req.query.acknowledged === 'true' ? true :
                    req.query.acknowledged === 'false' ? false : null,
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0
    };

    const alerts = await db.getAlerts(options);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alerts'
    });
  }
});

/**
 * @swagger
 * /api/v1/alerts/{id}/acknowledge:
 *   post:
 *     summary: Acknowledge an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alert acknowledged
 */
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const userId = req.user.id;

    const alert = await db.acknowledgeAlert(alertId, userId);

    logger.info(`Alert ${alertId} acknowledged by user ${userId}`);

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge alert'
    });
  }
});

module.exports = router;
