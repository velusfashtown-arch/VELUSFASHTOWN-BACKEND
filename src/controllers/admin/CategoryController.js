const CategoryService = require('../../services/CategoryService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

function cleanCategory(category) {
  return {
    id: category.categoryId,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
  };
}

class CategoryController {
  list = asyncHandler(async (req, res) => {
    const result = await CategoryService.listCategories(req.query);
    const data = req.query.includeRelations === 'true'
      ? result.data.map((category) => ({ ...category, id: category.categoryId }))
      : result.data.map(cleanCategory);

    return ApiResponse.paginated(res, {
      data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getTree = asyncHandler(async (req, res) => {
    const tree = await CategoryService.getCategoryTree();
    return ApiResponse.success(res, { data: tree });
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

  delete = asyncHandler(async (req, res) => {
    await CategoryService.deleteCategory(req.params.id);
    return ApiResponse.success(res, { message: 'Category deleted successfully' });
  });

  getChildren = asyncHandler(async (req, res) => {
    const children = await CategoryService.getCategoryChildren(req.params.id);
    return ApiResponse.success(res, { data: children });
  });
}

module.exports = new CategoryController();

