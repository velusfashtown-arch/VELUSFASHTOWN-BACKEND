const jwt = require('jsonwebtoken');
const Admin = require('../models/admin/Admin');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES, ROLE_HIERARCHY } = require('../constants');

/**
 * Verify JWT access token and attach admin to request.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const queryToken = req.query.token || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : queryToken || null;

  if (!token) {
    throw AppError.unauthorized('Access token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Access token has expired');
    }
    throw AppError.unauthorized('Invalid access token');
  }

  const admin = await Admin.findById(decoded.adminId).select('-password -refreshToken');
  if (!admin) {
    throw AppError.unauthorized('Admin not found');
  }
  if (!admin.isActive) {
    throw AppError.forbidden('Admin account is deactivated');
  }

  req.admin = admin;
  req.adminId = admin._id.toString();
  req.adminRole = admin.role;
  next();
});

/**
 * Authorize based on roles.
 * Usage: authorize('admin', 'manager') or authorize(['admin', 'manager'])
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      throw AppError.unauthorized('Authentication required');
    }

    const userRole = req.admin.role;
    const allowed = allowedRoles.flat();

    if (allowed.length > 0 && !allowed.includes(userRole)) {
      throw AppError.forbidden(
        `Access denied. Required role: ${allowed.join(', ')}. Your role: ${userRole}`
      );
    }

    next();
  };
};

/**
 * Authorize based on minimum role level.
 * Higher level roles can access lower level resources.
 */
const authorizeMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.admin) {
      throw AppError.unauthorized('Authentication required');
    }

    const userLevel = ROLE_HIERARCHY[req.admin.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      throw AppError.forbidden(
        `Access denied. Required minimum role: ${minRole}`
      );
    }

    next();
  };
};

/**
 * Optional authentication - doesn't throw if no token, but attaches admin if valid.
 */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).select('-password -refreshToken');
    if (admin && admin.isActive) {
      req.admin = admin;
      req.adminId = admin._id.toString();
      req.adminRole = admin.role;
    }
  } catch {
    // Token invalid, continue without admin
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  authorizeMinRole,
  optionalAuth,
};

