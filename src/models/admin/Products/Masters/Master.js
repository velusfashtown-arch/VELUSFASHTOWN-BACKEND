const mongoose = require('mongoose');
const slugify = require('slugify');
const { randomUUID } = require('crypto');
const { CUSTOM_FIELD_TYPES } = require('../../../../constants');
const { adminConnection } = require('../../../../config/connections');

function generateMasterId() {
  return `MST-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

const OptionSchema = new mongoose.Schema(
  { value: { type: String, required: true, trim: true }, label: { type: String, trim: true, default: '' } },
  { _id: false }
);

const MasterSchema = new mongoose.Schema(
  {
    masterId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: generateMasterId,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
      maxlength: 100,
    },
    fieldType: {
      type: String,
      required: true,
      enum: Object.values(CUSTOM_FIELD_TYPES),
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
      trim: true,
    },
    helpText: {
      type: String,
      default: '',
      trim: true,
    },
    options: {
      type: [OptionSchema],
      default: [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    maxLength: { type: Number, default: null },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    group: {
      type: String,
      default: 'Custom Fields',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

MasterSchema.index({ order: 1 });

MasterSchema.pre('validate', function (next) {
  if (!this.key && this.label) {
    this.key = slugify(this.label, { lower: true, strict: true }).replace(/-/g, '_');
  }
  next();
});

MasterSchema.statics.generateMasterId = generateMasterId;

module.exports = adminConnection.model('Master', MasterSchema);
