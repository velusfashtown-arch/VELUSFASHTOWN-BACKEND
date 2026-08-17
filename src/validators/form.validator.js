const { z } = require('zod');
const { CUSTOM_FIELD_TYPES, FORM_SUBMISSION_STATUS, FORM_TYPES } = require('../constants');

const formOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().optional().default(''),
});

const formFieldSchema = z.object({
  key: z.string().trim().toLowerCase().optional(),
  label: z.string().min(1, 'Field label is required').max(150),
  fieldType: z.enum(Object.values(CUSTOM_FIELD_TYPES)),
  required: z.boolean().optional().default(false),
  placeholder: z.string().max(200).optional().default(''),
  helpText: z.string().max(300).optional().default(''),
  options: z.array(formOptionSchema).optional().default([]),
});

const integrationsSchema = z.object({
  email: z.object({
    enabled: z.boolean().optional().default(false),
    toEmail: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
  }).optional(),
  webhook: z.object({
    enabled: z.boolean().optional().default(false),
    url: z.string().url('Invalid URL').optional().or(z.literal('')).default(''),
  }).optional(),
});

const createFormSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Form name is required').max(150),
    type: z.enum(Object.values(FORM_TYPES)).optional().default(FORM_TYPES.GENERAL),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, hyphen-separated').optional(),
    title: z.string().max(200).optional().default(''),
    description: z.string().max(1000).optional().default(''),
    fields: z.array(formFieldSchema).optional().default([]),
    submitButtonText: z.string().max(50).optional().default('Submit'),
    successMessage: z.string().max(300).optional(),
    isActive: z.boolean().optional().default(true),
    integrations: integrationsSchema.optional(),
  }),
});

const updateFormSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    type: z.enum(Object.values(FORM_TYPES)).optional(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, hyphen-separated').optional(),
    title: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
    fields: z.array(formFieldSchema).optional(),
    submitButtonText: z.string().max(50).optional(),
    successMessage: z.string().max(300).optional(),
    isActive: z.boolean().optional(),
    integrations: integrationsSchema.optional(),
  }),
});

// The public submit endpoint doesn't know a form's field shape in advance
// (every form is different) — required-field presence is checked in
// FormSubmissionService against the Form's own field definitions instead.
const submitFormSchema = z.object({
  body: z.object({
    data: z.array(z.object({ key: z.string(), value: z.any() })).optional().default([]),
  }),
});

const updateSubmissionStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(FORM_SUBMISSION_STATUS)),
  }),
});

module.exports = {
  createFormSchema,
  updateFormSchema,
  submitFormSchema,
  updateSubmissionStatusSchema,
};
