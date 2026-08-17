const FormService = require('../../../services/FormService');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/response');

class FormsBuilderController {
  // Fixed list of form types (Contact Us, Product Inquiry, ...) shown as a
  // dropdown when creating/editing a form — purely a label, not tied to data.
  listTypes = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, { data: FormService.listTypes() });
  });

  list = asyncHandler(async (req, res) => {
    const forms = await FormService.listForWebsite(req.params.id);
    return ApiResponse.success(res, { data: forms });
  });

  getById = asyncHandler(async (req, res) => {
    const form = await FormService.getById(req.params.id, req.params.formId);
    return ApiResponse.success(res, { data: form });
  });

  create = asyncHandler(async (req, res) => {
    const form = await FormService.create(req.params.id, req.body);
    return ApiResponse.created(res, { data: form, message: 'Form created successfully' });
  });

  update = asyncHandler(async (req, res) => {
    const form = await FormService.update(req.params.id, req.params.formId, req.body);
    return ApiResponse.success(res, { data: form, message: 'Form updated successfully' });
  });

  delete = asyncHandler(async (req, res) => {
    await FormService.delete(req.params.id, req.params.formId);
    return ApiResponse.success(res, { message: 'Form deleted successfully' });
  });
}

module.exports = new FormsBuilderController();
