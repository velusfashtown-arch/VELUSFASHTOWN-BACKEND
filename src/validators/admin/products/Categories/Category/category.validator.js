const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(200),
    description: z.string().max(1000).optional().default(''),
    isActive: z.boolean().optional().default(true),
    metaTitle: z.string().max(70).optional().default(''),
    metaDescription: z.string().max(160).optional().default(''),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
  }),
});

const toggleCategoryActiveSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive is required' }),
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  toggleCategoryActiveSchema,
};
