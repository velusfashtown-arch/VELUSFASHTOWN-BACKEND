const mongoose = require('mongoose');
const { websiteConnection } = require('../../config/connections');

// ─── Website Product Approval History ────────────────────────────────
// Append-only log of every assignment / approval / publish action.
const WebsiteProductApprovalSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'ASSIGN',
        'UNASSIGN',
        'APPROVE',
        'REJECT',
        'PUBLISH',
        'UNPUBLISH',
        'UPDATE',
      ],
    },
    fromStatus: { type: String, default: '' },
    toStatus: { type: String, default: '' },
    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    rejectionReason: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

WebsiteProductApprovalSchema.index({ website: 1, product: 1, createdAt: -1 });

module.exports = websiteConnection.model('WebsiteProductApproval', WebsiteProductApprovalSchema);
