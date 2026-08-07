const AppError = require('../utils/AppError');
const { stripMongoIds } = require('../utils/stripMongoIds');

/**
 * Base Repository providing common CRUD operations.
 * All specific repositories should extend this.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all documents with optional filtering, sorting, and pagination.
   */
  async findAll(filter = {}, options = {}) {
    const {
      sort = { createdAt: -1 },
      page = 1,
      limit = 20,
      populate = '',
      select = '',
      lean = true,
    } = options;

    const skip = (page - 1) * limit;

    let query = this.model.find(filter);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (lean) query = query.lean();

    let [data, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter),
    ]);
    if (lean) data = stripMongoIds(data);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find a document by ID.
   */
  async findById(id, options = {}) {
    const { populate = '', select = '', lean = true } = options;
    let query = this.model.findById(id);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (lean) query = query.lean();
    const doc = await query.exec();
    if (!doc) {
      throw AppError.notFound(`${this.model.modelName} not found`);
    }
    return lean ? stripMongoIds(doc) : doc;
  }

  /**
   * Find one document by filter.
   */
  async findOne(filter, options = {}) {
    const { populate = '', select = '', lean = true } = options;
    let query = this.model.findOne(filter);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (lean) query = query.lean();
    const doc = await query.exec();
    return lean ? stripMongoIds(doc) : doc;
  }

  /**
   * Create a new document.
   */
  async create(data) {
    const doc = await this.model.create(data);
    return doc.toJSON ? doc.toJSON() : doc;
  }

  /**
   * Update a document by ID.
   */
  async updateById(id, data, options = {}) {
    const { populate = '', select = '', runValidators = true } = options;
    let query = this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators,
    });
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    const doc = await query.exec();
    if (!doc) {
      throw AppError.notFound(`${this.model.modelName} not found`);
    }
    return doc;
  }

  /**
   * Delete a document by ID.
   */
  async deleteById(id) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) {
      throw AppError.notFound(`${this.model.modelName} not found`);
    }
    return doc;
  }

  /**
   * Count documents by filter.
   */
  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  /**
   * Check if a document exists.
   */
  async exists(filter) {
    return this.model.exists(filter);
  }

  /**
   * Bulk insert documents.
   */
  async bulkCreate(docs) {
    return this.model.insertMany(docs);
  }

  /**
   * Bulk update documents.
   */
  async bulkUpdate(filter, data) {
    return this.model.updateMany(filter, data);
  }

  /**
   * Bulk delete documents.
   */
  async bulkDelete(filter) {
    return this.model.deleteMany(filter);
  }

  /**
   * Aggregate pipeline.
   */
  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  /**
   * Find distinct values for a field.
   */
  async distinct(field, filter = {}) {
    return this.model.distinct(field, filter);
  }
}

module.exports = BaseRepository;

