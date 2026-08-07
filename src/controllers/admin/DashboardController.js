const DashboardService = require('../../services/DashboardService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class DashboardController {
  getDashboard = asyncHandler(async (req, res) => {
    const data = await DashboardService.getDashboardData();
    return ApiResponse.success(res, { data, message: 'Dashboard data fetched successfully' });
  });
}

module.exports = new DashboardController();

