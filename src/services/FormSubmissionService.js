const FormRepository = require('../repositories/FormRepository');
const FormSubmissionRepository = require('../repositories/FormSubmissionRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { sendMail } = require('../helpers/email');
const { stripMongoIds } = require('../utils/stripMongoIds');

class FormSubmissionService {
  async listForWebsite(websiteId, queryParams = {}) {
    const { formId, status, page = 1, limit = 20 } = queryParams;
    return FormSubmissionRepository.listForWebsite(websiteId, {
      formId,
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  async getById(websiteId, submissionId) {
    const submission = await FormSubmissionRepository.model.findOne({ _id: submissionId, website: websiteId }).lean();
    if (!submission) throw AppError.notFound('Submission not found');
    return stripMongoIds(submission);
  }

  async updateStatus(websiteId, submissionId, status) {
    const submission = await FormSubmissionRepository.model.findOneAndUpdate(
      { _id: submissionId, website: websiteId },
      { $set: { status } },
      { new: true }
    );
    if (!submission) throw AppError.notFound('Submission not found');
    return submission;
  }

  async delete(websiteId, submissionId) {
    const submission = await FormSubmissionRepository.model.findOneAndDelete({ _id: submissionId, website: websiteId });
    if (!submission) throw AppError.notFound('Submission not found');
  }

  /**
   * Public submit — resolves the form by website + slug, validates required
   * fields are present, saves the submission, then fires integrations
   * (email/webhook) without blocking the response.
   */
  async submit(websiteId, formSlug, payload, meta = {}) {
    const form = await FormRepository.findBySlug(websiteId, formSlug);
    if (!form || !form.isActive) {
      throw AppError.notFound('Form not found');
    }

    const submitted = payload.data || [];
    const submittedMap = new Map(submitted.map((entry) => [entry.key, entry.value]));

    const missing = form.fields
      .filter((field) => field.required)
      .filter((field) => {
        const value = submittedMap.get(field.key);
        return value === undefined || value === null || value === '';
      })
      .map((field) => field.label);

    if (missing.length > 0) {
      throw AppError.badRequest(`Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`);
    }

    // Only persist keys the form actually defines — drops anything a
    // malicious or stale client tried to smuggle in.
    const knownKeys = new Set(form.fields.map((f) => f.key));
    const data = submitted.filter((entry) => knownKeys.has(entry.key));

    const submission = await FormSubmissionRepository.create({
      form: form._id,
      website: websiteId,
      data,
      meta: { ip: meta.ip || '', userAgent: meta.userAgent || '' },
    });

    await FormRepository.model.updateOne({ _id: form._id }, { $inc: { submissionCount: 1 } });

    this.runIntegrations(form, data).catch((err) => {
      logger.error(`Form integration failed for "${form.name}": ${err.message}`);
    });

    return { message: form.successMessage || "Thank you! We'll be in touch soon." , submissionId: submission._id };
  }

  /**
   * Fire-and-forget: email notification + webhook. Never throws back to
   * the caller — a broken integration should never fail the visitor's
   * submission.
   */
  async runIntegrations(form, data) {
    const fieldLabel = (key) => form.fields.find((f) => f.key === key)?.label || key;
    const rows = data.map((d) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;">${fieldLabel(d.key)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${d.value ?? ''}</td></tr>`).join('');

    if (form.integrations?.email?.enabled && form.integrations.email.toEmail) {
      try {
        await sendMail({
          to: form.integrations.email.toEmail,
          subject: `New submission — ${form.name}`,
          html: `<h2 style="font-family:sans-serif;">New submission: ${form.name}</h2><table style="border-collapse:collapse;font-family:sans-serif;font-size:13px;">${rows}</table>`,
        });
      } catch (err) {
        logger.error(`Form email integration failed for "${form.name}": ${err.message}`);
      }
    }

    if (form.integrations?.webhook?.enabled && form.integrations.webhook.url) {
      try {
        await fetch(form.integrations.webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form: { id: form._id, name: form.name, slug: form.slug },
            data: Object.fromEntries(data.map((d) => [d.key, d.value])),
            submittedAt: new Date().toISOString(),
          }),
        });
      } catch (err) {
        logger.error(`Form webhook integration failed for "${form.name}": ${err.message}`);
      }
    }
  }
}

module.exports = new FormSubmissionService();
