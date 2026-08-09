const WebsiteRepository = require('../repositories/WebsiteRepository');
const WebsiteDomain = require('../models/tenant/WebsiteDomain');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { WEBSITE_STATUS } = require('../constants');

class WebsiteService {
  /**
   * List all websites (admin).
   */
  async listWebsites(queryParams = {}) {
    const { search, status, page = 1, limit = 50 } = queryParams;
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
      ];
    }
    return WebsiteRepository.findAll(filter, {
      sort: { isDefault: -1, createdAt: 1 },
      page: Number(page),
      limit: Number(limit),
    });
  }

  /**
   * Get a single website by id or slug.
   */
  async getWebsite(idOrSlug) {
    const website = await WebsiteRepository.resolve(idOrSlug);
    if (!website) throw AppError.notFound('Website not found');
    return website;
  }

  /**
   * Create a new website.
   */
  async createWebsite(data) {
    const existingSlug = await WebsiteRepository.findBySlug(data.slug || data.name);
    if (existingSlug) {
      throw AppError.conflict('A website with this slug/name already exists');
    }

    const website = await WebsiteRepository.create(data);

    // If this is the first website, make it the default.
    const count = await WebsiteRepository.count({ isDeleted: false });
    if (count === 1) {
      await WebsiteRepository.updateById(website.id || website._id, { isDefault: true });
    }

    // Register primary domain if provided.
    if (data.domain) {
      await WebsiteDomain.create({
        website: website._id,
        domain: String(data.domain).toLowerCase(),
        isPrimary: true,
        verified: true,
      });
    }

    logger.info(`Website created: ${website.name}`);
    return website;
  }

  /**
   * Update a website.
   */
  async updateWebsite(id, data) {
    const existing = await WebsiteRepository.findById(id);
    if (!existing) throw AppError.notFound('Website not found');

    const updated = await WebsiteRepository.updateById(id, data);

    // If domain changed, upsert primary domain record.
    if (data.domain && data.domain !== existing.domain) {
      await WebsiteDomain.findOneAndUpdate(
        { website: id, isPrimary: true },
        { domain: String(data.domain).toLowerCase(), verified: true },
        { upsert: true, new: true }
      );
    }

    logger.info(`Website updated: ${updated.name}`);
    return updated;
  }

  /**
   * Soft delete a website.
   */
  async softDeleteWebsite(id) {
    const website = await WebsiteRepository.softDelete(id);
    logger.info(`Website soft-deleted: ${website.name}`);
    return website;
  }

  /**
   * Activate / deactivate a website.
   */
  async setStatus(id, status) {
    if (!Object.values(WEBSITE_STATUS).includes(status)) {
      throw AppError.badRequest('Invalid website status');
    }
    const website = await WebsiteRepository.updateById(id, { status });
    logger.info(`Website ${website.name} status -> ${status}`);
    return website;
  }

  /**
   * List domains for a website.
   */
  async listDomains(websiteId) {
    return WebsiteDomain.find({ website: websiteId }).lean();
  }

  /**
   * Add a custom domain to a website.
   */
  async addDomain(websiteId, domain) {
    const normalized = String(domain).toLowerCase().replace(/^www\./, '');
    const existing = await WebsiteDomain.findOne({ domain: normalized });
    if (existing) {
      throw AppError.conflict(`Domain "${normalized}" is already in use`);
    }
    const doc = await WebsiteDomain.create({
      website: websiteId,
      domain: normalized,
      isPrimary: false,
      verified: false,
    });
    logger.info(`Domain added: ${normalized}`);
    return doc;
  }

  /**
   * Remove a domain from a website.
   */
  async removeDomain(websiteId, domainId) {
    const doc = await WebsiteDomain.findOne({ _id: domainId, website: websiteId });
    if (!doc) throw AppError.notFound('Domain not found');
    if (doc.isPrimary) {
      throw AppError.badRequest('Cannot remove the primary domain. Set another domain as primary first.');
    }
    await WebsiteDomain.deleteOne({ _id: domainId });
    return { success: true };
  }

  /**
   * Set primary domain for a website.
   */
  async setPrimaryDomain(websiteId, domainId) {
    const doc = await WebsiteDomain.findOne({ _id: domainId, website: websiteId });
    if (!doc) throw AppError.notFound('Domain not found');
    await WebsiteDomain.updateMany({ website: websiteId }, { isPrimary: false });
    await WebsiteDomain.updateOne({ _id: domainId }, { isPrimary: true });
    await WebsiteRepository.updateById(websiteId, { domain: doc.domain });
    return WebsiteDomain.findOne({ _id: domainId }).lean();
  }
}

module.exports = new WebsiteService();
