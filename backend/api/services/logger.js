/**
 * Kaldor IIoT - Logging Service
 */

const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'kaldor-iiot-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(process.env.LOG_FILE || 'logs/kaldor-iiot.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join('logs/error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 10
    })
  ]
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
