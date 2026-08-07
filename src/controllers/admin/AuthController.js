const AuthService = require('../../services/AuthService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return ApiResponse.success(res, { data: result, message: 'Login successful' });
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    return ApiResponse.success(res, { data: result, message: 'Token refreshed' });
  });

  logout = asyncHandler(async (req, res) => {
    const adminId = req.adminId || req.admin?.id || req.admin?._id;
    await AuthService.logout(adminId);
    return ApiResponse.success(res, { message: 'Logged out successfully' });
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

  getProfile = asyncHandler(async (req, res) => {
    const adminId = req.adminId || req.admin?.id || req.admin?._id;
    const admin = await AuthService.getProfile(adminId);
    return ApiResponse.success(res, { data: admin });
  });

  createAdmin = asyncHandler(async (req, res) => {
    const admin = await AuthService.createAdmin(req.body);
    return ApiResponse.created(res, { data: admin, message: 'Admin created successfully' });
  });

  listAdmins = asyncHandler(async (req, res) => {
    const result = await AuthService.listAdmins();
    return ApiResponse.success(res, { data: result.data });
  });

  updateAdmin = asyncHandler(async (req, res) => {
    const admin = await AuthService.updateAdmin(req.params.id, req.body);
    return ApiResponse.success(res, { data: admin, message: 'Admin updated successfully' });
  });

  deleteAdmin = asyncHandler(async (req, res) => {
    await AuthService.deleteAdmin(req.params.id);
    return ApiResponse.success(res, { message: 'Admin deleted successfully' });
  });
}

module.exports = new AuthController();

