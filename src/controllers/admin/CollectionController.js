const CollectionService = require('../../services/CollectionService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class CollectionController {
  list = asyncHandler(async (req, res) => {
    const result = await CollectionService.listCollections(req.query);
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const collection = await CollectionService.getCollection(req.params.id);
    return ApiResponse.success(res, { data: collection });
  });

  create = asyncHandler(async (req, res) => {
    const collection = await CollectionService.createCollection(req.body);
    return ApiResponse.created(res, { data: collection, message: 'Collection created successfully' });
  });

  update = asyncHandler(async (req, res) => {
    const collection = await CollectionService.updateCollection(req.params.id, req.body);
    return ApiResponse.success(res, { data: collection, message: 'Collection updated successfully' });
  });

  delete = asyncHandler(async (req, res) => {
    await CollectionService.deleteCollection(req.params.id);
    return ApiResponse.success(res, { message: 'Collection deleted successfully' });
  });

  addProducts = asyncHandler(async (req, res) => {
    const { productIds } = req.body;
    const collection = await CollectionService.addProducts(req.params.id, productIds);
    return ApiResponse.success(res, { data: collection, message: 'Products added to collection' });
  });

  removeProducts = asyncHandler(async (req, res) => {
    const { productIds } = req.body;
    const collection = await CollectionService.removeProducts(req.params.id, productIds);
    return ApiResponse.success(res, { data: collection, message: 'Products removed from collection' });
  });
}

module.exports = new CollectionController();

