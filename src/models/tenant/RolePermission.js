const mongoose = require('mongoose');
const { websiteConnection } = require('../../config/connections');

// ─── Role-Permission Schema ──────────────────────────────────────────
const RolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
    },
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

RolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

module.exports = websiteConnection.model('RolePermission', RolePermissionSchema);
