const { z } = require('zod');

const createSubCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Sub category name is required').max(200),
    category: z.string().min(1, 'Parent category is required'),
    description: z.string().max(1000).optional().default(''),
    isActive: z.boolean().optional().default(true),
    metaTitle: z.string().max(70).optional().default(''),
    metaDescription: z.string().max(160).optional().default(''),
  }),
});

const updateSubCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    category: z.string().min(1).optional(),
    description: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
  }),
});

const toggleSubCategoryActiveSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive is required' }),
  }),
});

module.exports = {
  createSubCategorySchema,
  updateSubCategorySchema,
  toggleSubCategoryActiveSchema,
};
