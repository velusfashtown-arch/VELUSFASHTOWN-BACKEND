const { z } = require('zod');

const imageSchema = z.object({
  url: z.string().url(),
  order: z.number().optional().default(0),
  isMain: z.boolean().optional().default(false),
});

const variantSchema = z.object({
  sku: z.string().optional().default(''),
  color: z.string().optional().default(''),
  price: z.number().min(0).optional().default(0),
  mrp: z.number().min(0).optional().default(0),
  stock: z.number().min(0).optional().default(0),
  images: z.array(imageSchema).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

const createProductSchema = z.object({
  body: z.object({
    productId: z.string().optional(),
    name: z.string().min(1, 'Product name is required').max(500),
    sku: z.string().optional(),
    description: z.string().max(5000).optional().default(''),
    shortDescription: z.string().max(300).optional().default(''),
    mrp: z.number().min(0).optional().default(0),
    sellingPrice: z.number().min(0).optional().default(0),
    costPrice: z.number().min(0).optional().default(0),
    discount: z.number().min(0).max(100).optional().default(0),
    gst: z.number().min(0).max(100).optional().default(0),
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().min(1, 'Sub category is required'),
    occasion: z.array(z.string()).optional().default([]),
    stock: z.number().min(0).optional().default(0),
    lowStockAlert: z.number().min(0).optional().default(5),
    status: z.string().optional().default('Draft'),
    tags: z.array(z.string()).optional().default([]),
    hasVariants: z.boolean().optional().default(false),
    variants: z.array(variantSchema).optional().default([]),
    // Custom fields (see the Master model) — value type depends on
    // the field's fieldType, so it's left loosely typed here.
    customFields: z.array(z.object({ key: z.string(), value: z.any() })).optional().default([]),
    // Images
    images: z.array(z.any()).optional().default([]),
    mainImage: z.string().optional().default(''),
    // Videos
    productVideo: z.string().optional().default(''),
    youtubeUrl: z.string().optional().default(''),
    instagramReelUrl: z.string().optional().default(''),
    // Additional details
    countryOfOrigin: z.string().optional().default('India'),
    manufacturer: z.string().optional().default(''),
    packer: z.string().optional().default(''),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    productId: z.string().optional(),
    name: z.string().min(1).max(500).optional(),
    sku: z.string().optional(),
    description: z.string().max(5000).optional(),
    shortDescription: z.string().max(300).optional(),
    mrp: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    discount: z.number().min(0).max(100).optional(),
    gst: z.number().min(0).max(100).optional(),
    category: z.string().optional().nullable(),
    subCategory: z.string().optional().nullable(),
    occasion: z.array(z.string()).optional(),
    stock: z.number().min(0).optional(),
    lowStockAlert: z.number().min(0).optional(),
    status: z.string().optional(),
    tags: z.array(z.string()).optional(),
    hasVariants: z.boolean().optional(),
    variants: z.array(variantSchema).optional(),
    customFields: z.array(z.object({ key: z.string(), value: z.any() })).optional(),
    // Images - accept string URLs OR full image objects
    images: z.array(z.union([z.string(), imageSchema])).optional(),
    mainImage: z.string().optional(),
    // Videos
    productVideo: z.string().optional(),
    youtubeUrl: z.string().optional(),
    instagramReelUrl: z.string().optional(),
    // Additional details
    countryOfOrigin: z.string().optional(),
    manufacturer: z.string().optional(),
    packer: z.string().optional(),
  }),
});

const bulkProductSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1, 'At least one product ID is required'),
    action: z.enum(['delete', 'restore', 'publish', 'unpublish']),
  }),
});

const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    stock: z.string().optional(),
    status: z.string().optional(),
    isFeatured: z.string().optional(),
    isTrending: z.string().optional(),
    isBestSeller: z.string().optional(),
    isTodaysDeal: z.string().optional(),
    isFlashSale: z.string().optional(),
    isNewArrival: z.string().optional(),
    occasion: z.string().optional(),
    tags: z.string().optional(),
    isDeleted: z.string().optional(),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  bulkProductSchema,
  productQuerySchema,
};
