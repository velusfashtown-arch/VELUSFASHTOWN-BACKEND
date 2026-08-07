const { authenticate, authorize, optionalAuth } = require('./auth');
const { authenticateCustomer } = require('./customerAuth');
const errorHandler = require('./errorHandler');
const { validate } = require('./validate');
const { apiLimiter, authLimiter, uploadLimiter } = require('./rateLimiter');
const requestLogger = require('./logger');
const { securityHeaders, corsMiddleware, sanitizeMongo, xssProtection } = require('./security');

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  authenticateCustomer,
  errorHandler,
  validate,
  apiLimiter,
  authLimiter,
  uploadLimiter,
  requestLogger,
  securityHeaders,
  corsMiddleware,
  sanitizeMongo,
  xssProtection,
};
