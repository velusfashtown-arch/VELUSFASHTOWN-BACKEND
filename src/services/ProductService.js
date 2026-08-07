const ProductRepository = require('../repositories/ProductRepository');
const { generateSlug, generateSKU } = require('../utils/helpers');
const { generateProductId } = require('../utils/idGenerator');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { PRODUCT_STATUS } = require('../constants');

class ProductService {
  /**
   * Reserve a sequential product ID upfront, before the product itself
   * (or its images) exist, so uploads can target /uploads/products/{id}/.
   */
  async reserveProductId() {
    return generateProductId();
  }

/**
   * List products with filters, search, sort, pagination.
   */
  async listProducts(queryParams) {
    const result = await ProductRepository.findActiveProducts(queryParams);
    return {
      ...result,
      data: result.data.map(serializeProductForWebsite),
    };
  }

  serializeForStorefront(product) {
    return serializeProductForWebsite(product);
  }

  /**
   * List all products (admin) - includes inactive but not deleted.
   */
  async listAllProducts(queryParams) {
    const { page = 1, limit = 20, search, status, isDeleted } = queryParams;
    const filter = {};

    if (isDeleted === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = false;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;

    return ProductRepository.findAll(filter, {
      sort: { createdAt: -1 },
      page: Number(page),
      limit: Number(limit),
      populate: 'category collection',
    });
  }

  /**
   * Get single product by ID.
   */
  async getProduct(id) {
    const product = await ProductRepository.findById(id, {
      populate: 'category collection',
    });
    return product;
  }

  /**
   * Get product by slug.
   */
  async getProductBySlug(slug) {
    const product = await ProductRepository.findOne({ slug, isDeleted: false, isActive: true }, {
      populate: 'category collection',
    });
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    return product;
  }

  /**
   * Create a new product.
   */
  async createProduct(data) {
    // A productId should normally already be reserved by the client via
    // reserveProductId() before images were uploaded; generate one as a
    // fallback so create() still works if that step was skipped.
    if (!data.productId) {
      data.productId = await generateProductId();
    }

    // Generate SKU if not provided
    if (!data.sku) {
      data.sku = generateSKU('AYT');
    }

    // Generate slug from name
    data.slug = generateSlug(data.name);

    // Set default selling price if not provided
    if (!data.sellingPrice && data.mrp) {
      data.sellingPrice = data.mrp;
    }

    // Calculate profit margin
    if (data.costPrice > 0 && data.sellingPrice > 0) {
      data.profitMargin = ((data.sellingPrice - data.costPrice) / data.sellingPrice) * 100;
    }

    const product = await ProductRepository.create(data);
    logger.info(`Product created: ${product.name} (${product.sku})`);
    return product;
  }

  /**
   * Update a product.
   */
  async updateProduct(id, data) {
    const product = await ProductRepository.findById(id);

    // Regenerate slug if name changed
    if (data.name && data.name !== product.name) {
      data.slug = generateSlug(data.name);
    }

    // Recalculate profit margin if prices changed
    const finalSellingPrice = data.sellingPrice ?? product.sellingPrice;
    const finalCostPrice = data.costPrice ?? product.costPrice;
    if (data.sellingPrice !== undefined || data.costPrice !== undefined) {
      if (finalCostPrice > 0 && finalSellingPrice > 0) {
        data.profitMargin = ((finalSellingPrice - finalCostPrice) / finalSellingPrice) * 100;
      }
    }

    const updated = await ProductRepository.updateById(id, data);
    logger.info(`Product updated: ${updated.name}`);
    return updated;
  }

  /**
   * Soft delete a product.
   */
  async softDeleteProduct(id) {
    const product = await ProductRepository.updateById(id, {
      isDeleted: true,
      deletedAt: new Date(),
      isActive: false,
    });
    logger.info(`Product soft-deleted: ${product.name}`);
    return product;
  }

  /**
   * Restore a soft-deleted product.
   */
  async restoreProduct(id) {
    const existing = await ProductRepository.findOne({ _id: id, isDeleted: true });
    if (!existing) {
      throw AppError.notFound('Deleted product not found');
    }
    const product = await ProductRepository.updateById(id, {
      isDeleted: false,
      deletedAt: null,
      isActive: true,
    });
    logger.info(`Product restored: ${product.name}`);
    return product;
  }

  /**
   * Permanently delete a product.
   */
  async permanentDeleteProduct(id) {
    const product = await ProductRepository.findById(id);
    await ProductRepository.deleteById(id);
    logger.info(`Product permanently deleted: ${product.name}`);
  }

  /**
   * Publish a product.
   */
  async publishProduct(id) {
    return ProductRepository.updateById(id, { status: PRODUCT_STATUS.PUBLISHED, isActive: true });
  }

  /**
   * Unpublish a product.
   */
  async unpublishProduct(id) {
    return ProductRepository.updateById(id, { status: PRODUCT_STATUS.UNPUBLISHED, isActive: false });
  }

  /**
   * Duplicate a product.
   */
  async duplicateProduct(id) {
    const product = await ProductRepository.duplicateProduct(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    logger.info(`Product duplicated: ${product.name}`);
    return product;
  }

  /**
   * Bulk operations on products.
   */
  async bulkOperation(ids, action) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw AppError.badRequest('Product IDs are required');
    }

    let result;
    switch (action) {
      case 'delete':
        result = await ProductRepository.bulkUpdate(
          { _id: { $in: ids } },
          { isDeleted: true, deletedAt: new Date(), isActive: false }
        );
        break;
      case 'restore':
        result = await ProductRepository.bulkUpdate(
          { _id: { $in: ids }, isDeleted: true },
          { isDeleted: false, deletedAt: null, isActive: true }
        );
        break;
      case 'publish':
        result = await ProductRepository.bulkUpdate(
          { _id: { $in: ids } },
          { status: 'Published', isActive: true }
        );
        break;
      case 'unpublish':
        result = await ProductRepository.bulkUpdate(
          { _id: { $in: ids } },
          { status: 'Unpublished', isActive: false }
        );
        break;
      default:
        throw AppError.badRequest(`Unknown action: ${action}`);
    }

    logger.info(`Bulk ${action} on ${ids.length} products`);
    return { modifiedCount: result.modifiedCount || result.nModified || 0 };
  }

  // Flag-based product methods removed as per requirements

  /**
   * Search products globally.
   */
  async searchProducts(searchTerm, options = {}) {
    const { page = 1, limit = 20 } = options;
    const filter = {
      isDeleted: false,
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
        { sareeFabric: { $regex: searchTerm, $options: 'i' } },
        { primaryColor: { $regex: searchTerm, $options: 'i' } },
        { 'variants.sku': { $regex: searchTerm, $options: 'i' } },
      ],
    };

const result = await ProductRepository.findAll(filter, {
      sort: { totalSold: -1 },
      page: Number(page),
      limit: Number(limit),
    });
    return { ...result, data: result.data.map(serializeProductForWebsite) };
  }

  /**
   * Get low stock products.
   */
  async getLowStockProducts(threshold = 5) {
    return ProductRepository.findLowStockProducts(threshold);
  }

  /**
   * Get product counts by status.
   */
  async getProductCounts() {
    const [total, active, deleted, draft, published, lowStock] = await Promise.all([
      ProductRepository.count({ isDeleted: false }),
      ProductRepository.count({ isDeleted: false, isActive: true }),
      ProductRepository.count({ isDeleted: true }),
      ProductRepository.count({ isDeleted: false, status: 'Draft' }),
      ProductRepository.count({ isDeleted: false, status: 'Published' }),
      ProductRepository.findLowStockProducts(5),
    ]);

    return {
      total,
      active,
      deleted,
      draft,
      published,
      lowStock: lowStock.length,
    };
  }

// ─── Storefront Featured / Curated Lists ─────────────────────────────
  async getFeaturedProducts(limit = 10) {
    const result = await ProductRepository.findAll(
      { isDeleted: false, isActive: true, status: PRODUCT_STATUS.PUBLISHED },
      { sort: { totalSold: -1 }, limit: Number(limit), populate: 'category' }
    );
    return { ...result, data: result.data.map(serializeProductForWebsite) };
  }

  async getTrendingProducts(limit = 10) {
    const result = await ProductRepository.findAll(
      { isDeleted: false, isActive: true, status: PRODUCT_STATUS.PUBLISHED },
      { sort: { totalSold: -1, createdAt: -1 }, limit: Number(limit), populate: 'category' }
    );
    return { ...result, data: result.data.map(serializeProductForWebsite) };
  }

  async getBestSellerProducts(limit = 10) {
    const result = await ProductRepository.findAll(
      { isDeleted: false, isActive: true, status: PRODUCT_STATUS.PUBLISHED, totalSold: { $gt: 0 } },
      { sort: { totalSold: -1 }, limit: Number(limit), populate: 'category' }
    );
    return { ...result, data: result.data.map(serializeProductForWebsite) };
  }

  async getTodaysDealProducts(limit = 10) {
    const result = await ProductRepository.findAll(
      { isDeleted: false, isActive: true, status: PRODUCT_STATUS.PUBLISHED, discount: { $gt: 0 } },
      { sort: { discount: -1, createdAt: -1 }, limit: Number(limit), populate: 'category' }
    );
    return { ...result, data: result.data.map(serializeProductForWebsite) };
  }

  async getNewArrivalsProducts(limit = 10) {
    const result = await ProductRepository.findAll(
      { isDeleted: false, isActive: true, status: PRODUCT_STATUS.PUBLISHED },
      { sort: { createdAt: -1 }, limit: Number(limit), populate: 'category' }
    );
    return { ...result, data: result.data.map(serializeProductForWebsite) };
  }

  async getFlashSaleProducts(limit = 10) {
    const result = await ProductRepository.findAll(
      { isDeleted: false, isActive: true, status: PRODUCT_STATUS.PUBLISHED, discount: { $gte: 20 } },
      { sort: { discount: -1, createdAt: -1 }, limit: Number(limit), populate: 'category' }
    );
    return { ...result, data: result.data.map(serializeProductForWebsite) };
  }

  async getRecommendedProducts(limit = 10) {
    const result = await ProductRepository.findAll(
      { isDeleted: false, isActive: true, status: PRODUCT_STATUS.PUBLISHED },
      { sort: { averageRating: -1, totalSold: -1 }, limit: Number(limit), populate: 'category' }
    );
    return { ...result, data: result.data.map(serializeProductForWebsite) };
  }

  /**
   * Get related products.
   */
  async getRelatedProducts(productId, limit = 6) {
    const product = await ProductRepository.findById(productId);
    if (!product.category) return [];

    return ProductRepository.findAll(
      {
        isDeleted: false,
        isActive: true,
        _id: { $ne: productId },
        category: product.category,
      },
      { sort: { totalSold: -1 }, limit }
    );
  }
}

/**
 * Map a backend Product document to the storefront shape that the
 * website frontend expects (price, compareAtPrice, fabric, work, colour,
 * plain image URL array, category name, etc.).
 */
function serializeProductForWebsite(product) {
  if (!product) return product;

  const images = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'string' ? img : (img && img.url) || '')).filter(Boolean)
    : [];

  if (!images.length && product.mainImage) images.push(product.mainImage);
  if (!images.length && product.thumbnail) images.push(product.thumbnail);

  const category = product.category && typeof product.category === 'object'
    ? product.category.name
    : (product.category || '');

  return {
    id: product._id ? product._id.toString() : product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    description: product.description || product.shortDescription || '',
    shortDescription: product.shortDescription,

    // Price fields the storefront expects
    price: Number(product.sellingPrice || 0),
    compareAtPrice: Number(product.mrp || 0),
    mrp: Number(product.mrp || 0),
    sellingPrice: Number(product.sellingPrice || 0),

    // Product identity fields
    fabric: product.sareeFabric || product.productType || '',
    work: product.workType || '',
    workType: product.workType || '',
    colour: product.primaryColor || '',
    color: product.primaryColor || '',
    occasion: Array.isArray(product.occasion) ? product.occasion : [],
    sareeFabric: product.sareeFabric || '',
    primaryColor: product.primaryColor || '',
    pattern: product.pattern || '',
    blouse: product.blouseIncluded !== false ? (product.blouseType || 'Unstitched') : '',

    // Images
    images,
    image: images[0] || '',
    mainImage: product.mainImage || images[0] || '',

    // Category
    categoryName: category,
    category,

    // Commerce fields
    stock: Number(product.stock || 0),
    isFeatured: Boolean(product.isFeatured),
    isActive: Boolean(product.isActive),
    status: product.status,
    totalSold: Number(product.totalSold || 0),
    averageRating: Number(product.averageRating || 0),
    tags: Array.isArray(product.tags) ? product.tags : [],
    variants: Array.isArray(product.variants) ? product.variants : [],

    // Date
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

module.exports = new ProductService();

