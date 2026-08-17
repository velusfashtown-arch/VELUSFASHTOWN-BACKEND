const mongoose = require('mongoose');
const { FORM_SUBMISSION_STATUS } = require('../../constants');
const { websiteConnection } = require('../../config/connections');

// ─── Form Submission Schema ──────────────────────────────────────────────
// One document per visitor submission of a Form. `data` mirrors the
// parent Form's `fields[].key`s at the time of submission — kept flexible
// since forms (and their fields) can change after submissions already exist.
const FormSubmissionSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
      index: true,
    },
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    data: {
      type: [{ key: String, value: mongoose.Schema.Types.Mixed, _id: false }],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(FORM_SUBMISSION_STATUS),
      default: FORM_SUBMISSION_STATUS.NEW,
    },
    meta: {
      ip: { type: String, default: '' },
      userAgent: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

FormSubmissionSchema.index({ form: 1, createdAt: -1 });
FormSubmissionSchema.index({ website: 1, status: 1 });

module.exports = websiteConnection.model('FormSubmission', FormSubmissionSchema);
