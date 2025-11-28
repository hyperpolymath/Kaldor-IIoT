/**
 * Kaldor IIoT - Loom Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../services/database');
const mqtt = require('../services/mqtt');
const logger = require('../services/logger');

/**
 * @swagger
 * /api/v1/looms:
 *   get:
 *     summary: Get all looms
 *     tags: [Looms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of looms
 */
router.get('/', async (req, res) => {
  try {
    const looms = await db.getLooms();

    res.json({
      success: true,
      data: looms
    });
  } catch (error) {
    logger.error('Get looms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve looms'
    });
  }
});

/**
 * @swagger
 * /api/v1/looms/{id}:
 *   get:
 *     summary: Get loom by ID
 *     tags: [Looms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loom details
 *       404:
 *         description: Loom not found
 */
router.get('/:id', async (req, res) => {
  try {
    const loom = await db.getLoomById(req.params.id);

    if (!loom) {
      return res.status(404).json({
        success: false,
        error: 'Loom not found'
      });
    }

    res.json({
      success: true,
      data: loom
    });
  } catch (error) {
    logger.error('Get loom error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve loom'
    });
  }
});

/**
 * @swagger
 * /api/v1/looms/{id}/config:
 *   post:
 *     summary: Update loom configuration
 *     tags: [Looms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuration updated
 */
router.post('/:id/config', async (req, res) => {
  try {
    const loomId = req.params.id;
    const config = req.body;

    // Update in database
    const loom = await db.updateLoomConfig(loomId, config);

    // Send config to device via MQTT
    mqtt.sendConfig(loomId, config);

    logger.info(`Configuration updated for loom ${loomId}`);

    res.json({
      success: true,
      data: loom
    });
  } catch (error) {
    logger.error('Update config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration'
    });
  }
});

module.exports = router;
