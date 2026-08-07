const morgan = require('morgan');
const logger = require('../utils/logger');

// Stream for Morgan to use Winston
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Skip logging in test environment
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Build the morgan middleware
const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = requestLogger;
