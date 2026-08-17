const MasterRepository = require('../../../../repositories/admin/products/Masters/MasterRepository');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');

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
    const field = await MasterRepository.create(data);
    logger.info(`Master field created: ${field.key}`);
    return field;
  }

  async update(id, data) {
    const existing = await this.findMasterByIdentifier(id);
    const existingId = existing.id || existing._id?.toString();

    const field = await MasterRepository.updateById(existingId, data);
    logger.info(`Master field updated: ${field.key}`);
    return field;
  }

  async delete(id) {
    const existing = await this.findMasterByIdentifier(id);
    await MasterRepository.deleteById(existing.id || existing._id);
  }

  async findMasterByIdentifier(identifier) {
    await MasterRepository.ensureMasterIds();
    const isObjectId = /^[a-f\d]{24}$/i.test(identifier);
    const field = isObjectId
      ? await MasterRepository.findById(identifier)
      : await MasterRepository.findOne({ masterId: identifier });

    if (!field) {
      throw AppError.notFound('Master field not found');
    }

    return field;
  }
}

module.exports = new MasterService();
