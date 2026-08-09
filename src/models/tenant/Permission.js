const mongoose = require('mongoose');

// ─── Permission Schema ───────────────────────────────────────────────
const PermissionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. product:create
    module: { type: String, required: true }, // e.g. product
    action: { type: String, required: true }, // e.g. create
    description: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

PermissionSchema.index({ module: 1, action: 1 });

module.exports = mongoose.model('Permission', PermissionSchema);
