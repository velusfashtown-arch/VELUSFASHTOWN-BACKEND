const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const { STOCK_STATUS, PRODUCT_STATUS } = require('../../../../constants');
const { adminConnection } = require('../../../../config/connections');

function generateVariantId() {
  return `VAR-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

// ─── Video Sub-Schema ───────────────────────────────────────────────────
const VideoSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    type: {
      type: String,
      enum: ['upload', 'youtube', 'instagram'],
      default: 'upload',
    },
    thumbnail: { type: String, default: '' },
  },
  { _id: false }
);

// ─── Image Sub-Schema ───────────────────────────────────────────────────
const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
    isMain: { type: Boolean, default: false },
  },
  { _id: false }
);

// ─── Variant Sub-Schema ─────────────────────────────────────────────────
const VariantSchema = new mongoose.Schema(
  {
    variantId: {
      type: String,
      required: true,
      immutable: true,
      default: generateVariantId,
    },
    sku: { type: String, default: '' },
    color: { type: String, default: '' },
    price: { type: Number, default: 0, min: 0 },
    mrp: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [ImageSchema],
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

// ─── Main Product Schema ────────────────────────────────────────────────
const ProductSchema = new mongoose.Schema(
  {
    // ─── Core Fields ──────────────────────────────────────────────────
    productId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 500,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      sparse: true,
    },
    description: { type: String, default: '', maxlength: 5000 },
    shortDescription: { type: String, default: '', maxlength: 300 },

    // ─── Pricing ──────────────────────────────────────────────────────
    mrp: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, default: 0, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    gst: { type: Number, default: 0, min: 0, max: 100 },
    profitMargin: { type: Number, default: 0 },

    // ─── Categorization ───────────────────────────────────────────────
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', default: null },

    // ─── Inventory ────────────────────────────────────────────────────
    stock: { type: Number, default: 0, min: 0 },
    lowStockAlert: { type: Number, default: 5, min: 0 },
    stockStatus: {
      type: String,
      enum: Object.values(STOCK_STATUS),
      default: STOCK_STATUS.OUT_OF_STOCK,
    },

    // ─── Product Details ──────────────────────────────────────────────
    countryOfOrigin: { type: String, default: 'India' },
    manufacturer: { type: String, default: '' },
    packer: { type: String, default: '' },

    // ─── Images ───────────────────────────────────────────────────────
    mainImage: { type: String, default: '' },
    images: [ImageSchema],

    // ─── Videos ───────────────────────────────────────────────────────
    productVideo: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    instagramReelUrl: { type: String, default: '' },

    // ─── Variants ─────────────────────────────────────────────────────
    hasVariants: { type: Boolean, default: false },
    variants: [VariantSchema],

    // ─── Custom Fields ────────────────────────────────────────────────
    // Admin-defined extra fields (see the Master model) — kept as a
    // flexible key/value list instead of fixed schema columns, so adding
    // a new field from the admin never needs a schema migration.
    customFields: {
      type: [{ key: String, value: mongoose.Schema.Types.Mixed, _id: false }],
      default: [],
    },

    // ─── Tags ─────────────────────────────────────────────────────────
    tags: [{ type: String, lowercase: true, trim: true }],

    // ─── Status ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
    },
    isActive: { type: Boolean, default: true },

    // ─── Soft Delete ──────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    // ─── Meta ─────────────────────────────────────────────────────────
    totalSold: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: false,
    suppressReservedKeysWarning: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────
// Note: productId already has a unique index from its field definition
// below — that single-key index serves a `{ productId: -1 }` sort just
// as well, so no separate index is declared for it here.
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isDeleted: 1, isActive: 1 });
ProductSchema.index({ sellingPrice: 1 });
ProductSchema.index({ totalSold: -1 });
ProductSchema.index({ 'variants.sku': 1 });

// ─── Hooks ───────────────────────────────────────────────────────────────
ProductSchema.pre('save', function (next) {
  if (this.isModified('stock')) {
    if (this.stock <= 0) {
      this.stockStatus = STOCK_STATUS.OUT_OF_STOCK;
    } else if (this.lowStockAlert > 0 && this.stock <= this.lowStockAlert) {
      this.stockStatus = STOCK_STATUS.LOW_STOCK;
    } else {
      this.stockStatus = STOCK_STATUS.IN_STOCK;
    }
  }
  next();
});

// ─── Virtual Fields ──────────────────────────────────────────────────────
ProductSchema.virtual('discountPercentage').get(function () {
  if (!this.mrp || this.mrp <= 0) return 0;
  return Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
});

ProductSchema.virtual('mainImageUrl').get(function () {
  if (this.mainImage) return this.mainImage;
  if (this.images && this.images.length > 0) {
    const main = this.images.find((img) => img.isMain);
    return main ? main.url : this.images[0].url;
  }
  return '';
});

// ─── Static Methods ──────────────────────────────────────────────────────
ProductSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isDeleted: false, isActive: true });
};

ProductSchema.statics.search = function (query, options = {}) {
  const filter = { isDeleted: false, ...options };
  if (query) filter.$text = { $search: query };
  return this.find(filter);
};

// ─── Instance Methods ────────────────────────────────────────────────────
ProductSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

ProductSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.isActive = true;
  return this.save();
};

ProductSchema.methods.publish = function () {
  this.status = PRODUCT_STATUS.PUBLISHED;
  this.isActive = true;
  return this.save();
};

ProductSchema.methods.unpublish = function () {
  this.status = PRODUCT_STATUS.UNPUBLISHED;
  this.isActive = false;
  return this.save();
};

ProductSchema.statics.generateVariantId = generateVariantId;

module.exports = adminConnection.model('Product', ProductSchema);
