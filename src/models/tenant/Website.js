const mongoose = require('mongoose');
const slugify = require('slugify');
const { WEBSITE_STATUS } = require('../../constants');
const { websiteConnection } = require('../../config/connections');

// ─── Theme Sub-Schema ─────────────────────────────────────────────────
const ThemeSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#a74e3e' },
    secondaryColor: { type: String, default: '#241b18' },
    accentColor: { type: String, default: '#f3c997' },
    backgroundColor: { type: String, default: '#fff9f1' },
    textColor: { type: String, default: '#241b18' },
    borderColor: { type: String, default: '#e8ddd2' },
    headingFont: { type: String, default: 'Playfair Display' },
    bodyFont: { type: String, default: 'Inter' },
    buttonStyle: { type: String, default: 'rounded-full' },
    borderRadius: { type: String, default: '16px' },
    containerWidth: { type: String, default: '1280px' },
  },
  { _id: false }
);

// ─── Social Links Sub-Schema ─────────────────────────────────────────
const SocialLinksSchema = new mongoose.Schema(
  {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
    pinterest: { type: String, default: '' },
  },
  { _id: false }
);

// ─── SEO Sub-Schema ──────────────────────────────────────────────────
const SeoSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
    ogImage: { type: String, default: '' },
  },
  { _id: false }
);

// ─── Contact Sub-Schema ──────────────────────────────────────────────
const ContactSchema = new mongoose.Schema(
  {
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { _id: false }
);

// ─── Main Website Schema ─────────────────────────────────────────────
const WebsiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Website name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    brandName: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    domain: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    defaultCurrency: { type: String, default: 'INR' },
    defaultLanguage: { type: String, default: 'en' },
    status: {
      type: String,
      enum: Object.values(WEBSITE_STATUS),
      default: WEBSITE_STATUS.ACTIVE,
    },
    isDefault: { type: Boolean, default: false },

    contact: { type: ContactSchema, default: () => ({}) },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    theme: { type: ThemeSchema, default: () => ({}) },
    seo: { type: SeoSchema, default: () => ({}) },

    // Shipping / payment configuration placeholders
    shippingConfig: {
      freeShippingThreshold: { type: Number, default: 999 },
      flatRate: { type: Number, default: 99 },
      codEnabled: { type: Boolean, default: true },
    },
    paymentConfig: {
      razorpayEnabled: { type: Boolean, default: true },
      codEnabled: { type: Boolean, default: true },
    },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────
// Note: slug already has `unique: true` (auto-index); domain is indexed
// for storefront hostname resolution.
WebsiteSchema.index({ domain: 1 });
WebsiteSchema.index({ status: 1 });

// ─── Hooks ────────────────────────────────────────────────────────────
WebsiteSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (!this.brandName) this.brandName = this.name;
  next();
});

// ─── Static Methods ───────────────────────────────────────────────────
WebsiteSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isDeleted: false });
};

WebsiteSchema.statics.findActiveByDomain = function (domain) {
  return this.findOne({ domain, status: WEBSITE_STATUS.ACTIVE, isDeleted: false });
};

WebsiteSchema.statics.getDefaultWebsite = function () {
  return this.findOne({ isDefault: true, isDeleted: false });
};

WebsiteSchema.statics.assignDefault = async function (websiteId) {
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    await this.updateMany({}, { isDefault: false }, { session });
    await this.findByIdAndUpdate(websiteId, { isDefault: true }, { session });
  });
  session.endSession();
};

// ─── Soft Delete ──────────────────────────────────────────────────────
WebsiteSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = WEBSITE_STATUS.INACTIVE;
  return this.save();
};

module.exports = websiteConnection.model('Website', WebsiteSchema);
