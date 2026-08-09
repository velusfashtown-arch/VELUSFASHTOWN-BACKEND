const BaseRepository = require('./BaseRepository');
const Website = require('../models/tenant/Website');
const WebsiteDomain = require('../models/tenant/WebsiteDomain');
const { WEBSITE_STATUS } = require('../constants');

class WebsiteRepository extends BaseRepository {
  constructor() {
    super(Website);
  }

  /**
   * Find a website by its slug (excluding soft-deleted).
   */
  async findBySlug(slug) {
    return this.findOne({ slug, isDeleted: false });
  }

  /**
   * Find a website by its primary domain.
   */
  async findByDomain(domain) {
    const normalized = String(domain || '').toLowerCase().replace(/^www\./, '');
    const domainDoc = await WebsiteDomain.findOne({
      domain: normalized,
      verified: true,
    }).lean();
    if (domainDoc) {
      return this.findOne({ _id: domainDoc.website, isDeleted: false, status: WEBSITE_STATUS.ACTIVE });
    }
    // Fallback: match the website's own domain field
    return this.findOne({
      domain: normalized,
      isDeleted: false,
      status: WEBSITE_STATUS.ACTIVE,
    });
  }

  /**
   * Resolve a website from either a slug or domain string.
   */
  async resolve(slugOrDomain) {
    if (!slugOrDomain) return null;
    const bySlug = await this.findBySlug(slugOrDomain);
    if (bySlug) return bySlug;
    return this.findByDomain(slugOrDomain);
  }

  /**
   * Get the default website (used as fallback for legacy data).
   */
  async getDefault() {
    return this.findOne({ isDefault: true, isDeleted: false });
  }

  /**
   * List all active websites (for admin website switcher).
   */
  async listActive() {
    return this.findAll(
      { isDeleted: false },
      { sort: { isDefault: -1, createdAt: 1 }, limit: 100 }
    );
  }

  /**
   * Soft delete a website.
   */
  async softDelete(id) {
    const doc = await this.model.findById(id);
    if (!doc) throw new Error('Website not found');
    return doc.softDelete();
  }
}

module.exports = new WebsiteRepository();
