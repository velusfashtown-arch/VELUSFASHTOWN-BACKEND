const mongoose = require('mongoose');
const { HOMEPAGE_SECTION_TYPES } = require('../../constants');
const { websiteConnection } = require('../../config/connections');

// ─── Homepage Section Schema ─────────────────────────────────────────
// Database-driven homepage builder. Each section has a type, settings
// (JSON) and items (JSON array) so the frontend renders dynamically.
const HomepageSectionSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(HOMEPAGE_SECTION_TYPES),
      required: true,
    },
    title: { type: String, default: '' },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    items: { type: mongoose.Schema.Types.Mixed, default: [] },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

HomepageSectionSchema.index({ website: 1, sortOrder: 1 });

module.exports = websiteConnection.model('HomepageSection', HomepageSectionSchema);
