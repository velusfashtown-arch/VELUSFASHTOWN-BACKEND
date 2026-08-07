const CollectionRepository = require('../repositories/CollectionRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class CollectionService {
  /**
   * List all collections with pagination.
   */
  async listCollections(queryParams) {
    const { page = 1, limit = 20, isActive, isFeatured, search } = queryParams;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return CollectionRepository.findAll(filter, {
      sort: { sortOrder: 1 },
      page: Number(page),
      limit: Number(limit),
    });
  }

  /**
   * Get a single collection by ID.
   */
  async getCollection(id) {
    return CollectionRepository.findById(id, { populate: 'products' });
  }

  /**
   * Create a new collection.
   */
  async createCollection(data) {
    const collection = await CollectionRepository.create(data);
    logger.info(`Collection created: ${collection.name}`);
    return collection;
  }

  /**
   * Update a collection.
   */
  async updateCollection(id, data) {
    const collection = await CollectionRepository.updateById(id, data);
    logger.info(`Collection updated: ${collection.name}`);
    return collection;
  }

  /**
   * Delete a collection.
   */
  async deleteCollection(id) {
    await CollectionRepository.deleteById(id);
    logger.info(`Collection deleted: ${id}`);
  }

  /**
   * Get featured collections.
   */
  async getFeaturedCollections() {
    return CollectionRepository.getFeaturedCollections();
  }

  /**
   * Add products to a collection.
   */
  async addProducts(collectionId, productIds) {
    return CollectionRepository.addProducts(collectionId, productIds);
  }

  /**
   * Remove products from a collection.
   */
  async removeProducts(collectionId, productIds) {
    return CollectionRepository.removeProducts(collectionId, productIds);
  }
}

module.exports = new CollectionService();

