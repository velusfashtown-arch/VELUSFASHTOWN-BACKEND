const CategoryService = require('../../../../../services/admin/products/Categories/Category/CategoryService');
const asyncHandler = require('../../../../../utils/asyncHandler');
const ApiResponse = require('../../../../../utils/response');

function cleanCategory(category) {
  return {
    id: category.categoryId,
    name: category.name,
    description: category.description,
    isActive: category.isActive,
  };
}

class CategoryController {
  list = asyncHandler(async (req, res) => {
    const result = await CategoryService.listCategories(req.query);
    return ApiResponse.paginated(res, {
      data: result.data.map(cleanCategory),
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const category = await CategoryService.getCategory(req.params.id);
    return ApiResponse.success(res, { data: cleanCategory(category) });
  });

  create = asyncHandler(async (req, res) => {
    const category = await CategoryService.createCategory(req.body);
    return ApiResponse.created(res, { data: cleanCategory(category), message: 'Category created successfully' });
  });

  update = asyncHandler(async (req, res) => {
    const category = await CategoryService.updateCategory(req.params.id, req.body);
    return ApiResponse.success(res, { data: cleanCategory(category), message: 'Category updated successfully' });
  });

  toggleActive = asyncHandler(async (req, res) => {
    const category = await CategoryService.toggleCategoryActive(req.params.id, req.body.isActive);
    return ApiResponse.success(res, { data: cleanCategory(category), message: `Category ${req.body.isActive ? 'activated' : 'deactivated'} successfully` });
  });

  delete = asyncHandler(async (req, res) => {
    await CategoryService.deleteCategory(req.params.id);
    return ApiResponse.success(res, { message: 'Category deleted successfully' });
  });
}

module.exports = new CategoryController();
