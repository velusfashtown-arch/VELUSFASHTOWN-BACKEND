const mongoose = require('mongoose');
const WebsiteProductRepository = require('../repositories/WebsiteProductRepository');
const WebsiteRepository = require('../repositories/WebsiteRepository');
const ProductRepository = require('../repositories/admin/products/Product/ProductRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { APPROVAL_STATUS } = require('../constants');

/**
 * WebsiteProductService — the heart of the multi-website product system.
 *
 * A central product is assigned to a website via a WebsiteProduct join.
 * A product is ONLY visible on the storefront when the WebsiteProduct
 * has approvalStatus = APPROVED AND published = true (the `isLive`
 * virtual on the model).
 */
class WebsiteProductService {
  /**
   * Assign a central product to a website.
   */
  async assignProduct(websiteId, productId, data = {}, adminId = null) {
    const existing = await WebsiteProductRepository.findAssignment(websiteId, productId);
    if (existing) {
      throw AppError.conflict('Product is already assigned to this website');
    }

    const assignment = await WebsiteProductRepository.create({
      website: websiteId,
      product: productId,
      websiteTitle: data.websiteTitle || '',
      websiteDescription: data.websiteDescription || '',
      websitePrice: data.websitePrice || 0,
      websiteComparePrice: data.websiteComparePrice || 0,
      featured: data.featured || false,
      displayOrder: data.displayOrder || 0,
      websiteCollection: data.websiteCollection || null,
      seoTitle: data.seoTitle || '',
      seoDescription: data.seoDescription || '',
      seoKeywords: data.seoKeywords || [],
      status: APPROVAL_STATUS.DRAFT,
      approvalStatus: APPROVAL_STATUS.PENDING_APPROVAL,
      published: false,
    });

    await WebsiteProductRepository.logAction({
      website: websiteId,
      product: productId,
      action: 'ASSIGN',
      fromStatus: '',
      toStatus: APPROVAL_STATUS.PENDING_APPROVAL,
      actionedBy: adminId,
      note: 'Product assigned to website',
    });

    logger.info(`Product ${productId} assigned to website ${websiteId}`);
    return assignment;
  }

  /**
   * Unassign a product from a website.
   */
  async unassignProduct(websiteId, productId, adminId = null) {
    const existing = await WebsiteProductRepository.findAssignment(websiteId, productId);
    if (!existing) throw AppError.notFound('Product is not assigned to this website');

    await WebsiteProductRepository.model.deleteOne({ _id: existing._id });

    await WebsiteProductRepository.logAction({
      website: websiteId,
      product: productId,
      action: 'UNASSIGN',
      fromStatus: existing.approvalStatus,
      toStatus: '',
      actionedBy: adminId,
    });

    logger.info(`Product ${productId} unassigned from website ${websiteId}`);
    return { success: true };
  }

  /**
   * Update website-specific product configuration (title, price, SEO, etc.).
   */
  async updateAssignment(websiteId, productId, data, adminId = null) {
    const existing = await WebsiteProductRepository.findAssignment(websiteId, productId);
    if (!existing) throw AppError.notFound('Product assignment not found');

    const updated = await WebsiteProductRepository.updateById(existing._id, data);

    await WebsiteProductRepository.logAction({
      website: websiteId,
      product: productId,
      action: 'UPDATE',
      fromStatus: existing.approvalStatus,
      toStatus: existing.approvalStatus,
      actionedBy: adminId,
    });

    return updated;
  }

  /**
   * Request approval — set to PENDING_APPROVAL.
   */
  async requestApproval(websiteId, productId, adminId = null) {
    const existing = await WebsiteProductRepository.findAssignment(websiteId, productId);
    if (!existing) throw AppError.notFound('Product assignment not found');

    const updated = await WebsiteProductRepository.updateById(existing._id, {
      approvalStatus: APPROVAL_STATUS.PENDING_APPROVAL,
      status: APPROVAL_STATUS.PENDING_APPROVAL,
    });

    await WebsiteProductRepository.logAction({
      website: websiteId,
      product: productId,
      action: 'ASSIGN',
      fromStatus: existing.approvalStatus,
      toStatus: APPROVAL_STATUS.PENDING_APPROVAL,
      actionedBy: adminId,
    });

    return updated;
  }

  /**
   * Approve a product for a website (approvedBy/approvedAt).
   */
  async approve(websiteId, productId, adminId = null) {
    const existing = await WebsiteProductRepository.findAssignment(websiteId, productId);
    if (!existing) throw AppError.notFound('Product assignment not found');

    const updated = await WebsiteProductRepository.updateById(existing._id, {
      approvalStatus: APPROVAL_STATUS.APPROVED,
      status: APPROVAL_STATUS.APPROVED,
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: '',
    });

    await WebsiteProductRepository.logAction({
      website: websiteId,
      product: productId,
      action: 'APPROVE',
      fromStatus: existing.approvalStatus,
      toStatus: APPROVAL_STATUS.APPROVED,
      actionedBy: adminId,
    });

    logger.info(`Product ${productId} APPROVED on website ${websiteId}`);
    return updated;
  }

  /**
   * Reject a product for a website (rejectedBy/rejectedAt/rejectionReason).
   */
  async reject(websiteId, productId, reason, adminId = null) {
    const existing = await WebsiteProductRepository.findAssignment(websiteId, productId);
    if (!existing) throw AppError.notFound('Product assignment not found');

    const updated = await WebsiteProductRepository.updateById(existing._id, {
      approvalStatus: APPROVAL_STATUS.REJECTED,
      status: APPROVAL_STATUS.REJECTED,
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason: reason || '',
      published: false,
    });

    await WebsiteProductRepository.logAction({
      website: websiteId,
      product: productId,
      action: 'REJECT',
      fromStatus: existing.approvalStatus,
      toStatus: APPROVAL_STATUS.REJECTED,
      actionedBy: adminId,
      rejectionReason: reason || '',
    });

    logger.info(`Product ${productId} REJECTED on website ${websiteId}`);
    return updated;
  }

  /**
   * Publish an approved product for a website.
   * Enforces the rule: must be APPROVED before it can be PUBLISHED.
   */
  async publish(websiteId, productId, adminId = null) {
    const existing = await WebsiteProductRepository.findAssignment(websiteId, productId);
    if (!existing) throw AppError.notFound('Product assignment not found');

    if (existing.approvalStatus !== APPROVAL_STATUS.APPROVED) {
      throw AppError.badRequest(
        `Product must be APPROVED before publishing. Current status: ${existing.approvalStatus}`
      );
    }

    const updated = await WebsiteProductRepository.updateById(existing._id, {
      approvalStatus: APPROVAL_STATUS.APPROVED,
      status: APPROVAL_STATUS.PUBLISHED,
      published: true,
    });

    await WebsiteProductRepository.logAction({
      website: websiteId,
      product: productId,
      action: 'PUBLISH',
      fromStatus: existing.status,
      toStatus: APPROVAL_STATUS.PUBLISHED,
      actionedBy: adminId,
    });

    logger.info(`Product ${productId} PUBLISHED on website ${websiteId}`);
    return updated;
  }

  /**
   * Unpublish a product for a website.
   */
  async unpublish(websiteId, productId, adminId = null) {
    const existing = await WebsiteProductRepository.findAssignment(websiteId, productId);
    if (!existing) throw AppError.notFound('Product assignment not found');

    const updated = await WebsiteProductRepository.updateById(existing._id, {
      status: APPROVAL_STATUS.UNPUBLISHED,
      published: false,
    });

    await WebsiteProductRepository.logAction({
      website: websiteId,
      product: productId,
      action: 'UNPUBLISH',
      fromStatus: existing.status,
      toStatus: APPROVAL_STATUS.UNPUBLISHED,
      actionedBy: adminId,
    });

    logger.info(`Product ${productId} UNPUBLISHED on website ${websiteId}`);
    return updated;
  }

  /**
   * List all products assigned to a website with their assignment state.
   */
  async listForWebsite(websiteId, queryParams = {}) {
    const { status, page = 1, limit = 50, search } = queryParams;
    return WebsiteProductRepository.listByWebsite(websiteId, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  /**
   * Get the full assignment + product detail for a website.
   */
  async getAssignment(websiteId, productId) {
    // `product` lives in the admin database (a separate mongoose connection
    // from WebsiteProduct/Website), so it can't be `.populate()`d directly
    // — fetched manually and attached instead.
    const assignment = await WebsiteProductRepository.model
      .findOne({ website: websiteId, product: productId })
      .populate('website')
      .lean();
    if (!assignment) throw AppError.notFound('Product not assigned to this website');
    assignment.product = await ProductRepository.model.findById(assignment.product).lean();
    return assignment;
  }

  /**
   * Get assignment history.
   */
  async getHistory(websiteId, productId) {
    return WebsiteProductRepository.getHistory(websiteId, productId);
  }

  /**
   * Bulk assign a list of products to a website.
   */
  async bulkAssign(websiteId, productIds, adminId = null) {
    const results = { assigned: [], failed: [] };
    for (const productId of productIds) {
      try {
        await this.assignProduct(websiteId, productId, {}, adminId);
        results.assigned.push(productId);
      } catch (err) {
        results.failed.push({ productId, reason: err.message });
      }
    }
    return results;
  }

  /**
   * Bulk approve a list of website-product assignments.
   */
  async bulkApprove(websiteId, productIds, adminId = null) {
    const results = { approved: [], failed: [] };
    for (const productId of productIds) {
      try {
        await this.approve(websiteId, productId, adminId);
        results.approved.push(productId);
      } catch (err) {
        results.failed.push({ productId, reason: err.message });
      }
    }
    return results;
  }

  /**
   * Bulk publish a list of website-product assignments.
   */
  async bulkPublish(websiteId, productIds, adminId = null) {
    const results = { published: [], failed: [] };
    for (const productId of productIds) {
      try {
        await this.publish(websiteId, productId, adminId);
        results.published.push(productId);
      } catch (err) {
        results.failed.push({ productId, reason: err.message });
      }
    }
    return results;
  }
}

module.exports = new WebsiteProductService();
