const WebsiteProductService = require('../../services/WebsiteProductService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class WebsiteProductController {
  /**
   * GET /api/admin/websites/:websiteId/products
   */
  listForWebsite = asyncHandler(async (req, res) => {
    const result = await WebsiteProductService.listForWebsite(req.params.websiteId, req.query);
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  /**
   * GET /api/admin/websites/:websiteId/products/:productId
   */
  getAssignment = asyncHandler(async (req, res) => {
    const assignment = await WebsiteProductService.getAssignment(
      req.params.websiteId,
      req.params.productId
    );
    return ApiResponse.success(res, { data: assignment });
  });

  /**
   * GET /api/admin/websites/:websiteId/products/:productId/history
   */
  getHistory = asyncHandler(async (req, res) => {
    const history = await WebsiteProductService.getHistory(
      req.params.websiteId,
      req.params.productId
    );
    return ApiResponse.success(res, { data: history });
  });

  /**
   * POST /api/admin/websites/:websiteId/products
   * Body: { productId, ...websiteConfig }
   */
  assign = asyncHandler(async (req, res) => {
    const assignment = await WebsiteProductService.assignProduct(
      req.params.websiteId,
      req.body.productId,
      req.body,
      req.adminId
    );
    return ApiResponse.created(res, {
      data: assignment,
      message: 'Product assigned to website (pending approval)',
    });
  });

  /**
   * PUT /api/admin/websites/:websiteId/products/:productId
   */
  update = asyncHandler(async (req, res) => {
    const assignment = await WebsiteProductService.updateAssignment(
      req.params.websiteId,
      req.params.productId,
      req.body,
      req.adminId
    );
    return ApiResponse.success(res, { data: assignment, message: 'Assignment updated' });
  });

  /**
   * DELETE /api/admin/websites/:websiteId/products/:productId
   */
  unassign = asyncHandler(async (req, res) => {
    const result = await WebsiteProductService.unassignProduct(
      req.params.websiteId,
      req.params.productId,
      req.adminId
    );
    return ApiResponse.success(res, { data: result, message: 'Product unassigned' });
  });

  /**
   * POST /api/admin/websites/:websiteId/products/:productId/approve
   */
  approve = asyncHandler(async (req, res) => {
    const assignment = await WebsiteProductService.approve(
      req.params.websiteId,
      req.params.productId,
      req.adminId
    );
    return ApiResponse.success(res, { data: assignment, message: 'Product approved' });
  });

  /**
   * POST /api/admin/websites/:websiteId/products/:productId/reject
   * Body: { reason }
   */
  reject = asyncHandler(async (req, res) => {
    const assignment = await WebsiteProductService.reject(
      req.params.websiteId,
      req.params.productId,
      req.body?.reason,
      req.adminId
    );
    return ApiResponse.success(res, { data: assignment, message: 'Product rejected' });
  });

  /**
   * POST /api/admin/websites/:websiteId/products/:productId/publish
   */
  publish = asyncHandler(async (req, res) => {
    const assignment = await WebsiteProductService.publish(
      req.params.websiteId,
      req.params.productId,
      req.adminId
    );
    return ApiResponse.success(res, { data: assignment, message: 'Product published' });
  });

  /**
   * POST /api/admin/websites/:websiteId/products/:productId/unpublish
   */
  unpublish = asyncHandler(async (req, res) => {
    const assignment = await WebsiteProductService.unpublish(
      req.params.websiteId,
      req.params.productId,
      req.adminId
    );
    return ApiResponse.success(res, { data: assignment, message: 'Product unpublished' });
  });

  /**
   * POST /api/admin/websites/:websiteId/products/bulk-assign
   * Body: { productIds: [] }
   */
  bulkAssign = asyncHandler(async (req, res) => {
    const result = await WebsiteProductService.bulkAssign(
      req.params.websiteId,
      req.body.productIds,
      req.adminId
    );
    return ApiResponse.success(res, { data: result, message: 'Bulk assign completed' });
  });

  /**
   * POST /api/admin/websites/:websiteId/products/bulk-approve
   */
  bulkApprove = asyncHandler(async (req, res) => {
    const result = await WebsiteProductService.bulkApprove(
      req.params.websiteId,
      req.body.productIds,
      req.adminId
    );
    return ApiResponse.success(res, { data: result, message: 'Bulk approve completed' });
  });

  /**
   * POST /api/admin/websites/:websiteId/products/bulk-publish
   */
  bulkPublish = asyncHandler(async (req, res) => {
    const result = await WebsiteProductService.bulkPublish(
      req.params.websiteId,
      req.body.productIds,
      req.adminId
    );
    return ApiResponse.success(res, { data: result, message: 'Bulk publish completed' });
  });
}

module.exports = new WebsiteProductController();
