const mongoose = require('mongoose');
const { OFFER_TYPES } = require('../../constants');
const { websiteConnection } = require('../../config/connections');

// ─── Offer Schema ────────────────────────────────────────────────────
// Website-specific promotional offers.
const OfferSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(OFFER_TYPES),
      default: OFFER_TYPES.PERCENT,
    },
    value: { type: Number, default: 0 }, // percent or flat value
    // Buy X Get Y
    buyQuantity: { type: Number, default: 0 },
    getQuantity: { type: Number, default: 0 },
    // Applicability
    appliesTo: {
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    },
    minimumOrder: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

OfferSchema.index({ website: 1, isActive: 1 });

module.exports = websiteConnection.model('Offer', OfferSchema);
