const MasterService = require('../../../../services/admin/products/Masters/MasterService');
const asyncHandler = require('../../../../utils/asyncHandler');
const ApiResponse = require('../../../../utils/response');

function cleanMaster(field) {
  // Do not spread an unpopulated Mongo ObjectId: it serializes its internal
  // Buffer as `buffer.data`. Only expose the parent-category fields the
  // client needs to match against a selected category's id.
  const rawCategory = field.category;
  const category = rawCategory && typeof rawCategory === 'object' && rawCategory.categoryId
    ? { id: rawCategory.categoryId, name: rawCategory.name }
    : null;

  return {
    id: field.masterId,
    key: field.key,
    label: field.label,
    fieldType: field.fieldType,
    required: field.required,
    placeholder: field.placeholder,
    helpText: field.helpText,
    options: field.options,
    multiple: field.multiple,
    maxLength: field.maxLength,
    min: field.min,
    max: field.max,
    group: field.group,
    order: field.order,
    isActive: field.isActive,
    isCore: field.isCore,
    category,
  };
}

class MasterController {
  list = asyncHandler(async (req, res) => {
    const result = await MasterService.list(req.query);
    return ApiResponse.paginated(res, {
      data: result.data.map(cleanMaster),
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const field = await MasterService.getById(req.params.id);
    return ApiResponse.success(res, { data: cleanMaster(field) });
  });

  create = asyncHandler(async (req, res) => {
    const field = await MasterService.create(req.body);
    return ApiResponse.created(res, { data: cleanMaster(field), message: 'Master field created successfully' });
  });

  update = asyncHandler(async (req, res) => {
    const field = await MasterService.update(req.params.id, req.body);
    return ApiResponse.success(res, { data: cleanMaster(field), message: 'Master field updated successfully' });
  });

  delete = asyncHandler(async (req, res) => {
    await MasterService.delete(req.params.id);
    return ApiResponse.success(res, { message: 'Master field deleted successfully' });
  });
}

module.exports = new MasterController();
