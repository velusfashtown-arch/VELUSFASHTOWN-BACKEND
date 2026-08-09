const mongoose = require('mongoose');
const { APPROVAL_STATUS } = require('../../constants');

// ─── Website Product Schema ──────────────────────────────────────────
// The core multi-site join: a central Product assigned to a Website with
// website-specific presentation + approval + publishing state.
const WebsiteProductSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },

    // ─── Website-specific presentation ─────────────────────────────
    websiteTitle: { type: String, default: '' },
    websiteDescription: { type: String, default: '' },
    websitePrice: { type: Number, default: 0, min: 0 },
    websiteComparePrice: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    websiteCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
    },

    // ─── Website-specific SEO ──────────────────────────────────────
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: [{ type: String }],

    // ─── Approval / Publishing state ───────────────────────────────
    status: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.DRAFT,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.PENDING_APPROVAL,
    },
    published: { type: Boolean, default: false },

    // ─── Approval metadata ─────────────────────────────────────────
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    approvedAt: { type: Date, default: null },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound unique: a product can be assigned to a website only once ──
WebsiteProductSchema.index({ website: 1, product: 1 }, { unique: true });
WebsiteProductSchema.index({ website: 1, status: 1 });
WebsiteProductSchema.index({ website: 1, approvalStatus: 1 });
WebsiteProductSchema.index({ website: 1, published: 1 });

// Determine if a WebsiteProduct is visible on the storefront.
WebsiteProductSchema.virtual('isLive').get(function () {
  return (
    this.approvalStatus === APPROVAL_STATUS.APPROVED &&
    this.published === true &&
    this.isActive === true
  );
});

module.exports = mongoose.model('WebsiteProduct', WebsiteProductSchema);
