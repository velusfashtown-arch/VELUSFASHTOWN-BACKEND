const mongoose = require('mongoose');
const slugify = require('slugify');
const { STOCK_STATUS, PRODUCT_STATUS } = require('../../constants');
const { adminConnection } = require('../../config/connections');

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
    alt: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isMain: { type: Boolean, default: false },
    thumbnail: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

// ─── Variant Sub-Schema ─────────────────────────────────────────────────
const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, default: '' },
    color: { type: String, default: '' },
    colorCode: { type: String, default: '' },
    fabric: { type: String, default: '' },
    size: { type: String, default: '' },
    price: { type: Number, default: 0, min: 0 },
    mrp: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [ImageSchema],
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
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
    slug: {
      type: String,
      unique: true,
      lowercase: true,
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
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
    productType: { type: String, default: '' },

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
    weight: { type: Number, default: 0 },
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    codAvailable: { type: Boolean, default: true },
    returnAvailable: { type: Boolean, default: false },
    exchangeAvailable: { type: Boolean, default: false },
    returnDays: { type: Number, default: 0 },

    // ─── Saree Specific Details ───────────────────────────────────────
    sareeFabric: { type: String, default: '' },
    blouseFabric: { type: String, default: '' },
    workType: { type: String, default: '' },
    borderType: { type: String, default: '' },
    palluType: { type: String, default: '' },
    sareeLength: { type: String, default: '5.5 Mtrs' },
    blouseLength: { type: String, default: '0.80 Mtrs' },
    primaryColor: { type: String, default: '' },
    secondaryColor: { type: String, default: '' },
    pattern: { type: String, default: '' },
    printType: { type: String, default: '' },
    occasion: [{ type: String }],
    style: { type: String, default: '' },
    blouseIncluded: { type: Boolean, default: true },
    blouseType: { type: String, default: '' },
    blouseColor: { type: String, default: '' },

    // ─── SEO ──────────────────────────────────────────────────────────
    seoTitle: { type: String, default: '', maxlength: 70 },
    seoDescription: { type: String, default: '', maxlength: 160 },
    seoKeywords: [{ type: String }],
    canonicalUrl: { type: String, default: '' },

    // ─── Images ───────────────────────────────────────────────────────
    mainImage: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    images: [ImageSchema],

    // ─── Videos ───────────────────────────────────────────────────────
    productVideo: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    instagramReelUrl: { type: String, default: '' },

    // ─── Variants ─────────────────────────────────────────────────────
    hasVariants: { type: Boolean, default: false },
    variants: [VariantSchema],

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
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isDeleted: 1, isActive: 1 });
ProductSchema.index({ sellingPrice: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ totalSold: -1 });
ProductSchema.index({ 'variants.sku': 1 });

// ─── Hooks ───────────────────────────────────────────────────────────────
ProductSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
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

module.exports = adminConnection.model('Product', ProductSchema);
