const WebsiteContentService = require('../../services/WebsiteContentService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

/**
 * WebsiteContentController
 * Admin endpoints for website-specific homepage sections, navigation, and
 * banners. All content is persisted in MongoDB and rendered dynamically.
 */
class WebsiteContentController {
  // ─── Homepage Sections ─────────────────────────────────────────────
  listHomepageSections = asyncHandler(async (req, res) => {
    const sections = await WebsiteContentService.listHomepageSections(req.params.id);
    return ApiResponse.success(res, { data: sections });
  });

  createHomepageSection = asyncHandler(async (req, res) => {
    const section = await WebsiteContentService.createHomepageSection(req.params.id, req.body);
    return ApiResponse.created(res, { data: section, message: 'Homepage section created' });
  });

  updateHomepageSection = asyncHandler(async (req, res) => {
    const section = await WebsiteContentService.updateHomepageSection(
      req.params.id,
      req.params.sectionId,
      req.body
    );
    return ApiResponse.success(res, { data: section, message: 'Homepage section updated' });
  });

  deleteHomepageSection = asyncHandler(async (req, res) => {
    const result = await WebsiteContentService.deleteHomepageSection(req.params.id, req.params.sectionId);
    return ApiResponse.success(res, { data: result, message: 'Homepage section deleted' });
  });

  duplicateHomepageSection = asyncHandler(async (req, res) => {
    const section = await WebsiteContentService.duplicateHomepageSection(req.params.id, req.params.sectionId);
    return ApiResponse.created(res, { data: section, message: 'Homepage section duplicated' });
  });

  reorderHomepageSections = asyncHandler(async (req, res) => {
    const sections = await WebsiteContentService.reorderHomepageSections(req.params.id, req.body.orderedIds);
    return ApiResponse.success(res, { data: sections, message: 'Homepage sections reordered' });
  });

  // ─── Navigation ────────────────────────────────────────────────────
  listNavigations = asyncHandler(async (req, res) => {
    const data = await WebsiteContentService.listNavigations(req.params.id);
    return ApiResponse.success(res, { data });
  });

  createNavigationItem = asyncHandler(async (req, res) => {
    const item = await WebsiteContentService.createNavigationItem(req.params.id, req.body);
    return ApiResponse.created(res, { data: item, message: 'Navigation item created' });
  });

  updateNavigationItem = asyncHandler(async (req, res) => {
    const item = await WebsiteContentService.updateNavigationItem(
      req.params.id,
      req.params.itemId,
      req.body
    );
    return ApiResponse.success(res, { data: item, message: 'Navigation item updated' });
  });

  deleteNavigationItem = asyncHandler(async (req, res) => {
    const result = await WebsiteContentService.deleteNavigationItem(req.params.id, req.params.itemId);
    return ApiResponse.success(res, { data: result, message: 'Navigation item deleted' });
  });

  reorderNavigationItems = asyncHandler(async (req, res) => {
    const items = await WebsiteContentService.reorderNavigationItems(req.params.id, req.body.orderedIds);
    return ApiResponse.success(res, { data: items, message: 'Navigation items reordered' });
  });

  // ─── Banners ───────────────────────────────────────────────────────
  listBanners = asyncHandler(async (req, res) => {
    const banners = await WebsiteContentService.listBanners(req.params.id);
    return ApiResponse.success(res, { data: banners });
  });

  createBanner = asyncHandler(async (req, res) => {
    const banner = await WebsiteContentService.createBanner(req.params.id, req.body);
    return ApiResponse.created(res, { data: banner, message: 'Banner created' });
  });

  updateBanner = asyncHandler(async (req, res) => {
    const banner = await WebsiteContentService.updateBanner(req.params.id, req.params.bannerId, req.body);
    return ApiResponse.success(res, { data: banner, message: 'Banner updated' });
  });

  deleteBanner = asyncHandler(async (req, res) => {
    const result = await WebsiteContentService.deleteBanner(req.params.id, req.params.bannerId);
    return ApiResponse.success(res, { data: result, message: 'Banner deleted' });
  });
}

module.exports = new WebsiteContentController();
