const mongoose = require('mongoose');
const { websiteConnection } = require('../../config/connections');

// ─── Banner Schema ───────────────────────────────────────────────────
// Website-specific banners with scheduling support.
const BannerSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    desktopImage: { type: String, default: '' },
    mobileImage: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonUrl: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

BannerSchema.index({ website: 1, sortOrder: 1 });
BannerSchema.index({ website: 1, status: 1 });

module.exports = websiteConnection.model('Banner', BannerSchema);
