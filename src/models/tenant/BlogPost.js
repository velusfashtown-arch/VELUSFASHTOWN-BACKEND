const mongoose = require('mongoose');

// ─── Blog Category Schema ────────────────────────────────────────────
const BlogCategorySchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    slug: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

// ─── Blog Post Schema ────────────────────────────────────────────────
const BlogPostSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    featuredImage: { type: String, default: '' },
    author: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', default: null },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    publishedAt: { type: Date, default: null },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

BlogPostSchema.index({ website: 1, slug: 1 }, { unique: true });
BlogPostSchema.index({ website: 1, status: 1, publishedAt: -1 });

module.exports = {
  BlogPost: mongoose.model('BlogPost', BlogPostSchema),
  BlogCategory: mongoose.model('BlogCategory', BlogCategorySchema),
};
