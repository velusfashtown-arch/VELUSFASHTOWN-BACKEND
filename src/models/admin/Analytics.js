const mongoose = require('mongoose');

// ─── Daily Visit Schema ─────────────────────────────────────────────────
const DailyVisitSchema = new mongoose.Schema(
  {
    date: {
      type: String, // 'YYYY-MM-DD' format
      required: true,
      unique: true,
      index: true
    },
    count: { type: Number, default: 0, min: 0 },
    uniqueIPs: { type: [String], default: [] },
    pageViews: { type: Number, default: 0 },
    // Track visits per page
    topPages: { type: Map, of: Number, default: {} }
  },
  { timestamps: true }
);

// ─── Weekly/Monthly Order Stats (aggregated) ───────────────────────────
const periodOptions = ['daily', 'weekly', 'monthly', 'yearly'];

const OrderStatsSchema = new mongoose.Schema(
  {
    period: { type: String, enum: periodOptions, required: true },
    periodKey: { type: String, required: true, index: true }, // e.g. '2025-W12', '2025-03'
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    codOrders: { type: Number, default: 0 },
    onlineOrders: { type: Number, default: 0 },
    deliveredOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    rtoOrders: { type: Number, default: 0 },
    statusBreakdown: { type: Map, of: Number, default: {} }
  },
  { timestamps: true }
);

// Compound index to prevent duplicates
OrderStatsSchema.index({ period: 1, periodKey: 1 }, { unique: true });

// ─── Export Models ──────────────────────────────────────────────────────
module.exports = {
  DailyVisit: mongoose.model('DailyVisit', DailyVisitSchema),
  OrderStats: mongoose.model('OrderStats', OrderStatsSchema)
};

