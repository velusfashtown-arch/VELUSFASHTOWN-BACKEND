const OrderService = require('../../services/OrderService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class OrderController {
  list = asyncHandler(async (req, res) => {
    const result = await OrderService.listOrders(req.query);
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrder(req.params.id);
    return ApiResponse.success(res, { data: order });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;
    const order = await OrderService.updateOrderStatus(req.params.id, status, notes, req.admin?.email || 'admin');
    return ApiResponse.success(res, { data: order, message: `Order status updated to ${status}` });
  });

  delete = asyncHandler(async (req, res) => {
    await OrderService.deleteOrder(req.params.id);
    return ApiResponse.success(res, { message: 'Order deleted successfully' });
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await OrderService.getOrderStats(req.query.period);
    return ApiResponse.success(res, { data: stats });
  });

  getCounts = asyncHandler(async (req, res) => {
    const counts = await OrderService.getOrderCounts();
    return ApiResponse.success(res, { data: counts });
  });
}

module.exports = new OrderController();

