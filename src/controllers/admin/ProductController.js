const ProductService = require('../../services/ProductService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class ProductController {
  reserveId = asyncHandler(async (req, res) => {
    const productId = await ProductService.reserveProductId();
    return ApiResponse.success(res, { data: { productId }, message: 'Product ID reserved' });
  });

  listAll = asyncHandler(async (req, res) => {
    const result = await ProductService.listAllProducts(req.query);
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const product = await ProductService.getProduct(req.params.id);
    return ApiResponse.success(res, { data: product });
  });

  create = asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.body);
    return ApiResponse.created(res, { data: product, message: 'Product created successfully' });
  });

  update = asyncHandler(async (req, res) => {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    return ApiResponse.success(res, { data: product, message: 'Product updated successfully' });
  });

  softDelete = asyncHandler(async (req, res) => {
    const product = await ProductService.softDeleteProduct(req.params.id);
    return ApiResponse.success(res, { data: product, message: 'Product moved to trash' });
  });

  restore = asyncHandler(async (req, res) => {
    const product = await ProductService.restoreProduct(req.params.id);
    return ApiResponse.success(res, { data: product, message: 'Product restored successfully' });
  });

  permanentDelete = asyncHandler(async (req, res) => {
    await ProductService.permanentDeleteProduct(req.params.id);
    return ApiResponse.success(res, { message: 'Product permanently deleted' });
  });

  publish = asyncHandler(async (req, res) => {
    const product = await ProductService.publishProduct(req.params.id);
    return ApiResponse.success(res, { data: product, message: 'Product published' });
  });

  unpublish = asyncHandler(async (req, res) => {
    const product = await ProductService.unpublishProduct(req.params.id);
    return ApiResponse.success(res, { data: product, message: 'Product unpublished' });
  });

  duplicate = asyncHandler(async (req, res) => {
    const product = await ProductService.duplicateProduct(req.params.id);
    return ApiResponse.created(res, { data: product, message: 'Product duplicated' });
  });

  bulkOperation = asyncHandler(async (req, res) => {
    const { ids, action } = req.body;
    const result = await ProductService.bulkOperation(ids, action);
    return ApiResponse.success(res, { data: result, message: `Bulk ${action} completed` });
  });

  // Flag toggles removed as per requirements
}

module.exports = new ProductController();

