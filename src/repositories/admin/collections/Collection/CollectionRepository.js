const BaseRepository = require('../../../BaseRepository');
const Collection = require('../../../../models/admin/Collections/Collection/Collection');

class CollectionRepository extends BaseRepository {
  constructor() {
    super(Collection);
  }

  /**
   * Find collection by slug.
   */
  async findBySlug(slug) {
    return this.model.findOne({ slug });
  }

  /**
   * Get active collections sorted by sortOrder.
   */
  async getActiveCollections() {
    return this.model.find({ isActive: true }).sort({ sortOrder: 1 });
  }

  /**
   * Get featured collections with product count.
   */
  async getFeaturedCollections() {
    return this.model
      .find({ isActive: true, isFeatured: true })
      .sort({ sortOrder: 1 })
      .populate('products', 'name sellingPrice images mainImage');
  }

  /**
   * Add products to a collection.
   */
  async addProducts(collectionId, productIds) {
    return this.model.findByIdAndUpdate(
      collectionId,
      { $addToSet: { products: { $each: productIds } } },
      { new: true }
    );
  }

  /**
   * Remove products from a collection.
   */
  async removeProducts(collectionId, productIds) {
    return this.model.findByIdAndUpdate(
      collectionId,
      { $pullAll: { products: productIds } },
      { new: true }
    );
  }
}

module.exports = new CollectionRepository();
