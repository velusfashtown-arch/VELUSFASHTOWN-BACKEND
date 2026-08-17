const BaseRepository = require('../../../../BaseRepository');
const SubCategory = require('../../../../../models/admin/Products/Categories/SubCategory/SubCategory');

class SubCategoryRepository extends BaseRepository {
  constructor() {
    super(SubCategory);
  }

  /**
   * Give legacy sub category records an app-generated public ID.
   */
  async ensureSubCategoryIds() {
    const subCategories = await this.model.find({}).select('_id subCategoryId').lean();
    await Promise.all(subCategories.map((subCategory) => {
      const updates = {};
      if (!subCategory.subCategoryId) updates.subCategoryId = this.model.generateSubCategoryId();
      return Object.keys(updates).length
        ? this.model.updateOne({ _id: subCategory._id }, { $set: updates })
        : null;
    }).filter(Boolean));
  }

  /**
   * All sub categories belonging to a category (used for cascade delete).
   */
  async findByCategory(categoryId) {
    return this.model.find({ category: categoryId });
  }

  /**
   * Delete every sub category belonging to a category (used when the
   * parent category is deleted).
   */
  async deleteByCategory(categoryId) {
    const result = await this.model.deleteMany({ category: categoryId });
    return result.deletedCount;
  }
}

module.exports = new SubCategoryRepository();
