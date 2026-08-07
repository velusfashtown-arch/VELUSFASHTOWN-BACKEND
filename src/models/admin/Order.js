const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, RTO_STATUS } = require('../../constants');

// ─── Order Item Sub-Schema ──────────────────────────────────────────────
const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    sku: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    gst: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

// ─── Order Timeline Sub-Schema ─────────────────────────────────────────
const TimelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'system' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main Order Schema ─────────────────────────────────────────────────
const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    customerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one item is required',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCharge: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.COD,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentDetails: {
      transactionId: { type: String, default: '' },
      paymentDate: { type: Date },
      paymentGateway: { type: String, default: '' },
      paymentResponse: { type: Object, default: {} },
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
    },
    timeline: [TimelineEntrySchema],

    // ─── Shipping / Courier (manual entry) ────────────────────────────
    courierName: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    awbNumber: { type: String, default: '' },
    shippedDate: { type: Date, default: null },
    deliveredDate: { type: Date, default: null },
    notes: { type: String, default: '' },

    // ─── Shiprocket (kept separate from the manual fields above so
    // hand-entered and Shiprocket-shipped orders don't collide) ───────
    shiprocket: {
      orderId: { type: String, default: '' },
      shipmentId: { type: String, default: '' },
      awbCode: { type: String, default: '' },
      courierName: { type: String, default: '' },
      labelUrl: { type: String, default: '' },
      status: { type: String, default: '' },
      pushedAt: { type: Date, default: null },
    },

    // ─── RTO Management ──────────────────────────────────────────────
    isRTO: { type: Boolean, default: false },
    rtoStatus: {
      type: String,
      enum: Object.values(RTO_STATUS),
      default: RTO_STATUS.NONE,
    },
    rtoReason: { type: String, default: '' },
    rtoDate: { type: Date, default: null },
    rtoTrackingNumber: { type: String, default: '' },
    rtoCourierName: { type: String, default: '' },
    rtoNotes: { type: String, default: '' },

    // ─── Shipping Label ──────────────────────────────────────────────
    labelUrl: { type: String, default: '' },

    // ─── Admin Notes ─────────────────────────────────────────────────
    adminNotes: { type: String, default: '' },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ 'customer.phone': 1 });

// ─── Hooks ───────────────────────────────────────────────────────────────

// Auto-add timeline entry on status change
OrderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  // Calculate due amount
  this.dueAmount = this.total - this.paidAmount;
  next();
});

// ─── Static Methods ──────────────────────────────────────────────────────

// Get orders by status
OrderSchema.statics.findByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Get orders for a customer
OrderSchema.statics.findByCustomerEmail = function (email) {
  return this.find({ 'customer.email': email }).sort({ createdAt: -1 });
};

// ─── Instance Methods ────────────────────────────────────────────────────

// Update order status with timeline entry
OrderSchema.methods.updateStatus = function (newStatus, updatedBy = 'system') {
  this.status = newStatus;
  this.timeline.push({ status: newStatus, updatedBy, timestamp: new Date() });
  return this.save();
};

// Mark as paid
OrderSchema.methods.markPaid = function (transactionId = '') {
  this.paymentStatus = PAYMENT_STATUS.PAID;
  this.paidAmount = this.total;
  this.dueAmount = 0;
  if (transactionId) {
    this.paymentDetails.transactionId = transactionId;
    this.paymentDetails.paymentDate = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('Order', OrderSchema);

