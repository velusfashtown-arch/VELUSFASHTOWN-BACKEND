const mongoose = require('mongoose');
const BaseRepository = require('../../../BaseRepository');
const Product = require('../../../../models/admin/Products/Product/Product');
const { generateProductId } = require('../../../../utils/idGenerator');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Find active (non-deleted) products with search, filter, sort, pagination.
   */
  async findActiveProducts(queryParams = {}) {
    const {
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      stock,
      status,
      isFeatured,
      isTrending,
      isBestSeller,
      isTodaysDeal,
      isFlashSale,
      isNewArrival,
      occasion,
      tags,
      sort,
      page = 1,
      limit = 20,
    } = queryParams;

    const filter = { isDeleted: false };

    // Search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { 'variants.sku': { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
    }
    if (stock !== undefined) filter.stock = { $gte: Number(stock) };
    if (status) filter.status = status;
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isTrending === 'true') filter.isTrending = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (isTodaysDeal === 'true') filter.isTodaysDeal = true;
    if (isFlashSale === 'true') filter.isFlashSale = true;
    if (isNewArrival === 'true') filter.isNewArrival = true;
    if (occasion) filter.occasion = { $in: occasion.split(',') };
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim().toLowerCase()) };

    // Sort — productId is sequential (PRD00001, PRD00002, ...), so it
    // doubles as a reliable "newest first" ordering without createdAt.
    let sortOption = { productId: -1 };
    switch (sort) {
      case 'price_asc':
        sortOption = { sellingPrice: 1 };
        break;
      case 'price_desc':
        sortOption = { sellingPrice: -1 };
        break;
      case 'newest':
        sortOption = { productId: -1 };
        break;
      case 'oldest':
        sortOption = { productId: 1 };
        break;
      case 'popularity':
        sortOption = { totalSold: -1 };
        break;
      case 'alpha_asc':
        sortOption = { name: 1 };
        break;
      case 'alpha_desc':
        sortOption = { name: -1 };
        break;
      default:
        sortOption = { productId: -1 };
    }

    return this.findAll(filter, {
      sort: sortOption,
      page: Number(page),
      limit: Number(limit),
      populate: 'category',
    });
  }

  /**
   * Find deleted (soft-deleted) products.
   */
  async findDeletedProducts(queryParams = {}) {
    const { page = 1, limit = 20 } = queryParams;
    return this.findAll(
      { isDeleted: true },
      { sort: { deletedAt: -1 }, page: Number(page), limit: Number(limit) }
    );
  }

  /**
   * Duplicate a product.
   */
  async duplicateProduct(id) {
    const product = await this.model.findById(id);
    if (!product) return null;

    const productObj = product.toObject();
    delete productObj._id;
    delete productObj.productId;
    delete productObj.sku;
    delete productObj.totalSold;
    delete productObj.averageRating;
    delete productObj.reviewCount;

    productObj.name = `${productObj.name} (Copy)`;
    productObj.isActive = false;
    productObj.status = 'Draft';
    productObj.productId = await generateProductId();
    // Each variant needs its own identity, not the original's.
    if (Array.isArray(productObj.variants)) {
      productObj.variants = productObj.variants.map((variant) => ({
        ...variant,
        variantId: this.model.generateVariantId(),
      }));
    }

    return this.model.create(productObj);
  }

  /**
   * Get low stock products.
   */
  async findLowStockProducts(threshold = 5) {
    return this.model.find({
      isDeleted: false,
      stock: { $gt: 0, $lte: threshold },
    }).sort({ stock: 1 });
  }

  /**
   * Get products matching either their custom productId or Mongo _id.
   * Used by order placement, which now receives the customer-facing
   * productId (e.g. "PRD00001") rather than the internal Mongo id.
   */
  async findByPublicIds(publicIds, select = '') {
    const objectIds = publicIds.filter((v) => mongoose.Types.ObjectId.isValid(v));
    let query = this.model.find({
      $or: [
        { productId: { $in: publicIds } },
        ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
      ],
    });
    if (select) query = query.select(select);
    return query.exec();
  }

  /**
   * Resolve a single product by its customer-facing productId, falling
   * back to the Mongo _id (used internally / by admin).
   */
  async findByPublicId(publicId, options = {}) {
    const byProductId = await this.findOne({ productId: publicId, isDeleted: false }, options);
    if (byProductId) return byProductId;
    if (mongoose.Types.ObjectId.isValid(publicId)) {
      try {
        return await this.findById(publicId, options);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Same as findByPublicId but without the isDeleted filter — used by
   * admin mutation endpoints (update, delete, restore, publish, etc.)
   * which must be able to target a product regardless of its deleted
   * state (e.g. restoring a soft-deleted product by its productId).
   */
  async findAnyByPublicId(publicId, options = {}) {
    const byProductId = await this.findOne({ productId: publicId }, options);
    if (byProductId) return byProductId;
    if (mongoose.Types.ObjectId.isValid(publicId)) {
      try {
        return await this.findById(publicId, options);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get total stock value (cost price * stock).
   */
  async getTotalStockValue() {
    const result = await this.model.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$costPrice', '$stock'] } },
          totalMRP: { $sum: { $multiply: ['$mrp', '$stock'] } },
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
        },
      },
    ]);
    return result[0] || { totalValue: 0, totalMRP: 0, totalProducts: 0, totalStock: 0 };
  }
}

module.exports = new ProductRepository();
