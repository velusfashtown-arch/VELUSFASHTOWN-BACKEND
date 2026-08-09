const { authenticate, authorize, optionalAuth } = require('./auth');
const { authenticateCustomer, optionalCustomer } = require('./customerAuth');
const { resolveWebsite, optionalResolveWebsite } = require('./resolveWebsite');
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
  optionalCustomer,
  resolveWebsite,
  optionalResolveWebsite,
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
