const mongoose = require('mongoose');

// ─── Website Domain Schema ───────────────────────────────────────────
const WebsiteDomainSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isPrimary: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    sslStatus: {
      type: String,
      enum: ['pending', 'issued', 'expired', 'none'],
      default: 'none',
    },
    verifiedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

WebsiteDomainSchema.index({ website: 1, isPrimary: 1 });
// Note: domain already has `unique: true` (auto-index).

module.exports = mongoose.model('WebsiteDomain', WebsiteDomainSchema);
