const SubCategoryRepository = require('../../../../../repositories/admin/products/Categories/SubCategory/SubCategoryRepository');
const CategoryRepository = require('../../../../../repositories/admin/products/Categories/Category/CategoryRepository');
const AppError = require('../../../../../utils/AppError');
const logger = require('../../../../../utils/logger');

const normalizeName = (name) => String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The admin category dropdown hands back a category's human-readable
 * categoryId (e.g. "CAT-585D4F79FE82"), not its Mongo _id, but
 * SubCategory.category is an ObjectId ref — resolve either form to the
 * real _id before persisting, or Mongoose throws a CastError.
 */
async function resolveCategoryRef(value) {
  const isObjectId = /^[a-f\d]{24}$/i.test(value);
  const category = isObjectId
    ? await CategoryRepository.findById(value).catch(() => null)
    : await CategoryRepository.findOne({ categoryId: value }).catch(() => null);
  if (!category) {
    throw AppError.badRequest('Parent category not found');
  }
  // CategoryRepository.findById/findOne return lean results (via
  // BaseRepository), which have _id renamed to id.
  return category.id || category._id;
}

class SubCategoryService {
  /**
   * List all sub categories with pagination, optionally filtered by category.
   */
  async listSubCategories(queryParams) {
    await SubCategoryRepository.ensureSubCategoryIds();
    const { page = 1, limit = 20, isActive, category, search } = queryParams;
    const filter = {};
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;
    if (category) filter.category = await resolveCategoryRef(category);
    if (search) {
      filter.$or = [
        { subCategoryId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return SubCategoryRepository.findAll(filter, {
      sort: { name: 1 },
      page: Number(page),
      limit: Number(limit),
      populate: 'category',
    });
  }

  /**
   * Get a single sub category by ID.
   */
  async getSubCategory(id) {
    return this.findSubCategoryByIdentifier(id);
  }

  /**
   * Create a new sub category.
   */
  async createSubCategory(data) {
    if (!data.category) {
      throw AppError.badRequest('Parent category is required for a sub category');
    }
    data.category = await resolveCategoryRef(data.category);

    // Block if the sub category has the same full name as its parent category
    const parentCategory = await CategoryRepository.findById(data.category).catch(() => null);
    if (parentCategory && normalizeName(parentCategory.name) === normalizeName(data.name)) {
      throw AppError.conflict('A sub category cannot have the same name as its parent category');
    }

    // Block only exact full-name duplicates within the same category
    const duplicate = await SubCategoryRepository.findOne({
      category: data.category,
      name: { $regex: `^${escapeRegex(data.name.trim())}$`, $options: 'i' },
    });
    if (duplicate) throw AppError.conflict('A sub category with this name already exists in the selected category');

    const subCategory = await SubCategoryRepository.create(data);
    logger.info(`Sub category created: ${subCategory.name}`);
    return this.findSubCategoryByIdentifier(subCategory.subCategoryId);
  }

  /**
   * Update a sub category.
   */
  async updateSubCategory(id, data) {
    const existing = await this.findSubCategoryByIdentifier(id);
    const existingId = existing.id || existing._id?.toString();

    if (data.category) data.category = await resolveCategoryRef(data.category);

    if (data.name || data.category) {
      const targetCategory = data.category || existing.category?.id || existing.category;

      // Block if renaming makes the sub category's name identical to its parent category
      if (data.name) {
        const parentCategory = await CategoryRepository.findById(targetCategory).catch(() => null);
        if (parentCategory && normalizeName(parentCategory.name) === normalizeName(data.name)) {
          throw AppError.conflict('A sub category cannot have the same name as its parent category');
        }
      }

      // Block only exact full-name duplicates within the same category
      const duplicate = await SubCategoryRepository.findOne({
        category: targetCategory,
        name: data.name
          ? { $regex: `^${escapeRegex(data.name.trim())}$`, $options: 'i' }
          : { $regex: `^${escapeRegex(existing.name.trim())}$`, $options: 'i' },
        _id: { $ne: existingId },
      });
      if (duplicate) throw AppError.conflict('A sub category with this name already exists in the selected category');
    }

    const subCategory = await SubCategoryRepository.updateById(existingId, data, {
      populate: 'category',
    });
    logger.info(`Sub category updated: ${subCategory.name}`);
    return subCategory;
  }

  /**
   * Toggle a sub category's active status.
   */
  async toggleSubCategoryActive(id, isActive) {
    const subCategory = await this.findSubCategoryByIdentifier(id);
    const subCategoryId = subCategory.id || subCategory._id;
    const updated = await SubCategoryRepository.updateById(subCategoryId, { isActive }, {
      populate: 'category',
    });
    logger.info(`Sub category ${isActive ? 'activated' : 'deactivated'}: ${updated.name}`);
    return updated;
  }

  /**
   * Delete a sub category.
   */
  async deleteSubCategory(id) {
    const subCategory = await this.findSubCategoryByIdentifier(id);
    await SubCategoryRepository.deleteById(subCategory.id || subCategory._id);
    logger.info(`Sub category deleted: ${subCategory.subCategoryId}`);
  }

  async findSubCategoryByIdentifier(identifier) {
    await SubCategoryRepository.ensureSubCategoryIds();
    const isObjectId = /^[a-f\d]{24}$/i.test(identifier);
    const subCategory = isObjectId
      ? await SubCategoryRepository.findById(identifier, { populate: 'category' })
      : await SubCategoryRepository.findOne({ subCategoryId: identifier }, { populate: 'category' });

    if (!subCategory) {
      throw AppError.notFound('Sub category not found');
    }

    return subCategory;
  }
}

module.exports = new SubCategoryService();
