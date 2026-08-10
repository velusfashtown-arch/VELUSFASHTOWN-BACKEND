const { z } = require('zod');

// ─── Website CRUD ────────────────────────────────────────────────────
const createWebsiteSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Website name is required').max(200),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, hyphen-separated').optional(),
    brandName: z.string().max(200).optional().default(''),
    description: z.string().max(2000).optional().default(''),
    domain: z.string().max(255).optional().default(''),
    logo: z.string().optional().default(''),
    favicon: z.string().optional().default(''),
    status: z.string().optional(),
    defaultCurrency: z.string().max(10).optional().default('INR'),
    defaultLanguage: z.string().max(10).optional().default('en'),
    contactEmail: z.string().email('Invalid email').optional().default(''),
    contactPhone: z.string().max(20).optional().default(''),
    whatsapp: z.string().max(20).optional().default(''),
    address: z.string().max(1000).optional().default(''),
    socialLinks: z.record(z.string()).optional(),
    theme: z.record(z.any()).optional(),
    seo: z.record(z.any()).optional(),
  }),
});

const updateWebsiteSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, hyphen-separated').optional(),
    brandName: z.string().max(200).optional(),
    description: z.string().max(2000).optional(),
    domain: z.string().max(255).optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    status: z.string().optional(),
    defaultCurrency: z.string().max(10).optional(),
    defaultLanguage: z.string().max(10).optional(),
    contactEmail: z.string().email('Invalid email').optional(),
    contactPhone: z.string().max(20).optional(),
    whatsapp: z.string().max(20).optional(),
    address: z.string().max(1000).optional(),
    socialLinks: z.record(z.string()).optional(),
    theme: z.record(z.any()).optional(),
    seo: z.record(z.any()).optional(),
  }),
});

// ─── Website Domains ─────────────────────────────────────────────────
const addDomainSchema = z.object({
  body: z.object({
    domain: z.string().min(1, 'Domain is required').max(255),
  }),
});

// ─── Website Product Assignment ─────────────────────────────────────
const assignWebsiteProductSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'productId is required'),
    websiteTitle: z.string().max(500).optional(),
    websiteDescription: z.string().max(5000).optional(),
    websitePrice: z.number().min(0).optional(),
    websiteComparePrice: z.number().min(0).optional(),
    featured: z.boolean().optional().default(false),
    displayOrder: z.number().optional().default(0),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
  }),
});

const updateWebsiteProductSchema = z.object({
  body: z.object({
    websiteTitle: z.string().max(500).optional(),
    websiteDescription: z.string().max(5000).optional(),
    websitePrice: z.number().min(0).optional(),
    websiteComparePrice: z.number().min(0).optional(),
    featured: z.boolean().optional(),
    displayOrder: z.number().optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
  }),
});

const rejectWebsiteProductSchema = z.object({
  body: z.object({
    rejectionReason: z.string().min(1, 'Rejection reason is required').max(1000),
  }),
});

const bulkAssignSchema = z.object({
  body: z.object({
    productIds: z.array(z.string()).min(1, 'At least one product is required'),
  }),
});

// ─── Website Homepage Sections ──────────────────────────────────────
const createHomepageSectionSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'Section type is required'),
    title: z.string().max(300).optional().default(''),
    settings: z.record(z.any()).optional(),
    items: z.array(z.record(z.any())).optional(),
    sortOrder: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateHomepageSectionSchema = z.object({
  body: z.object({
    type: z.string().min(1).optional(),
    title: z.string().max(300).optional(),
    settings: z.record(z.any()).optional(),
    items: z.array(z.record(z.any())).optional(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Website Navigation ─────────────────────────────────────────────
const createNavigationItemSchema = z.object({
  body: z.object({
    label: z.string().min(1, 'Label is required').max(200),
    type: z.string().optional().default('custom_url'),
    targetId: z.string().optional().nullable().default(null),
    url: z.string().max(500).optional().default(''),
    parentId: z.string().optional().nullable().default(null),
    sortOrder: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateNavigationItemSchema = z.object({
  body: z.object({
    label: z.string().min(1).max(200).optional(),
    type: z.string().optional(),
    targetId: z.string().optional().nullable(),
    url: z.string().max(500).optional(),
    parentId: z.string().optional().nullable(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Website Banners ────────────────────────────────────────────────
const createBannerSchema = z.object({
  body: z.object({
    title: z.string().max(200).optional().default(''),
    subtitle: z.string().max(500).optional().default(''),
    desktopImage: z.string().optional().default(''),
    mobileImage: z.string().optional().default(''),
    buttonText: z.string().max(100).optional().default(''),
    buttonUrl: z.string().max(500).optional().default(''),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortOrder: z.number().optional().default(0),
    status: z.string().optional().default('active'),
  }),
});

const updateBannerSchema = createBannerSchema.partial();

module.exports = {
  createWebsiteSchema,
  updateWebsiteSchema,
  addDomainSchema,
  assignWebsiteProductSchema,
  updateWebsiteProductSchema,
  rejectWebsiteProductSchema,
  bulkAssignSchema,
  createHomepageSectionSchema,
  updateHomepageSectionSchema,
  createNavigationItemSchema,
  updateNavigationItemSchema,
  createBannerSchema,
  updateBannerSchema,
};
