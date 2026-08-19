const { z } = require('zod');

const createCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Collection name is required').max(200),
    description: z.string().max(1000).optional().default(''),
    image: z.string().optional().default(''),
    banner: z.string().optional().default(''),
    products: z.array(z.string()).optional().default([]),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().optional().default(0),
    isFeatured: z.boolean().optional().default(false),
    metaTitle: z.string().optional().default(''),
    metaDescription: z.string().optional().default(''),
  }),
});

const updateCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
    products: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    isFeatured: z.boolean().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

module.exports = {
  createCollectionSchema,
  updateCollectionSchema,
};
