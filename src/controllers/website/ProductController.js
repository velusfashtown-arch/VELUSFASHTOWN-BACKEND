const ProductService = require('../../services/ProductService');
const asyncHandler = require('../../utils/asyncHandler');

class WebsiteProductController {
  /**
   * GET /api/website/products - List active products with filters.
   * Returns the storefront shape: { success, message, products, pagination }.
   */
  list = asyncHandler(async (req, res) => {
    const result = await ProductService.listProducts(req.query);
    return res.json({
      success: true,
      message: 'Success',
      products: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/website/products/featured - Featured products
   */
  getFeatured = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getFeaturedProducts(limit);
    return res.json({ success: true, message: 'Success', products: result.data || result });
  });

  /**
   * GET /api/website/products/trending - Trending products
   */
  getTrending = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getTrendingProducts(limit);
    return res.json({ success: true, message: 'Success', products: result.data || result });
  });

  /**
   * GET /api/website/products/best-seller - Best seller products
   */
  getBestSeller = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getBestSellerProducts(limit);
    return res.json({ success: true, message: 'Success', products: result.data || result });
  });

  /**
   * GET /api/website/products/todays-deal - Today's deal products
   */
  getTodaysDeal = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getTodaysDealProducts(limit);
    return res.json({ success: true, message: 'Success', products: result.data || result });
  });

  /**
   * GET /api/website/products/new-arrivals - New arrival products
   */
  getNewArrivals = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getNewArrivalsProducts(limit);
    return res.json({ success: true, message: 'Success', products: result.data || result });
  });

  /**
   * GET /api/website/products/flash-sale - Flash sale products
   */
  getFlashSale = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getFlashSaleProducts(limit);
    return res.json({ success: true, message: 'Success', products: result.data || result });
  });

  /**
   * GET /api/website/products/recommended - Recommended products
   */
  getRecommended = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await ProductService.getRecommendedProducts(limit);
    return res.json({ success: true, message: 'Success', products: result.data || result });
  });

  /**
   * GET /api/website/products/search - Search products
   */
  search = asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const result = await ProductService.searchProducts(q, { page, limit });
    return res.json({
      success: true,
      message: 'Success',
      products: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/website/products/:slug - Get product by slug or ID.
   * Returns the storefront shape: { success, message, product }.
   */
  getBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    // Try to find by slug first, then by ID
    let product;
    try {
      product = await ProductService.getProductBySlug(slug);
    } catch {
      product = await ProductService.getProduct(slug);
    }
    return res.json({
      success: true,
      message: 'Success',
      product: ProductService.serializeForStorefront(product),
    });
  });

  /**
   * POST /api/website/products/check-delivery - Pincode delivery estimate.
   * Currently a static, format-validated estimate (no external courier
   * call yet); the response shape is deliberately what a real Shiprocket
   * serviceability check would return, so swapping the implementation
   * later won't require a frontend change.
   */
  checkDelivery = asyncHandler(async (req, res) => {
    const { pincode, productId } = req.body;

    if (!/^[1-9][0-9]{5}$/.test(String(pincode || ''))) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6-digit pincode', data: null });
    }

    let codAvailable = true;
    if (productId) {
      try {
        const product = await ProductService.getProduct(productId);
        codAvailable = product?.codAvailable !== false;
      } catch {
        // Unknown product id — still return a generic estimate.
      }
    }

    return res.json({
      success: true,
      message: 'Success',
      data: { serviceable: true, estimatedDays: '4-6', codAvailable },
    });
  });

  /**
   * GET /api/website/products/:id/related - Related products
   */
  getRelated = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const result = await ProductService.getRelatedProducts(req.params.id, limit);
    const list = Array.isArray(result) ? result : (result.data || []);
    return res.json({
      success: true,
      message: 'Success',
      products: list.map((product) => ProductService.serializeForStorefront(product)),
    });
  });
}

module.exports = new WebsiteProductController();
