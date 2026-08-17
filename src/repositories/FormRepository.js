const BaseRepository = require('./BaseRepository');
const Form = require('../models/tenant/Form');
const { stripMongoIds } = require('../utils/stripMongoIds');

class FormRepository extends BaseRepository {
  constructor() {
    super(Form);
  }

  async findBySlug(websiteId, slug) {
    return this.model.findOne({ website: websiteId, slug });
  }

  async listByWebsite(websiteId) {
    const forms = await this.model.find({ website: websiteId }).sort({ createdAt: -1 }).lean();
    return stripMongoIds(forms);
  }
}

module.exports = new FormRepository();
