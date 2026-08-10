const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { adminConnection } = require('../../config/connections');

// ─── Address Sub-Schema ─────────────────────────────────────────────────
const AddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
  },
  { _id: true }
);

// ─── Wishlist Item Sub-Schema ───────────────────────────────────────────
const WishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main Customer Schema ───────────────────────────────────────────────
const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addresses: [AddressSchema],
    wishlist: [WishlistItemSchema],
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.otp;
        delete ret.otpExpiry;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Indexes
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ isActive: 1 });
CustomerSchema.index({ createdAt: -1 });

// Pre-save hook to hash password
CustomerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare password
CustomerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method: find by credentials
CustomerSchema.statics.findByCredentials = async function (email, password) {
  const customer = await this.findOne({ email, isActive: true }).select('+password');
  if (!customer) return null;
  const isMatch = await customer.comparePassword(password);
  if (!isMatch) return null;
  return customer;
};

module.exports = adminConnection.model('Customer', CustomerSchema);

