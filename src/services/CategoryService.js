const CategoryRepository = require('../repositories/CategoryRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class CategoryService {
  /**
   * List all categories with pagination.
   */
  async listCategories(queryParams) {
    await CategoryRepository.ensureCategoryIds();
    const { page = 1, limit = 20, isActive, parent, type, search, includeRelations } = queryParams;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type === 'subcategory') filter.parent = { $ne: null };
    else if (parent !== undefined) filter.parent = parent === 'null' ? null : parent;
    if (search) {
      filter.$or = [
        { categoryId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return CategoryRepository.findAll(filter, {
      sort: { sortOrder: 1 },
      page: Number(page),
      limit: Number(limit),
      populate: includeRelations === 'true' ? 'parent' : '',
    });
  }

  /**
   * Get category tree.
   */
  async getCategoryTree() {
    return CategoryRepository.getTree();
  }

  /**
   * Get a single category by ID.
   */
  async getCategory(id) {
    const category = await this.findCategoryByIdentifier(id);
    return category;
  }

  /**
   * Create a new category.
   */
  async createCategory(data) {
    // If parent is provided, verify it exists
    if (data.parent) {
      const parent = await CategoryRepository.findById(data.parent).catch(() => null);
      if (!parent) {
        throw AppError.badRequest('Parent category not found');
      }
    }

    const category = await CategoryRepository.create(data);
    logger.info(`Category created: ${category.name}`);
    return category;
  }

  /**
   * Update a category.
   */
  async updateCategory(id, data) {
    const existingCategory = await this.findCategoryByIdentifier(id);

    // Prevent circular parent reference
    if (data.parent && data.parent === existingCategory._id.toString()) {
      throw AppError.badRequest('A category cannot be its own parent');
    }

    // If parent is provided, verify it exists
    if (data.parent) {
      const parent = await CategoryRepository.findById(data.parent).catch(() => null);
      if (!parent) {
        throw AppError.badRequest('Parent category not found');
      }
    }

    const category = await CategoryRepository.updateById(existingCategory._id, data);
    logger.info(`Category updated: ${category.name}`);
    return category;
  }

/**
   * Delete a category and all its subcategories (cascade delete).
   */
  async deleteCategory(id) {
    const category = await this.findCategoryByIdentifier(id);

    // Cascade-delete the category and every descendant (subcategories).
    const deletedCount = await CategoryRepository.deleteRecursive(category._id);
    logger.info(`Category deleted: ${category.categoryId} (${deletedCount} record${deletedCount > 1 ? 's' : ''})`);
  }

  /**
   * Get category children.
   */
  async getCategoryChildren(id) {
    const category = await this.findCategoryByIdentifier(id);
    return CategoryRepository.getChildren(category._id);
  }

  async findCategoryByIdentifier(identifier) {
    await CategoryRepository.ensureCategoryIds();
    const isObjectId = /^[a-f\d]{24}$/i.test(identifier);
    const category = isObjectId
      ? await CategoryRepository.findById(identifier)
      : await CategoryRepository.findOne({ categoryId: identifier });

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    return category;
  }
}

module.exports = new CategoryService();

