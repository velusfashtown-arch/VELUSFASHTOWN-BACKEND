const CategoryRepository = require('../../../../../repositories/admin/products/Categories/Category/CategoryRepository');
const SubCategoryRepository = require('../../../../../repositories/admin/products/Categories/SubCategory/SubCategoryRepository');
const AppError = require('../../../../../utils/AppError');
const logger = require('../../../../../utils/logger');

const normalizeName = (name) => String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class CategoryService {
  /**
   * List all categories with pagination.
   */
  async listCategories(queryParams) {
    await CategoryRepository.ensureCategoryIds();
    const { page = 1, limit = 20, isActive, search } = queryParams;
    const filter = {};
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;
    if (search) {
      filter.$or = [
        { categoryId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return CategoryRepository.findAll(filter, {
      sort: { name: 1 },
      page: Number(page),
      limit: Number(limit),
    });
  }

  /**
   * Get a single category by ID.
   */
  async getCategory(id) {
    return this.findCategoryByIdentifier(id);
  }

  /**
   * Create a new category.
   */
  async createCategory(data) {
    // Block if a category with the exact same full name exists
    const duplicate = await CategoryRepository.findOne({
      name: { $regex: `^${escapeRegex(data.name.trim())}$`, $options: 'i' },
    });
    if (duplicate) throw AppError.conflict('A category with this name already exists');

    // Block if a sub category has the exact same full name
    const subCategoryDuplicate = await SubCategoryRepository.findOne({
      name: { $regex: `^${escapeRegex(data.name.trim())}$`, $options: 'i' },
    });
    if (subCategoryDuplicate) throw AppError.conflict('A sub category with this name already exists');

    const category = await CategoryRepository.create(data);
    logger.info(`Category created: ${category.name}`);
    return category;
  }

  /**
   * Update a category.
   */
  async updateCategory(id, data) {
    const existingCategory = await this.findCategoryByIdentifier(id);
    // findCategoryByIdentifier returns a lean result (_id renamed to id).
    const existingId = existingCategory.id || existingCategory._id?.toString();

    if (data.name) {
      const duplicate = await CategoryRepository.findOne({
        name: { $regex: `^${escapeRegex(data.name.trim())}$`, $options: 'i' },
        _id: { $ne: existingId },
      });
      if (duplicate) throw AppError.conflict('A category with this name already exists');

      // Block if a sub category has the exact same full name
      const subCategoryDuplicate = await SubCategoryRepository.findOne({
        name: { $regex: `^${escapeRegex(data.name.trim())}$`, $options: 'i' },
      });
      if (subCategoryDuplicate) throw AppError.conflict('A sub category with this name already exists');
    }

    const category = await CategoryRepository.updateById(existingId, data);
    logger.info(`Category updated: ${category.name}`);
    return category;
  }

  /**
   * Toggle a category's active status.
   */
  async toggleCategoryActive(id, isActive) {
    const category = await this.findCategoryByIdentifier(id);
    const categoryId = category.id || category._id;
    const updated = await CategoryRepository.updateById(categoryId, { isActive });
    logger.info(`Category ${isActive ? 'activated' : 'deactivated'}: ${updated.name}`);
    return updated;
  }

  /**
   * Delete a category and cascade-delete its sub categories.
   */
  async deleteCategory(id) {
    const category = await this.findCategoryByIdentifier(id);
    const categoryId = category.id || category._id;

    const deletedSubCategories = await SubCategoryRepository.deleteByCategory(categoryId);
    await CategoryRepository.deleteById(categoryId);
    logger.info(`Category deleted: ${category.categoryId} (${deletedSubCategories} sub categor${deletedSubCategories === 1 ? 'y' : 'ies'} removed)`);
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
