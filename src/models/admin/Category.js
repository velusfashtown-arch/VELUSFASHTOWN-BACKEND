const mongoose = require('mongoose');
const slugify = require('slugify');
const { randomUUID } = require('crypto');

function generateCategoryId() {
  return `CAT-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

const CategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: generateCategoryId,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
CategorySchema.index({ parent: 1, sortOrder: 1 });

// Virtual: children (subcategories)
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  options: { sort: { sortOrder: 1 } },
});

// Generate a unique slug, appending a numeric suffix if the base slug is taken
// by another category (avoids duplicate-slug errors on create/rename).
async function generateUniqueSlug(model, name, excludeId) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let suffix = 1;
  for (;;) {
    const existing = await model.findOne({ slug, _id: { $ne: excludeId } }).select('_id').lean();
    if (!existing) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

// Pre-save hook to generate a unique slug on create or name change.
CategorySchema.pre('save', async function (next) {
  try {
    if (this.isNew || this.isModified('name')) {
      this.slug = await generateUniqueSlug(this.constructor, this.name, this._id);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-findOneAndUpdate hook to regenerate a unique slug when the name changes
// (covers the findByIdAndUpdate path used by category updates).
CategorySchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate() || {};
    const name = update.name || (update.$set && update.$set.name);
    if (name) {
      const doc = await this.model.findOne(this.getQuery()).select('_id').lean();
      const newSlug = await generateUniqueSlug(this.model, name, doc ? doc._id : undefined);
      if (update.$set) update.$set.slug = newSlug;
      else update.slug = newSlug;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Static: get all root categories (no parent)
CategorySchema.statics.getRootCategories = function () {
  return this.find({ parent: null, isActive: true }).sort({ sortOrder: 1 });
};

// Static: get category tree (hierarchical)
CategorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .populate('children');

  return categories.filter((cat) => !cat.parent);
};

CategorySchema.statics.generateCategoryId = generateCategoryId;

module.exports = mongoose.model('Category', CategorySchema);

