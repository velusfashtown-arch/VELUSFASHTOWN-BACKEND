const SubCategoryService = require('../../../../../services/admin/products/Categories/SubCategory/SubCategoryService');
const asyncHandler = require('../../../../../utils/asyncHandler');
const ApiResponse = require('../../../../../utils/response');

// Swaps the Mongo _id for the app-generated public id — for the sub
// category itself, and for its populated `category`, so a selected
// category's id (categoryId) can be matched against a sub category's
// `category.id` on the frontend.
function cleanSubCategory(subCategory) {
  // Do not spread an unpopulated Mongo ObjectId: it serializes its internal
  // Buffer as `buffer.data`. The API exposes only the parent-category fields
  // needed by the client.
  const parentCategory = subCategory.category;
  const category = parentCategory && typeof parentCategory === 'object' && parentCategory.categoryId
    ? {
      id: parentCategory.categoryId,
      name: parentCategory.name,
      description: parentCategory.description,
    }
    : null;

  return {
    id: subCategory.subCategoryId,
    name: subCategory.name,
    description: subCategory.description,
    isActive: subCategory.isActive,
    category,
  };
}

class SubCategoryController {
  list = asyncHandler(async (req, res) => {
    const result = await SubCategoryService.listSubCategories(req.query);
    return ApiResponse.paginated(res, {
      data: result.data.map(cleanSubCategory),
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const subCategory = await SubCategoryService.getSubCategory(req.params.id);
    return ApiResponse.success(res, { data: cleanSubCategory(subCategory) });
  });

  create = asyncHandler(async (req, res) => {
    const subCategory = await SubCategoryService.createSubCategory(req.body);
    return ApiResponse.created(res, { data: cleanSubCategory(subCategory), message: 'Sub category created successfully' });
  });

  update = asyncHandler(async (req, res) => {
    const subCategory = await SubCategoryService.updateSubCategory(req.params.id, req.body);
    return ApiResponse.success(res, { data: cleanSubCategory(subCategory), message: 'Sub category updated successfully' });
  });

  toggleActive = asyncHandler(async (req, res) => {
    const subCategory = await SubCategoryService.toggleSubCategoryActive(req.params.id, req.body.isActive);
    return ApiResponse.success(res, { data: cleanSubCategory(subCategory), message: `Sub category ${req.body.isActive ? 'activated' : 'deactivated'} successfully` });
  });

  delete = asyncHandler(async (req, res) => {
    await SubCategoryService.deleteSubCategory(req.params.id);
    return ApiResponse.success(res, { message: 'Sub category deleted successfully' });
  });
}

module.exports = new SubCategoryController();
