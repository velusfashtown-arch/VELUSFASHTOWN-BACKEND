const AdminRepository = require('../repositories/AdminRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateResetToken, verifyAccessToken } = require('../config/jwt');
const { sendAdminResetEmail } = require('../helpers/email');
const AppError = require('../utils/AppError');
const { ROLES } = require('../constants');

class AuthService {
  /**
   * Admin login with email and password.
   */
  async login(email, password) {
    const admin = await AdminRepository.findByEmailWithPassword(email);
    if (!admin) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!admin.isActive) {
      throw AppError.forbidden('Your account has been deactivated');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const payload = { adminId: admin._id.toString(), email: admin.email, role: admin.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in DB
    await AdminRepository.updateRefreshToken(admin._id, refreshToken);
    await AdminRepository.updateLastLogin(admin._id);

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Refresh access token using refresh token.
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const admin = await AdminRepository.findByIdWithRefreshToken(decoded.adminId);

      if (!admin || admin.refreshToken !== refreshToken) {
        throw AppError.unauthorized('Invalid refresh token');
      }

      const payload = { adminId: admin._id.toString(), email: admin.email, role: admin.role };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      await AdminRepository.updateRefreshToken(admin._id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
  }

  /**
   * Logout - clear refresh token.
   */
  async logout(adminId) {
    await AdminRepository.updateRefreshToken(adminId, null);
  }

  /**
   * Forgot password - send reset email.
   */
  async forgotPassword(email) {
    const admin = await AdminRepository.findOne({ email });
    if (!admin) {
      // Don't reveal whether email exists
      return { message: 'If this email is registered, a reset link has been sent.' };
    }

    const resetToken = generateResetToken({
      purpose: 'admin-password-reset',
      adminId: admin._id.toString(),
      email: admin.email,
    });

    // Store reset token and expiry
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();

    await sendAdminResetEmail({ email: admin.email, resetToken });

    return { message: 'If this email is registered, a reset link has been sent.' };
  }

  /**
   * Reset password using token.
   */
  async resetPassword(resetToken, newPassword) {
    let decoded;
    try {
      decoded = verifyAccessToken(resetToken);
    } catch {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    if (decoded.purpose !== 'admin-password-reset' || !decoded.email) {
      throw AppError.badRequest('Invalid reset token');
    }

    const admin = await AdminRepository.findOne({
      email: decoded.email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!admin) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return { message: 'Password has been reset successfully. You can now login.' };
  }

  /**
   * Change password (authenticated user).
   */
  async changePassword(adminId, currentPassword, newPassword) {
    const admin = await AdminRepository.findById(adminId);
    // Need to get password manually since it's select: false
    const adminWithPassword = await AdminRepository.findByEmailWithPassword(admin.email);
    if (!adminWithPassword) {
      throw AppError.notFound('Admin not found');
    }

    const isMatch = await adminWithPassword.comparePassword(currentPassword);
    if (!isMatch) {
      throw AppError.badRequest('Current password is incorrect');
    }

    adminWithPassword.password = newPassword;
    await adminWithPassword.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Get current admin profile.
   */
  async getProfile(adminId) {
    const admin = await AdminRepository.findById(adminId);
    return admin;
  }

  /**
   * Create new admin (super admin only).
   */
  async createAdmin(data) {
    const existing = await AdminRepository.findOne({ email: data.email });
    if (existing) {
      throw AppError.conflict('An admin with this email already exists');
    }

    const admin = await AdminRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || ROLES.EMPLOYEE,
      phone: data.phone || '',
    });

    return admin;
  }

  /**
   * List all admins.
   */
  async listAdmins() {
    return AdminRepository.findAll({}, { sort: { createdAt: -1 }, limit: 100 });
  }

  /**
   * Update admin.
   */
  async updateAdmin(adminId, data) {
    const admin = await AdminRepository.updateById(adminId, data);
    return admin;
  }

  /**
   * Delete admin.
   */
  async deleteAdmin(adminId) {
    await AdminRepository.deleteById(adminId);
  }
}

module.exports = new AuthService();

