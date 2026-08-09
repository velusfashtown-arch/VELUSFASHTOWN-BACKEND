const BaseRepository = require('./BaseRepository');
const WebsiteProduct = require('../models/tenant/WebsiteProduct');
const WebsiteProductApproval = require('../models/tenant/WebsiteProductApproval');
const { APPROVAL_STATUS } = require('../constants');

class WebsiteProductRepository extends BaseRepository {
  constructor() {
    super(WebsiteProduct);
  }

  /**
   * Find a single assignment by website + product.
   */
  async findAssignment(websiteId, productId) {
    return this.findOne({ website: websiteId, product: productId });
  }

  /**
   * Find the live assignment for a website + product (approved + published).
   */
  async findLiveAssignment(websiteId, productId) {
    return this.findOne({
      website: websiteId,
      product: productId,
      approvalStatus: APPROVAL_STATUS.APPROVED,
      published: true,
      isActive: true,
    });
  }

  /**
   * List assignments for a website, optionally filtered by status.
   */
  async listByWebsite(websiteId, options = {}) {
    const { status, page = 1, limit = 50, populate = 'product website' } = options;
    const filter = { website: websiteId };
    if (status) filter.approvalStatus = status;
    return this.findAll(filter, { sort: { displayOrder: 1, createdAt: -1 }, page, limit, populate });
  }

  /**
   * List product IDs that are live (approved + published) for a website.
   */
  async findLiveProductIds(websiteId) {
    const docs = await this.model
      .find({
        website: websiteId,
        approvalStatus: APPROVAL_STATUS.APPROVED,
        published: true,
        isActive: true,
      })
      .select('product')
      .lean();
    return docs.map((d) => d.product);
  }

  /**
   * Log an approval/assignment action.
   */
  async logAction(payload) {
    return WebsiteProductApproval.create(payload);
  }

  /**
   * Get approval history for a website-product pair.
   */
  async getHistory(websiteId, productId) {
    return WebsiteProductApproval.find({ website: websiteId, product: productId })
      .sort({ createdAt: -1 })
      .populate('actionedBy', 'name email')
      .lean();
  }
}

module.exports = new WebsiteProductRepository();
