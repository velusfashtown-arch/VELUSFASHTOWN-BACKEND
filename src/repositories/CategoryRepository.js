const BaseRepository = require('./BaseRepository');
const Category = require('../models/admin/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  /**
   * Get category tree (parent categories with children populated).
   */
  async getTree() {
    return this.model.getCategoryTree();
  }

  /**
   * Get root categories (no parent).
   */
  async getRootCategories() {
    return this.model.getRootCategories();
  }

  /**
   * Give legacy category records an app-generated public ID.
   */
  async ensureCategoryIds() {
    const categories = await this.model.find({
      $or: [
        { categoryId: { $exists: false } },
        { categoryId: null },
        { categoryId: '' },
      ],
    }).select('_id');

    await Promise.all(categories.map((category) => this.model.updateOne(
      { _id: category._id },
      { $set: { categoryId: this.model.generateCategoryId() } }
    )));
  }

/**
   * Get children of a category.
   */
  async getChildren(parentId) {
    return this.model.find({ parent: parentId, isActive: true }).sort({ sortOrder: 1 });
  }

  /**
   * Get ALL descendants recursively (including inactive ones).
   */
  async getDescendantIds(parentId) {
    const ids = [];
    const queue = [parentId];
    const visitedIds = new Set([String(parentId)]);

    while (queue.length > 0) {
      const current = queue.shift();
      const children = await this.model.find({ parent: current }).select('_id').lean();

      for (const child of children) {
        const childId = String(child._id);
        if (visitedIds.has(childId)) continue;

        visitedIds.add(childId);
        ids.push(child._id);
        queue.push(child._id);
      }
    }
    return ids;
  }

  /**
   * Delete a category and all of its descendants (cascade delete).
   */
  async deleteRecursive(categoryId) {
    const descendantIds = await this.getDescendantIds(categoryId);
    const allIds = [categoryId, ...descendantIds];
    const result = await this.model.deleteMany({ _id: { $in: allIds } });
    return result.deletedCount;
  }

  /**
   * Find category by slug.
   */
  async findBySlug(slug) {
    return this.model.findOne({ slug });
  }

  /**
   * Get category with all ancestors.
   */
  async getWithAncestors(categoryId) {
    const ancestors = [];
    let current = await this.model.findById(categoryId);
    while (current && current.parent) {
      const parent = await this.model.findById(current.parent);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return ancestors;
  }
}

module.exports = new CategoryRepository();

