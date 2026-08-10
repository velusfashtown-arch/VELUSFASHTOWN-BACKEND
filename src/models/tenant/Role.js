const mongoose = require('mongoose');
const { websiteConnection } = require('../../config/connections');

// ─── Role Schema ─────────────────────────────────────────────────────
const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = websiteConnection.model('Role', RoleSchema);
