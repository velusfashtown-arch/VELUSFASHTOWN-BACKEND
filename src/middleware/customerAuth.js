const jwt = require('jsonwebtoken');
const Customer = require('../models/admin/Customers/Customer/Customer');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verify a customer JWT (website session) and attach the customer to the
 * request. Mirrors middleware/auth.js's admin `authenticate`, but for
 * website customers.
 */
const authenticateCustomer = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw AppError.unauthorized('Please sign in to continue');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Your session has expired. Please sign in again.');
    }
    throw AppError.unauthorized('Invalid session. Please sign in again.');
  }

  if (!decoded.customerId) {
    throw AppError.unauthorized('Invalid session. Please sign in again.');
  }

  const customer = await Customer.findById(decoded.customerId).select('-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpires');
  if (!customer) {
    throw AppError.unauthorized('Account not found');
  }
  if (!customer.isActive) {
    throw AppError.forbidden('Account is deactivated');
  }

req.customer = customer;
  req.customerId = customer._id.toString();
  next();
});

/**
 * Optional customer auth — attaches the customer when a valid token is
 * present, but never blocks the request. Used for guest checkout so
 * visitors can place orders without forcing registration.
 */
const optionalCustomer = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.customerId) {
      const customer = await Customer.findById(decoded.customerId).select('-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpires');
      if (customer && customer.isActive) {
        req.customer = customer;
        req.customerId = customer._id.toString();
      }
    }
  } catch {
    // Ignore invalid/expired tokens for guest checkout — just proceed.
  }

  next();
};

module.exports = { authenticateCustomer, optionalCustomer };
