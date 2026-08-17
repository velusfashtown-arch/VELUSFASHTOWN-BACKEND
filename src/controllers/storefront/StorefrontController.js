const WebsiteProductRepository = require('../../repositories/WebsiteProductRepository');
const ProductRepository = require('../../repositories/admin/products/Product/ProductRepository');
const WebsiteRepository = require('../../repositories/WebsiteRepository');
const HomepageSection = require('../../models/tenant/HomepageSection');
const Navigation = require('../../models/tenant/Navigation');
const NavigationItem = require('../../models/tenant/NavigationItem');
const Banner = require('../../models/tenant/Banner');
const Page = require('../../models/tenant/Page');
const CategoryRepository = require('../../repositories/admin/products/Categories/Category/CategoryRepository');
const CollectionRepository = require('../../repositories/CollectionRepository');
const Product = require('../../models/admin/Products/Product/Product');
const FormRepository = require('../../repositories/FormRepository');
const FormSubmissionService = require('../../services/FormSubmissionService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');
const AppError = require('../../utils/AppError');
const { APPROVAL_STATUS } = require('../../constants');

/**
 * StorefrontController
 *
 * All endpoints resolve the current website (via req.websiteId, set by the
 * resolveWebsite middleware) and ONLY return products that are
 *   - website-assigned (WebsiteProduct exists)
 *   - approvalStatus = APPROVED
 *   - published = true
 *   - product itself is active + not soft-deleted
 */

// Website-scoped serializer — never exposes costPrice / internal fields.
function serializeForStorefront(product, assignment = {}) {
  if (!product) return null;
  const images = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'string' ? img : (img && img.url) || '')).filter(Boolean)
    : [];
  if (!images.length && product.mainImage) images.push(product.mainImage);

  const category = product.category && typeof product.category === 'object'
    ? product.category.name
    : (product.category || '');

  // Website-specific presentation takes precedence over central product data.
  const name = assignment.websiteTitle || product.name;
  const description = assignment.websiteDescription || product.description || product.shortDescription || '';
  const price = Number(assignment.websitePrice || product.sellingPrice || 0);
  const compareAt = Number(assignment.websiteComparePrice || product.mrp || 0);

  return {
    id: product.productId || (product._id ? product._id.toString() : product.id),
    name,
    sku: product.sku,
    description,
    shortDescription: product.shortDescription || '',
    price,
    compareAtPrice: compareAt,
    mrp: compareAt,
    sellingPrice: price,
    discountPercentage: compareAt > 0
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : 0,
    occasion: Array.isArray(product.occasion) ? product.occasion : [],
    images,
    image: images[0] || '',
    mainImage: product.mainImage || images[0] || '',
    categoryName: category,
    categoryId: (product.category && typeof product.category === 'object' && product.category.categoryId) || '',
    stock: Number(product.stock || 0),
    isFeatured: Boolean(assignment.featured ?? product.isFeatured),
    averageRating: Number(product.averageRating || 0),
    reviewCount: Number(product.reviewCount || 0),
    tags: Array.isArray(product.tags) ? product.tags : [],
    variants: Array.isArray(product.variants) ? product.variants : [],
  };
}

class StorefrontController {
  /**
   * GET /api/storefront/:websiteSlug/home
   * Returns website config + active homepage sections + banners.
   */
  home = asyncHandler(async (req, res) => {
    const websiteId = req.websiteId;
    const website = req.website;

    const [sections, banners] = await Promise.all([
      HomepageSection.find({ website: websiteId, isActive: true })
        .sort({ sortOrder: 1 })
        .lean(),
      Banner.find({ website: websiteId, status: 'active' })
        .sort({ sortOrder: 1 })
        .lean(),
    ]);

    return ApiResponse.success(res, {
      data: {
        website: {
          id: website.id || website._id,
          name: website.name,
          brandName: website.brandName,
          slug: website.slug,
          logo: website.logo,
          favicon: website.favicon,
          theme: website.theme,
          contact: website.contact,
          socialLinks: website.socialLinks,
        },
        sections,
        banners,
      },
    });
  });

  /**
   * GET /api/storefront/:websiteSlug/products
   * Only approved + published website assignments.
   */
  products = asyncHandler(async (req, res) => {
    const websiteId = req.websiteId;
    const { page = 1, limit = 20, category, search, sort } = req.query;

    // Find live assignments for this website. `product` lives in the admin
    // database (separate mongoose connection from WebsiteProduct), so it
    // can't be joined with $lookup/populate — the soft-delete filter is
    // reapplied below when the actual Product docs are fetched instead.
    const liveAssignments = await WebsiteProductRepository.model
      .find({
        website: websiteId,
        approvalStatus: APPROVAL_STATUS.APPROVED,
        published: true,
        isActive: true,
      })
      .select('product websiteTitle websitePrice websiteComparePrice featured')
      .lean();

    const assignmentMap = {};
    liveAssignments.forEach((a) => {
      assignmentMap[String(a.product)] = a;
    });
    const productIds = liveAssignments.map((a) => a.product);

    if (productIds.length === 0) {
      return ApiResponse.paginated(res, { data: [], total: 0, page, limit });
    }

    const filter = { _id: { $in: productIds }, isDeleted: false, isActive: true };
    if (category) {
      // Match by the public category id or Mongo id.
      const cat = await CategoryRepository.findOne({ $or: [{ categoryId: category }, { _id: category }] });
      if (cat) filter.$or = [{ category: cat.id || cat._id }, { subCategory: cat.id || cat._id }];
    }
    if (search) {
      filter.$or = filter.$or || [];
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // productId is sequential (PRD00001, PRD00002, ...), so it doubles as
    // a reliable "newest first" ordering without a createdAt field.
    let sortOption = { productId: -1 };
    if (sort === 'price_asc') sortOption = { sellingPrice: 1 };
    else if (sort === 'price_desc') sortOption = { sellingPrice: -1 };
    else if (sort === 'newest') sortOption = { productId: -1 };
    else if (sort === 'popularity' || sort === 'featured') sortOption = { totalSold: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [docs, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit)).populate('category').lean(),
      Product.countDocuments(filter),
    ]);

    const data = docs.map((p) => serializeForStorefront(p, assignmentMap[String(p._id)] || {}));
    return ApiResponse.paginated(res, { data, total, page: Number(page), limit: Number(limit) });
  });

  /**
   * GET /api/storefront/:websiteSlug/products/:slug
   * Product detail — must be live on this website.
   */
  productionDetail = asyncHandler(async (req, res) => {
    const websiteId = req.websiteId;
const { slug } = req.params;

    const product = await Product.findOne({
      productId: slug,
      isDeleted: false,
      isActive: true,
    }).populate('category').lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', data: null });
    }

    const assignment = await WebsiteProductRepository.findLiveAssignment(websiteId, product._id);
    if (!assignment) {
      return ApiResponse.success(res, { data: null, message: 'Product not available on this website' });
    }

    return ApiResponse.success(res, {
      data: serializeForStorefront(product, assignment),
    });
  });

  /**
   * GET /api/storefront/:websiteSlug/categories
   */
  categories = asyncHandler(async (req, res) => {
    const categories = await CategoryRepository.model
      ?.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return ApiResponse.success(res, { data: categories || [] });
  });

  /**
   * GET /api/storefront/:websiteSlug/collections
   */
  collections = asyncHandler(async (req, res) => {
    const collections = await CollectionRepository.model
      ?.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return ApiResponse.success(res, { data: collections || [] });
  });

  /**
   * GET /api/storefront/:websiteSlug/navigation
   */
  navigation = asyncHandler(async (req, res) => {
    const websiteId = req.websiteId;
    const navigations = await Navigation.find({ website: websiteId, isActive: true }).lean();
    const navIds = navigations.map((n) => n._id);
    const items = await NavigationItem.find({
      navigation: { $in: navIds },
      isActive: true,
    })
      .sort({ sortOrder: 1 })
      .lean();

    // Build simple parent-child tree per nav.
    return ApiResponse.success(res, {
      data: {
        navigations,
        items,
      },
    });
  });

  /**
   * GET /api/storefront/:websiteSlug/pages/:slug
   */
  page = asyncHandler(async (req, res) => {
    const websiteId = req.websiteId;
    const page = await Page.findOne({
      website: websiteId,
      slug: req.params.slug,
      status: 'published',
      isActive: true,
    }).lean();
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found', data: null });
    }
    return ApiResponse.success(res, { data: page });
  });

  /**
   * GET /api/storefront/:websiteSlug/search
   * Search only live, approved + published products on this website.
   */
  search = asyncHandler(async (req, res) => {
    const websiteId = req.websiteId;
    const q = req.query.q || '';
    const { page = 1, limit = 20 } = req.query;

    if (!q) {
      return ApiResponse.paginated(res, { data: [], total: 0, page, limit });
    }

    const liveProducts = await WebsiteProductRepository.model
      .find({
        website: websiteId,
        approvalStatus: APPROVAL_STATUS.APPROVED,
        published: true,
        isActive: true,
      })
      .select('product websiteTitle websitePrice websiteComparePrice featured')
      .lean();
    const assignmentMap = {};
    liveProducts.forEach((a) => { assignmentMap[String(a.product)] = a; });
    const productIds = liveProducts.map((a) => a.product);

    const filter = {
      _id: { $in: productIds },
      isDeleted: false,
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [docs, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)).populate('category').lean(),
      Product.countDocuments(filter),
    ]);

const data = docs.map((p) => serializeForStorefront(p, assignmentMap[String(p._id)] || {}));
    return ApiResponse.paginated(res, { data, total, page: Number(page), limit: Number(limit) });
  });

  /**
   * GET /api/storefront/:websiteSlug/forms/:slug
   * Public form definition — active forms only.
   */
  getForm = asyncHandler(async (req, res) => {
    const form = await FormRepository.findBySlug(req.websiteId, req.params.slug);
    if (!form || !form.isActive) throw AppError.notFound('Form not found');
    return ApiResponse.success(res, {
      data: {
        name: form.name,
        slug: form.slug,
        title: form.title,
        description: form.description,
        fields: form.fields,
        submitButtonText: form.submitButtonText,
      },
    });
  });

  /**
   * POST /api/storefront/:websiteSlug/forms/:slug/submit
   * Public form submission.
   */
  submitForm = asyncHandler(async (req, res) => {
    const result = await FormSubmissionService.submit(req.websiteId, req.params.slug, req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
    });
    return ApiResponse.created(res, { data: { submissionId: result.submissionId }, message: result.message });
  });
}

module.exports = {
  StorefrontController: new StorefrontController(),
  serializeForStorefront,
};
