const AuthService = require('../../../services/admin/auth/AuthService');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/response');

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return ApiResponse.success(res, { data: result, message: 'Login successful' });
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    return ApiResponse.success(res, { message: result.message });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { resetToken, password } = req.body;
    const result = await AuthService.resetPassword(resetToken, password);
    return ApiResponse.success(res, { message: result.message });
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.adminId || req.admin?.id || req.admin?._id;
    const result = await AuthService.changePassword(adminId, currentPassword, newPassword);
    return ApiResponse.success(res, { message: result.message });
  });
}

module.exports = new AuthController();
