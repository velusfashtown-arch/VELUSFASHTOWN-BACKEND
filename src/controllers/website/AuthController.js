const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const CustomerRepository = require('../../repositories/admin/customers/Customer/CustomerRepository');
const CustomerService = require('../../services/admin/customers/Customer/CustomerService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');
const { generateAccessToken } = require('../../config/jwt');
const { sendCustomerOtpEmail } = require('../../helpers/email');

class WebsiteAuthController {
  /**
   * POST /api/website/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    const customer = await CustomerService.register({ name, email, phone, password });
    const token = generateAccessToken({
      customerId: customer.id,
      email: customer.email,
    });
    return ApiResponse.created(res, {
      data: { token, customer },
      message: 'Registration successful',
    });
  });

  /**
   * POST /api/website/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const customer = await CustomerRepository.findByEmailWithPassword(email);
    if (!customer) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = generateAccessToken({
      customerId: customer._id.toString(),
      email: customer.email,
    });

    customer.lastLogin = new Date();
    await customer.save();

    return ApiResponse.success(res, {
      data: {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      },
      message: 'Login successful',
    });
  });

  /**
   * POST /api/website/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const customer = await CustomerRepository.findByEmail(email);
    if (!customer) {
      return ApiResponse.success(res, {
        message: 'If this email is registered, an OTP has been sent.',
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    customer.otp = otp;
    customer.otpExpiry = otpExpiry;
    await customer.save();

    try {
      await sendCustomerOtpEmail({ email, otp });
    } catch (error) {
      logger.error(`Failed to send OTP email to ${email}: ${error.message}`);
    }
    // sendCustomerOtpEmail already falls back to a console log when SMTP
    // isn't configured, so local dev keeps working either way.

    return ApiResponse.success(res, {
      message: 'If this email is registered, an OTP has been sent.',
    });
  });

  /**
   * POST /api/website/auth/verify-otp
   */
  verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const customer = await CustomerRepository.findByEmailWithOTP(email);
    if (!customer || !customer.otp || customer.otp !== otp) {
      throw AppError.badRequest('Invalid OTP');
    }
    if (customer.otpExpiry && new Date() > customer.otpExpiry) {
      throw AppError.badRequest('OTP has expired. Please request a new one.');
    }

    const resetToken = jwt.sign(
      { purpose: 'password-reset', email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    customer.otp = undefined;
    customer.otpExpiry = undefined;
    customer.isVerified = true;
    await customer.save();

    return ApiResponse.success(res, {
      data: { resetToken },
      message: 'OTP verified successfully',
    });
  });

  /**
   * POST /api/website/auth/reset-password
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { resetToken, password } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    if (decoded.purpose !== 'password-reset' || !decoded.email) {
      throw AppError.badRequest('Invalid reset token');
    }

    const customer = await CustomerRepository.findByEmail(decoded.email);
    if (!customer) throw AppError.notFound('Customer not found');

    customer.password = password;
    await customer.save();

    return ApiResponse.success(res, { message: 'Password has been reset successfully.' });
  });

  /**
   * GET /api/website/auth/me - Get current customer profile
   */
  getProfile = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, { data: req.customer });
  });

  /**
   * PUT /api/website/auth/me - Update current customer's profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    // Customers may only edit their own basic details — isActive/isVerified
    // (also accepted by CustomerService.updateCustomer for the admin route)
    // stay admin-controlled.
    const { name, phone, avatar } = req.body;
    const customer = await CustomerService.updateCustomer(req.customerId, { name, phone, avatar });
    return ApiResponse.success(res, { data: customer, message: 'Profile updated' });
  });

  /**
   * POST /api/website/auth/addresses - Add a new address
   */
  addAddress = asyncHandler(async (req, res) => {
    const { name, phone, address, landmark, city, state, pincode, type, isDefault } = req.body;
    if (!name || !phone || !address || !city || !state || !pincode) {
      throw AppError.badRequest('name, phone, address, city, state and pincode are required');
    }
    const customer = await CustomerRepository.addAddress(req.customerId, {
      name, phone, address, landmark: landmark || '', city, state, pincode,
      type: type || 'home',
      isDefault: Boolean(isDefault),
    });
    return ApiResponse.created(res, { data: customer, message: 'Address added' });
  });

  /**
   * PUT /api/website/auth/addresses/:addressId - Update an address
   */
  updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const { name, phone, address, landmark, city, state, pincode, type, isDefault } = req.body;
    const customer = await CustomerRepository.updateAddress(req.customerId, addressId, {
      // The repository does a positional `$set` on the whole sub-document,
      // which (with no schema validation on findOneAndUpdate) would drop
      // the address's _id if it isn't included in the replacement.
      _id: addressId,
      name, phone, address, landmark: landmark || '', city, state, pincode,
      type: type || 'home',
      isDefault: Boolean(isDefault),
    });
    if (!customer) throw AppError.notFound('Address not found');
    return ApiResponse.success(res, { data: customer, message: 'Address updated' });
  });

  /**
   * DELETE /api/website/auth/addresses/:addressId - Remove an address
   */
  deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const customer = await CustomerRepository.removeAddress(req.customerId, addressId);
    if (!customer) throw AppError.notFound('Customer not found');
    return ApiResponse.success(res, { data: customer, message: 'Address removed' });
  });
}

module.exports = new WebsiteAuthController();

