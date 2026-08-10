const AdminRepository = require('../../../repositories/AuthRepository');
const { generateAccessToken, generateResetToken, verifyAccessToken } = require('../../../config/jwt');
const { sendAdminResetEmail } = require('../../../helpers/email');
const AppError = require('../../../utils/AppError');

class AuthService {
  /*Admin login with email and password.*/
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

    const payload = { adminId: admin._id.toString(), email: admin.email, role: admin.role };
    const token = generateAccessToken(payload);
    await AdminRepository.updateLastLogin(admin._id, token);

    return {
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /*Forgot password - send reset email.*/
  async forgotPassword(email) {
    const admin = await AdminRepository.findByEmail(email);
    if (!admin) {
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

  /*Reset password using token.*/
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

    const admin = await AdminRepository.findByEmail(decoded.email);
    if (
      !admin ||
      admin.resetPasswordToken !== resetToken ||
      !admin.resetPasswordExpires ||
      new Date() > new Date(admin.resetPasswordExpires)
    ) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return { message: 'Password has been reset successfully. You can now login.' };
  }

  /*Change password (authenticated user).*/
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
}

module.exports = new AuthService();