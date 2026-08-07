const mongoose = require('mongoose');

// ─── Stock History Schema ───────────────────────────────────────────────
const InventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    type: {
      type: String,
      enum: ['purchase', 'sale', 'return', 'adjustment', 'transfer'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      default: '',
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InventorySchema.index({ product: 1, createdAt: -1 });
InventorySchema.index({ type: 1 });
InventorySchema.index({ createdAt: -1 });

// ─── Low Stock Alert Schema ─────────────────────────────────────────────
const LowStockAlertSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    currentStock: {
      type: Number,
      required: true,
    },
    alertLevel: {
      type: Number,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    notifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

LowStockAlertSchema.index({ product: 1, isResolved: 1 });
LowStockAlertSchema.index({ isResolved: 1, createdAt: -1 });

module.exports = {
  Inventory: mongoose.model('Inventory', InventorySchema),
  LowStockAlert: mongoose.model('LowStockAlert', LowStockAlertSchema),
};

