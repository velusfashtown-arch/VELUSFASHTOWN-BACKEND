const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(200),
    description: z.string().max(1000).optional().default(''),
    image: z.string().optional().default(''),
    parent: z.string().optional().nullable().default(null),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().optional().default(0),
    metaTitle: z.string().max(70).optional().default(''),
    metaDescription: z.string().max(160).optional().default(''),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    image: z.string().optional(),
    parent: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};

