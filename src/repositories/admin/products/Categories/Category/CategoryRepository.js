const BaseRepository = require('../../../../BaseRepository');
const Category = require('../../../../../models/admin/Products/Categories/Category/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  /**
   * Give legacy category records an app-generated public ID.
   */
  async ensureCategoryIds() {
    const categories = await this.model.find({}).select('_id categoryId').lean();
    await Promise.all(categories.map((category) => {
      const updates = {};
      if (!category.categoryId) updates.categoryId = this.model.generateCategoryId();
      return Object.keys(updates).length
        ? this.model.updateOne({ _id: category._id }, { $set: updates })
        : null;
    }).filter(Boolean));
  }

}

module.exports = new CategoryRepository();
