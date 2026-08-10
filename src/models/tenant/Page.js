const mongoose = require('mongoose');
const { websiteConnection } = require('../../config/connections');

// ─── CMS Page Schema ─────────────────────────────────────────────────
const PageSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    content: { type: String, default: '' }, // HTML / rich editor content
    excerpt: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

PageSchema.index({ website: 1, slug: 1 }, { unique: true });
PageSchema.index({ website: 1, status: 1 });

module.exports = websiteConnection.model('Page', PageSchema);
