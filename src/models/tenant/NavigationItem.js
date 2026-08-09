const mongoose = require('mongoose');
const { NAVIGATION_TYPES } = require('../../constants');

// ─── Navigation Item Schema ──────────────────────────────────────────
// A single menu entry, optionally nested under a parent (mega menu).
const NavigationItemSchema = new mongoose.Schema(
  {
    navigation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Navigation',
      required: true,
      index: true,
    },
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NavigationItem',
      default: null,
      index: true,
    },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(NAVIGATION_TYPES),
      default: NAVIGATION_TYPES.CUSTOM_URL,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    url: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

NavigationItemSchema.index({ navigation: 1, sortOrder: 1 });
NavigationItemSchema.index({ website: 1, parent: 1 });

module.exports = mongoose.model('NavigationItem', NavigationItemSchema);
