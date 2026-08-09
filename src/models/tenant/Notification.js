const mongoose = require('mongoose');

// ─── Notification Schema ─────────────────────────────────────────────
const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'NEW_ORDER',
        'LOW_STOCK',
        'OUT_OF_STOCK',
        'NEW_REVIEW',
        'PAYMENT_FAILED',
        'REFUND_REQUEST',
        'RETURN_REQUEST',
      ],
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      default: null,
    },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ readBy: 1, createdAt: -1 });
NotificationSchema.index({ website: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
