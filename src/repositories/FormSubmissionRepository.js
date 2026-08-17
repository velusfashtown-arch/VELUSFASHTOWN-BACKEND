const BaseRepository = require('./BaseRepository');
const FormSubmission = require('../models/tenant/FormSubmission');

class FormSubmissionRepository extends BaseRepository {
  constructor() {
    super(FormSubmission);
  }

  async listForWebsite(websiteId, { formId, status, page = 1, limit = 20 } = {}) {
    const filter = { website: websiteId };
    if (formId) filter.form = formId;
    if (status) filter.status = status;
    return this.findAll(filter, { sort: { createdAt: -1 }, page, limit });
  }
}

module.exports = new FormSubmissionRepository();
