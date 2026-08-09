const mongoose = require('mongoose');
const { REVIEW_STATUS } = require('../../constants');

// ─── Review Schema ───────────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.PENDING,
    },
    verifiedPurchase: { type: Boolean, default: false },
    images: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ product: 1, status: 1 });
ReviewSchema.index({ website: 1, status: 1 });
ReviewSchema.index({ product: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
