const { z } = require('zod');
const { CUSTOM_FIELD_TYPES } = require('../../../../constants');

const optionSchema = z.object({
  value: z.string().min(1),
  label: z.string().optional().default(''),
});

const createMasterSchema = z.object({
  body: z.object({
    key: z.string().trim().toLowerCase().optional(),
    label: z.string().min(1, 'Label is required').max(100),
    fieldType: z.enum(Object.values(CUSTOM_FIELD_TYPES)),
    required: z.boolean().optional().default(false),
    placeholder: z.string().max(200).optional().default(''),
    helpText: z.string().max(300).optional().default(''),
    options: z.array(optionSchema).optional().default([]),
    multiple: z.boolean().optional().default(false),
    maxLength: z.number().nullable().optional(),
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    group: z.string().max(100).optional().default('Custom Fields'),
    order: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateMasterSchema = z.object({
  body: z.object({
    label: z.string().min(1).max(100).optional(),
    // fieldType intentionally omitted — changing it after data exists
    // would mismatch stored value shapes. Delete and recreate instead.
    required: z.boolean().optional(),
    placeholder: z.string().max(200).optional(),
    helpText: z.string().max(300).optional(),
    options: z.array(optionSchema).optional(),
    multiple: z.boolean().optional(),
    maxLength: z.number().nullable().optional(),
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    group: z.string().max(100).optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

module.exports = {
  createMasterSchema,
  updateMasterSchema,
};
