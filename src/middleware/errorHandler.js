const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/response');

/**
 * Global error handling middleware.
 * Handles Mongoose errors, JWT errors, Zod validation errors, and AppErrors.
 */
const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  // Log the error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  // ─── Mongoose Validation Error ─────────────────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiResponse.badRequest(res, {
      message: 'Validation failed',
      errors,
    });
  }

  // ─── Mongoose Cast Error (invalid ObjectId) ────────────────────────
  if (err.name === 'CastError') {
    return ApiResponse.badRequest(res, {
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // ─── Mongoose Duplicate Key Error ──────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.conflict(res, {
      message: `Duplicate value for ${field}. This ${field} already exists.`,
    });
  }

  // ─── JWT Errors ────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, { message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, { message: 'Token has expired' });
  }

  // ─── Zod Validation Error ──────────────────────────────────────────
  if (err.name === 'ZodError' || (err.issues && err.issues[0]?.code === 'invalid_type')) {
    const errors = (err.issues || []).map((e) => ({
      field: e.path?.join('.') || e.path,
      message: e.message,
    }));
    return ApiResponse.badRequest(res, {
      message: 'Validation failed',
      errors,
    });
  }

  // ─── Multer Error (file upload) ────────────────────────────────────
  if (err.name === 'MulterError') {
    return ApiResponse.badRequest(res, {
      message: `Upload error: ${err.message}`,
    });
  }

  // ─── Our Custom AppError ───────────────────────────────────────────
  if (err instanceof AppError) {
    return ApiResponse.error(res, {
      message: err.message,
      statusCode: err.statusCode,
      errors: err.errors,
    });
  }

  // ─── Default Server Error ──────────────────────────────────────────
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  return ApiResponse.error(res, {
    message,
    statusCode,
    errors: process.env.NODE_ENV === 'development' ? [{ stack: err.stack }] : [],
  });
};

module.exports = errorHandler;

