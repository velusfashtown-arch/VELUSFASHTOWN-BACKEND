const mongoose = require('mongoose');
const slugify = require('slugify');
const { CUSTOM_FIELD_TYPES, FORM_TYPES } = require('../../../../constants');
const { websiteConnection } = require('../../../../config/connections');

// ─── Form Option Sub-Schema ─────────────────────────────────────────────
const FormOptionSchema = new mongoose.Schema(
  { value: { type: String, required: true, trim: true }, label: { type: String, trim: true, default: '' } },
  { _id: false }
);

// ─── Form Field Sub-Schema ──────────────────────────────────────────────
// Unlike the admin's product Master fields (a shared library used by every
// product), a form's fields are only ever used by that one form, so they're
// embedded directly rather than a separate collection.
const FormFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true, maxlength: 150 },
    fieldType: { type: String, required: true, enum: Object.values(CUSTOM_FIELD_TYPES) },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '', trim: true },
    helpText: { type: String, default: '', trim: true },
    options: { type: [FormOptionSchema], default: [] },
  },
  { _id: false }
);

// ─── Form Schema ─────────────────────────────────────────────────────────
// A customer-facing form (Contact Us, an inquiry form, newsletter signup,
// etc.) rendered on the storefront. Visitor submissions are stored as
// FormSubmission documents and optionally forwarded via `integrations`.
const FormSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Form name is required'],
      trim: true,
      maxlength: 150,
    },
    // Label/category only — e.g. "Contact Us" vs "Product Inquiry". Doesn't
    // change how the form is built or rendered.
    type: {
      type: String,
      enum: Object.values(FORM_TYPES),
      default: FORM_TYPES.GENERAL,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, default: '', trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 1000 },
    fields: { type: [FormFieldSchema], default: [] },
    submitButtonText: { type: String, default: 'Submit', trim: true, maxlength: 50 },
    successMessage: { type: String, default: "Thank you! We'll be in touch soon.", maxlength: 300 },
    isActive: { type: Boolean, default: true },
    integrations: {
      email: {
        enabled: { type: Boolean, default: false },
        toEmail: { type: String, default: '', trim: true },
      },
      webhook: {
        enabled: { type: Boolean, default: false },
        url: { type: String, default: '', trim: true },
      },
    },
    submissionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FormSchema.index({ website: 1, slug: 1 }, { unique: true });
FormSchema.index({ website: 1, isActive: 1 });
FormSchema.index({ website: 1, type: 1 });

FormSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = websiteConnection.model('Form', FormSchema);
