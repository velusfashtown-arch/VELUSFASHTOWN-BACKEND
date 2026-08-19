const FormSubmissionService = require('../../../../services/admin/forms/FormSubmission/FormSubmissionService');
const asyncHandler = require('../../../../utils/asyncHandler');
const ApiResponse = require('../../../../utils/response');

class FormSubmissionController {
  list = asyncHandler(async (req, res) => {
    const result = await FormSubmissionService.listForWebsite(req.params.id, {
      ...req.query,
      formId: req.params.formId || req.query.formId,
    });
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const submission = await FormSubmissionService.getById(req.params.id, req.params.submissionId);
    return ApiResponse.success(res, { data: submission });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const submission = await FormSubmissionService.updateStatus(req.params.id, req.params.submissionId, req.body.status);
    return ApiResponse.success(res, { data: submission, message: 'Submission updated' });
  });

  delete = asyncHandler(async (req, res) => {
    await FormSubmissionService.delete(req.params.id, req.params.submissionId);
    return ApiResponse.success(res, { message: 'Submission deleted' });
  });
}

module.exports = new FormSubmissionController();
