const WebsiteService = require('../../services/WebsiteService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class WebsiteController {
  list = asyncHandler(async (req, res) => {
    const result = await WebsiteService.listWebsites(req.query);
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  get = asyncHandler(async (req, res) => {
    const website = await WebsiteService.getWebsite(req.params.id);
    return ApiResponse.success(res, { data: website });
  });

  create = asyncHandler(async (req, res) => {
    const website = await WebsiteService.createWebsite(req.body);
    return ApiResponse.created(res, { data: website, message: 'Website created successfully' });
  });

  update = asyncHandler(async (req, res) => {
    const website = await WebsiteService.updateWebsite(req.params.id, req.body);
    return ApiResponse.success(res, { data: website, message: 'Website updated successfully' });
  });

  remove = asyncHandler(async (req, res) => {
    const website = await WebsiteService.softDeleteWebsite(req.params.id);
    return ApiResponse.success(res, { data: website, message: 'Website deactivated' });
  });

  activate = asyncHandler(async (req, res) => {
    const website = await WebsiteService.setStatus(req.params.id, 'active');
    return ApiResponse.success(res, { data: website, message: 'Website activated' });
  });

  deactivate = asyncHandler(async (req, res) => {
    const website = await WebsiteService.setStatus(req.params.id, 'inactive');
    return ApiResponse.success(res, { data: website, message: 'Website deactivated' });
  });

  // ─── Domains ─────────────────────────────────────────────────────
  listDomains = asyncHandler(async (req, res) => {
    const domains = await WebsiteService.listDomains(req.params.id);
    return ApiResponse.success(res, { data: domains });
  });

  addDomain = asyncHandler(async (req, res) => {
    const domain = await WebsiteService.addDomain(req.params.id, req.body.domain);
    return ApiResponse.created(res, { data: domain, message: 'Domain added' });
  });

  removeDomain = asyncHandler(async (req, res) => {
    const result = await WebsiteService.removeDomain(req.params.id, req.params.domainId);
    return ApiResponse.success(res, { data: result, message: 'Domain removed' });
  });

  setPrimaryDomain = asyncHandler(async (req, res) => {
    const domain = await WebsiteService.setPrimaryDomain(req.params.id, req.params.domainId);
    return ApiResponse.success(res, { data: domain, message: 'Primary domain set' });
  });
}

module.exports = new WebsiteController();
