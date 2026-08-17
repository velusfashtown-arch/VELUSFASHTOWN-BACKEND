const FormRepository = require('../repositories/FormRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { FORM_TYPES, FORM_TYPE_LABELS } = require('../constants');

class FormService {
  listTypes() {
    return Object.values(FORM_TYPES).map((value) => ({ value, label: FORM_TYPE_LABELS[value] }));
  }

  async listForWebsite(websiteId) {
    return FormRepository.listByWebsite(websiteId);
  }

  async getById(websiteId, formId) {
    const form = await FormRepository.model.findOne({ _id: formId, website: websiteId });
    if (!form) throw AppError.notFound('Form not found');
    return form;
  }

  async create(websiteId, data) {
    if (data.slug) {
      const existing = await FormRepository.findBySlug(websiteId, data.slug);
      if (existing) throw AppError.conflict(`A form with slug "${data.slug}" already exists on this website`);
    }
    const fields = (data.fields || []).map((field) => ({
      ...field,
      key: field.key || field.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
    }));
    const form = await FormRepository.create({ ...data, fields, website: websiteId });
    logger.info(`Form created: ${form.name} (website ${websiteId})`);
    return form;
  }

  async update(websiteId, formId, data) {
    const form = await this.getById(websiteId, formId);
    const updatable = ['name', 'type', 'slug', 'title', 'description', 'fields', 'submitButtonText', 'successMessage', 'isActive', 'integrations'];
    updatable.forEach((key) => {
      if (data[key] === undefined) return;
      if (key === 'fields') {
        form.fields = data.fields.map((field) => ({
          ...field,
          key: field.key || field.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
        }));
        return;
      }
      form[key] = data[key];
    });
    await form.save();
    logger.info(`Form updated: ${form.name}`);
    return form;
  }

  async delete(websiteId, formId) {
    const form = await FormRepository.model.findOneAndDelete({ _id: formId, website: websiteId });
    if (!form) throw AppError.notFound('Form not found');
  }
}

module.exports = new FormService();
