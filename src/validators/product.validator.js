const { z } = require('zod');

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional().default(''),
  order: z.number().optional().default(0),
  isMain: z.boolean().optional().default(false),
  thumbnail: z.string().optional().default(''),
  publicId: z.string().optional().default(''),
});

const variantSchema = z.object({
  sku: z.string().optional().default(''),
  color: z.string().optional().default(''),
  colorCode: z.string().optional().default(''),
  fabric: z.string().optional().default(''),
  size: z.string().optional().default(''),
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
    slug: z.string().optional(),
    description: z.string().max(5000).optional().default(''),
    shortDescription: z.string().max(300).optional().default(''),
    mrp: z.number().min(0).optional().default(0),
    sellingPrice: z.number().min(0).optional().default(0),
    costPrice: z.number().min(0).optional().default(0),
    discount: z.number().min(0).max(100).optional().default(0),
    gst: z.number().min(0).max(100).optional().default(0),
    category: z.string().optional().nullable(),
    subCategory: z.string().optional().nullable(),
    productType: z.string().optional().default(''),
    occasion: z.array(z.string()).optional().default([]),
    stock: z.number().min(0).optional().default(0),
    lowStockAlert: z.number().min(0).optional().default(5),
    status: z.string().optional().default('Draft'),
    tags: z.array(z.string()).optional().default([]),
    hasVariants: z.boolean().optional().default(false),
    variants: z.array(variantSchema).optional().default([]),
    // Saree specific fields
    sareeFabric: z.string().optional().default(''),
    blouseFabric: z.string().optional().default(''),
    workType: z.string().optional().default(''),
    borderType: z.string().optional().default(''),
    palluType: z.string().optional().default(''),
    sareeLength: z.string().optional().default('5.5 Mtrs'),
    blouseLength: z.string().optional().default('0.80 Mtrs'),
    primaryColor: z.string().optional().default(''),
    secondaryColor: z.string().optional().default(''),
    pattern: z.string().optional().default(''),
    printType: z.string().optional().default(''),
    style: z.string().optional().default(''),
    blouseIncluded: z.boolean().optional().default(true),
    blouseType: z.string().optional().default(''),
    blouseColor: z.string().optional().default(''),
    // SEO
    seoTitle: z.string().max(70).optional().default(''),
    seoDescription: z.string().max(160).optional().default(''),
    seoKeywords: z.array(z.string()).optional().default([]),
    canonicalUrl: z.string().optional().default(''),
    // Images
    images: z.array(z.any()).optional().default([]),
    mainImage: z.string().optional().default(''),
    // Videos
    productVideo: z.string().optional().default(''),
    youtubeUrl: z.string().optional().default(''),
    instagramReelUrl: z.string().optional().default(''),
    // Shipping
    weight: z.number().min(0).optional().default(0),
    length: z.number().min(0).optional().default(0),
    width: z.number().min(0).optional().default(0),
    height: z.number().min(0).optional().default(0),
    shippingCharge: z.number().min(0).optional().default(0),
    codAvailable: z.boolean().optional().default(true),
    // Return / Exchange
    returnAvailable: z.boolean().optional().default(false),
    returnDays: z.number().min(0).optional().default(0),
    exchangeAvailable: z.boolean().optional().default(false),
    // Additional details
    countryOfOrigin: z.string().optional().default('India'),
    manufacturer: z.string().optional().default(''),
    packer: z.string().optional().default(''),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
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
    stock: z.number().min(0).optional(),
    lowStockAlert: z.number().min(0).optional(),
    status: z.string().optional(),
    tags: z.array(z.string()).optional(),
    hasVariants: z.boolean().optional(),
    variants: z.array(variantSchema).optional(),
    images: z.array(imageSchema).optional(),
    mainImage: z.string().optional(),
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
    collection: z.string().optional(),
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
    fabric: z.string().optional(),
    occasion: z.string().optional(),
    color: z.string().optional(),
    pattern: z.string().optional(),
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

