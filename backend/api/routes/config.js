/**
 * Kaldor IIoT - Configuration Routes
 */

const express = require('express');
const router = express.Router();
const mqtt = require('../services/mqtt');
const logger = require('../services/logger');

/**
 * @swagger
 * /api/v1/config/ota:
 *   post:
 *     summary: Trigger OTA update for a device
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loom_id
 *               - firmware_url
 *             properties:
 *               loom_id:
 *                 type: string
 *               firmware_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTA update triggered
 */
router.post('/ota', async (req, res) => {
  try {
    const { loom_id, firmware_url } = req.body;

    if (!loom_id || !firmware_url) {
      return res.status(400).json({
        success: false,
        error: 'loom_id and firmware_url are required'
      });
    }

    // Send OTA update command
    const sent = mqtt.sendOTAUpdate(loom_id, firmware_url);

    if (sent) {
      logger.info(`OTA update triggered for loom ${loom_id}`);

      res.json({
        success: true,
        message: 'OTA update command sent'
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'MQTT not connected'
      });
    }
  } catch (error) {
    logger.error('OTA update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger OTA update'
    });
  }
});

module.exports = router;
