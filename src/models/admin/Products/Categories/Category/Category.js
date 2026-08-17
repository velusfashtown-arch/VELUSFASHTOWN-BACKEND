const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const { adminConnection } = require('../../../../../config/connections');

function generateCategoryId() {
  return `CAT-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

function normalizeName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// ─── Category Schema ─────────────────────────────────────────────────
// Top-level product categories only. Sub-categories are a separate
// collection (see ../SubCategory/SubCategory.js) that reference a
// Category via `category`, rather than categories self-referencing a
// `parent` the way this collection used to.
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
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: subCategories belonging to this category.
CategorySchema.virtual('subCategories', {
  ref: 'SubCategory',
  localField: '_id',
  foreignField: 'category',
  options: { sort: { name: 1 } },
});

CategorySchema.statics.generateCategoryId = generateCategoryId;

module.exports = adminConnection.model('Category', CategorySchema);
