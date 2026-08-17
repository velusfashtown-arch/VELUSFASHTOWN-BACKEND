const MasterRepository = require('../../../../repositories/admin/products/Masters/MasterRepository');
const CategoryRepository = require('../../../../repositories/admin/products/Categories/Category/CategoryRepository');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');

/**
 * The admin category dropdown hands back a category's human-readable
 * categoryId (e.g. "CAT-585D4F79FE82"), not its Mongo _id, but
 * Master.category is an ObjectId ref — resolve either form to the real
 * _id before persisting. A falsy value means "all categories" (global
 * field), stored as null.
 */
async function resolveCategoryRef(value) {
  if (!value) return null;
  const isObjectId = /^[a-f\d]{24}$/i.test(value);
  const category = isObjectId
    ? await CategoryRepository.findById(value).catch(() => null)
    : await CategoryRepository.findOne({ categoryId: value }).catch(() => null);
  if (!category) {
    throw AppError.badRequest('Category not found');
  }
  return category.id || category._id;
}

class MasterService {
  async list(queryParams = {}) {
    await MasterRepository.ensureMasterIds();
    const { isActive, page = 1, limit = 100 } = queryParams;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    return MasterRepository.findAll(filter, {
      sort: { order: 1, createdAt: 1 },
      page: Number(page),
      limit: Number(limit),
      populate: 'category',
    });
  }

  async getById(id) {
    return this.findMasterByIdentifier(id);
  }

  async create(data) {
    if (data.key) {
      const existing = await MasterRepository.findOne({ key: data.key });
      if (existing) throw AppError.conflict(`A field with key "${data.key}" already exists`);
    }
    // Fields are only ever marked core by the seed — anything created
    // through the API is a deletable, admin-added field.
    const payload = { ...data, isCore: false, category: await resolveCategoryRef(data.category) };
    const field = await MasterRepository.create(payload);
    logger.info(`Master field created: ${field.key}`);
    return this.findMasterByIdentifier(field.masterId);
  }

  async update(id, data) {
    const existing = await this.findMasterByIdentifier(id);
    const existingId = existing.id || existing._id?.toString();

    // isCore is only ever set by the seed, never editable afterwards.
    const { isCore, ...rest } = data;
    if ('category' in rest) rest.category = await resolveCategoryRef(rest.category);

    const field = await MasterRepository.updateById(existingId, rest, { populate: 'category' });
    logger.info(`Master field updated: ${field.key}`);
    return field;
  }

  async delete(id) {
    const existing = await this.findMasterByIdentifier(id);
    if (existing.isCore) {
      throw AppError.badRequest('This field is required by the Add Product form and cannot be deleted.');
    }
    await MasterRepository.deleteById(existing.id || existing._id);
  }

  async findMasterByIdentifier(identifier) {
    await MasterRepository.ensureMasterIds();
    const isObjectId = /^[a-f\d]{24}$/i.test(identifier);
    const field = isObjectId
      ? await MasterRepository.findById(identifier, { populate: 'category' })
      : await MasterRepository.findOne({ masterId: identifier }, { populate: 'category' });

    if (!field) {
      throw AppError.notFound('Master field not found');
    }

    return field;
  }
}

module.exports = new MasterService();
