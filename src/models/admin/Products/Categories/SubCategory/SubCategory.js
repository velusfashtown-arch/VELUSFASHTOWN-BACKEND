const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const { adminConnection } = require('../../../../../config/connections');

function generateSubCategoryId() {
  return `SUBCAT-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

function normalizeName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// ─── Sub Category Schema ─────────────────────────────────────────────
// Belongs to exactly one Category via `category`. Kept as its own
// collection (rather than Category self-referencing a `parent`) so
// categories and sub-categories are managed as two distinct resources.
const SubCategorySchema = new mongoose.Schema(
  {
    subCategoryId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: generateSubCategoryId,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Parent category is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Sub category name is required'],
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

SubCategorySchema.statics.generateSubCategoryId = generateSubCategoryId;

module.exports = adminConnection.model('SubCategory', SubCategorySchema);
