const BaseRepository = require('./BaseRepository');
const Product = require('../models/admin/Product');

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
      collection,
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
      fabric,
      occasion,
      color,
      pattern,
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
    if (collection) filter.collection = collection;
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
    if (fabric) filter.sareeFabric = { $regex: fabric, $options: 'i' };
    if (occasion) filter.occasion = { $in: occasion.split(',') };
    if (color) filter.primaryColor = { $regex: color, $options: 'i' };
    if (pattern) filter.pattern = { $regex: pattern, $options: 'i' };
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim().toLowerCase()) };

    // Sort
    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOption = { sellingPrice: 1 };
        break;
      case 'price_desc':
        sortOption = { sellingPrice: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
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
        sortOption = { createdAt: -1 };
    }

    return this.findAll(filter, {
      sort: sortOption,
      page: Number(page),
      limit: Number(limit),
      populate: 'category collection',
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
    delete productObj.slug;
    delete productObj.sku;
    delete productObj.createdAt;
    delete productObj.updatedAt;
    delete productObj.totalSold;
    delete productObj.averageRating;
    delete productObj.reviewCount;

    productObj.name = `${productObj.name} (Copy)`;
    productObj.isActive = false;
    productObj.status = 'Draft';

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
   * Get products by IDs with optional fields.
   */
  async findByIds(ids, select = '') {
    let query = this.model.find({ _id: { $in: ids } });
    if (select) query = query.select(select);
    return query.exec();
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

