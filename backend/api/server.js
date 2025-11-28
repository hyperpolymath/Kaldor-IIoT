/**
 * Kaldor IIoT - Main API Server
 *
 * Provides REST API and WebSocket services for the IIoT platform
 *
 * @author Kaldor IIoT Team
 * @version 1.0.0
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Load environment variables
require('dotenv').config();

// Import services
const mqttService = require('./services/mqtt');
const dbService = require('./services/database');
const redisService = require('./services/redis');
const logger = require('./services/logger');

// Import routes
const authRoutes = require('./routes/auth');
const loomRoutes = require('./routes/looms');
const measurementRoutes = require('./routes/measurements');
const alertRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');
const configRoutes = require('./routes/config');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kaldor IIoT API',
      version: '1.0.0',
      description: 'REST API for Kaldor IIoT Platform',
      contact: {
        name: 'Kaldor IIoT Team',
        email: 'support@kaldor-iiot.example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.kaldor-iiot.example.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbService.isConnected(),
      redis: redisService.isConnected(),
      mqtt: mqttService.isConnected()
    }
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/looms', authMiddleware, loomRoutes);
app.use('/api/v1/measurements', authMiddleware, measurementRoutes);
app.use('/api/v1/alerts', authMiddleware, alertRoutes);
app.use('/api/v1/analytics', authMiddleware, analyticsRoutes);
app.use('/api/v1/config', authMiddleware, configRoutes);

// Error handling
app.use(errorHandler);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  // Authenticate socket connection
  socket.on('authenticate', async (token) => {
    try {
      const user = authMiddleware.verifyToken(token);
      socket.user = user;
      socket.authenticated = true;
      socket.emit('authenticated', { success: true });
      logger.info(`Socket ${socket.id} authenticated as ${user.username}`);
    } catch (error) {
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
      socket.disconnect();
    }
  });

  // Subscribe to loom updates
  socket.on('subscribe:loom', (loomId) => {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    socket.join(`loom:${loomId}`);
    logger.info(`Socket ${socket.id} subscribed to loom ${loomId}`);
    socket.emit('subscribed', { loomId });
  });

  // Unsubscribe from loom updates
  socket.on('unsubscribe:loom', (loomId) => {
    socket.leave(`loom:${loomId}`);
    logger.info(`Socket ${socket.id} unsubscribed from loom ${loomId}`);
    socket.emit('unsubscribed', { loomId });
  });

  socket.on('disconnect', () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
});

// Make io available to other modules
app.set('io', io);

// Initialize services
async function initializeServices() {
  try {
    // Connect to database
    await dbService.connect();
    logger.info('Database connected');

    // Connect to Redis
    await redisService.connect();
    logger.info('Redis connected');

    // Connect to MQTT broker
    await mqttService.connect(io);
    logger.info('MQTT broker connected');

    // Setup MQTT message handlers
    mqttService.on('measurement', (data) => {
      // Broadcast to connected WebSocket clients
      io.to(`loom:${data.loom_id}`).emit('measurement:update', data);

      // Store in database (async, non-blocking)
      dbService.storeMeasurement(data).catch(err => {
        logger.error('Failed to store measurement:', err);
      });
    });

    mqttService.on('alert', (data) => {
      io.to(`loom:${data.loom_id}`).emit('alert:new', data);

      // Store alert and trigger notifications
      dbService.storeAlert(data).catch(err => {
        logger.error('Failed to store alert:', err);
      });
    });

    mqttService.on('status', (data) => {
      io.to(`loom:${data.loom_id}`).emit('status:change', data);
    });

    logger.info('All services initialized successfully');

  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 3000;

initializeServices().then(() => {
  server.listen(PORT, () => {
    logger.info(`
╔═══════════════════════════════════════════╗
║     Kaldor IIoT API Server v1.0.0         ║
╚═══════════════════════════════════════════╝

Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
API Documentation: http://localhost:${PORT}/api-docs

Press Ctrl+C to stop
    `);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  server.close(async () => {
    logger.info('HTTP server closed');

    // Close all connections
    await mqttService.disconnect();
    await redisService.disconnect();
    await dbService.disconnect();

    logger.info('All connections closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');

  server.close(async () => {
    logger.info('HTTP server closed');

    await mqttService.disconnect();
    await redisService.disconnect();
    await dbService.disconnect();

    logger.info('All connections closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
