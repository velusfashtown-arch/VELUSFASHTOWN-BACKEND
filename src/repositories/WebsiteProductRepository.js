const BaseRepository = require('./BaseRepository');
const WebsiteProduct = require('../models/tenant/WebsiteProduct');
const WebsiteProductApproval = require('../models/tenant/WebsiteProductApproval');
const Product = require('../models/admin/Products/Product/Product');
const Auth = require('../models/admin/auth/auth');
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
   *
   * `product` lives in the admin database (a separate mongoose connection
   * from WebsiteProduct), so it's batch-fetched and attached manually
   * instead of via `.populate()`.
   */
  async listByWebsite(websiteId, options = {}) {
    const { status, page = 1, limit = 50, populate = 'website' } = options;
    const filter = { website: websiteId };
    if (status) filter.approvalStatus = status;
    const result = await this.findAll(filter, { sort: { displayOrder: 1, createdAt: -1 }, page, limit, populate });

    const productIds = [...new Set(result.data.map((d) => String(d.product)).filter(Boolean))];
    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } }).lean();
      const productMap = new Map(products.map((p) => [String(p._id), p]));
      result.data = result.data.map((d) => ({ ...d, product: productMap.get(String(d.product)) || d.product }));
    }
    return result;
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
   *
   * `actionedBy` refs Auth, which lives in the admin database (a separate
   * mongoose connection from WebsiteProductApproval), so it's batch-fetched
   * and attached manually instead of via `.populate()`.
   */
  async getHistory(websiteId, productId) {
    const history = await WebsiteProductApproval.find({ website: websiteId, product: productId })
      .sort({ createdAt: -1 })
      .lean();

    const adminIds = [...new Set(history.map((h) => String(h.actionedBy)).filter(Boolean))];
    const admins = adminIds.length > 0
      ? await Auth.find({ _id: { $in: adminIds } }).select('name email').lean()
      : [];
    const adminMap = new Map(admins.map((a) => [String(a._id), a]));

    return history.map((h) => ({ ...h, actionedBy: adminMap.get(String(h.actionedBy)) || h.actionedBy }));
  }
}

module.exports = new WebsiteProductRepository();
