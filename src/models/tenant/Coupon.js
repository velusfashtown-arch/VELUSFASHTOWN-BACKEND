const mongoose = require('mongoose');
const { COUPON_STATUS, COUPON_TYPES } = require('../../constants');
const { websiteConnection } = require('../../config/connections');

// ─── Coupon Schema ───────────────────────────────────────────────────
const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(COUPON_TYPES),
      default: COUPON_TYPES.PERCENTAGE,
    },
    value: { type: Number, default: 0 }, // % or flat amount
    minimumOrder: { type: Number, default: 0 },
    maximumDiscount: { type: Number, default: 0 }, // 0 = unlimited
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    perCustomerLimit: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(COUPON_STATUS),
      default: COUPON_STATUS.ACTIVE,
    },
    // Applicability scope
    appliesTo: {
      websites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Website' }],
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
      customers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
    },
    description: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Note: code already has `unique: true` (auto-index).
CouponSchema.index({ status: 1, startDate: 1, endDate: 1 });
CouponSchema.index({ 'appliesTo.websites': 1 });

module.exports = websiteConnection.model('Coupon', CouponSchema);
