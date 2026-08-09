const mongoose = require('mongoose');

// ─── Navigation Schema ───────────────────────────────────────────────
// A named navigation menu (header / footer / mega) for a website.
const NavigationSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    location: {
      type: String,
      enum: ['header', 'footer', 'mobile', 'mega'],
      default: 'header',
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

NavigationSchema.index({ website: 1, location: 1 });

module.exports = mongoose.model('Navigation', NavigationSchema);
