const OrderService = require('../../services/admin/orders/Order/OrderService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class WebsiteOrderController {
  /**
   * POST /api/website/orders - Place a new order
   */
  placeOrder = asyncHandler(async (req, res) => {
    const order = await OrderService.placeOrder({ ...req.body, customerRef: req.customerId });
    return ApiResponse.created(res, {
      data: order,
      message: 'Order placed successfully',
    });
  });

  /**
   * GET /api/website/orders/mine - List the signed-in customer's orders
   */
  listMyOrders = asyncHandler(async (req, res) => {
    const result = await OrderService.listOrders({ ...req.query, customerRef: req.customerId });
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  /**
   * GET /api/website/orders/:id - Get order by ID
   */
  getOrder = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrder(req.params.id);
    return ApiResponse.success(res, { data: order });
  });

  /**
   * GET /api/website/orders - List orders (by customer email)
   */
  listOrders = asyncHandler(async (req, res) => {
    const result = await OrderService.listOrders({ ...req.query });
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  /**
   * POST /api/website/orders/track - Track order by order number
   */
  trackOrder = asyncHandler(async (req, res) => {
    const { orderNumber } = req.body;
    const result = await OrderService.listOrders({ search: orderNumber, limit: 1 });
    if (!result.data || result.data.length === 0) {
      return ApiResponse.notFound(res, { message: 'Order not found' });
    }
    return ApiResponse.success(res, { data: result.data[0] });
  });
}

module.exports = new WebsiteOrderController();

