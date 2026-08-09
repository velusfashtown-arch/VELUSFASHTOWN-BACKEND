const WebsiteRepository = require('../repositories/WebsiteRepository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * resolveWebsite middleware.
 *
 * Resolves the current website from the request in this order:
 *   1. Explicit :websiteSlug param (e.g. /api/storefront/:websiteSlug/...)
 *   2. Hostname / custom domain (multi-domain support)
 *   3. Development fallback: /store/:slug path prefix
 *   4. Default website
 *
 * Attaches `req.website` (the Website document) and `req.websiteId`.
 */
const resolveWebsite = asyncHandler(async (req, res, next) => {
  let website = null;

  // 1. Explicit slug in params
  const slugParam = req.params.websiteSlug || req.params.slug;
  const storePath = req.path.match(/^\/store\/([^/]+)/);

  if (slugParam) {
    website = await WebsiteRepository.resolve(slugParam);
  }

  // 2. Hostname / custom domain
  if (!website && req.hostname && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
    website = await WebsiteRepository.findByDomain(req.hostname);
  }

  // 3. Development fallback /store/:slug
  if (!website && storePath) {
    website = await WebsiteRepository.findBySlug(storePath[1]);
  }

  // 4. Default website as last resort
  if (!website) {
    website = await WebsiteRepository.getDefault();
  }

  if (!website) {
    throw AppError.notFound('Website not found');
  }

  req.website = website;
  req.websiteId = website.id || website._id;
  next();
});

/**
 * Optional resolve — attaches website if resolvable but never throws.
 * Used for public routes that should still work without a website context.
 */
const optionalResolveWebsite = asyncHandler(async (req, res, next) => {
  try {
    const slugParam = req.params.websiteSlug || req.params.slug;
    let website = slugParam
      ? await WebsiteRepository.resolve(slugParam)
      : null;

    if (!website && req.hostname && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
      website = await WebsiteRepository.findByDomain(req.hostname);
    }

    if (!website) website = await WebsiteRepository.getDefault();

    if (website) {
      req.website = website;
      req.websiteId = website.id || website._id;
    }
  } catch {
    // ignore — leave req.website unset
  }
  next();
});

module.exports = { resolveWebsite, optionalResolveWebsite };
