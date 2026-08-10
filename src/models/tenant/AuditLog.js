const mongoose = require('mongoose');
const { websiteConnection } = require('../../config/connections');

// ─── Audit Log Schema ────────────────────────────────────────────────
// Append-only audit trail of admin actions.
const AuditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    adminEmail: { type: String, default: '' },
    action: { type: String, required: true },
    module: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: '' },
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      default: null,
    },
    oldData: { type: mongoose.Schema.Types.Mixed, default: {} },
    newData: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ admin: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, action: 1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });

module.exports = websiteConnection.model('AuditLog', AuditLogSchema);
