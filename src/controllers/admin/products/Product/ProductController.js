const ProductService = require('../../../../services/admin/products/Product/ProductService');
const asyncHandler = require('../../../../utils/asyncHandler');
const ApiResponse = require('../../../../utils/response');

// Do not spread an unpopulated Mongo ObjectId ref: it serializes its
// internal Buffer as `buffer.data`. Only expose the customId + name a
// caller needs to match a selected category/sub category by id.
function refCategory(ref) {
  if (!ref || typeof ref !== 'object' || !ref.categoryId) return null;
  return { id: ref.categoryId, name: ref.name };
}

function refSubCategory(ref) {
  if (!ref || typeof ref !== 'object' || !ref.subCategoryId) return null;
  return { id: ref.subCategoryId, name: ref.name };
}

function cleanImage(image) {
  if (!image) return image;
  return { url: image.url, order: image.order, isMain: image.isMain };
}

function cleanVariant(variant) {
  return {
    id: variant.variantId,
    sku: variant.sku,
    color: variant.color,
    price: variant.price,
    mrp: variant.mrp,
    stock: variant.stock,
    images: Array.isArray(variant.images) ? variant.images.map(cleanImage) : [],
    isActive: variant.isActive,
  };
}

// Every product response's `id` is the human-readable productId (e.g.
// "PRD00002"), never the Mongo _id. category/subCategory are always
// { id: customId, name } — never a raw database id or an unpopulated
// ObjectId — and no Mongo _id, __v, or timestamps ever reach the client.
function cleanProduct(product) {
  if (!product) return product;
  const p = typeof product.toJSON === 'function' ? product.toJSON() : product;

  return {
    id: p.productId || p.id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    shortDescription: p.shortDescription,
    mrp: p.mrp,
    sellingPrice: p.sellingPrice,
    costPrice: p.costPrice,
    discount: p.discount,
    gst: p.gst,
    profitMargin: p.profitMargin,
    category: refCategory(p.category),
    subCategory: refSubCategory(p.subCategory),
    stock: p.stock,
    lowStockAlert: p.lowStockAlert,
    stockStatus: p.stockStatus,
    countryOfOrigin: p.countryOfOrigin,
    manufacturer: p.manufacturer,
    packer: p.packer,
    mainImage: p.mainImage,
    images: Array.isArray(p.images) ? p.images.map(cleanImage) : [],
    productVideo: p.productVideo,
    youtubeUrl: p.youtubeUrl,
    instagramReelUrl: p.instagramReelUrl,
    hasVariants: p.hasVariants,
    variants: Array.isArray(p.variants) ? p.variants.map(cleanVariant) : [],
    customFields: p.customFields,
    tags: p.tags,
    status: p.status,
    isActive: p.isActive,
    isDeleted: p.isDeleted,
    deletedAt: p.deletedAt,
    totalSold: p.totalSold,
    averageRating: p.averageRating,
    reviewCount: p.reviewCount,
  };
}

class ProductController {
  reserveId = asyncHandler(async (req, res) => {
    const productId = await ProductService.reserveProductId();
    return ApiResponse.success(res, { data: { productId }, message: 'Product ID reserved' });
  });

  listAll = asyncHandler(async (req, res) => {
    const result = await ProductService.listAllProducts(req.query);
    return ApiResponse.paginated(res, {
      data: result.data.map(cleanProduct),
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const product = await ProductService.getProduct(req.params.id);
    return ApiResponse.success(res, { data: cleanProduct(product) });
  });

  create = asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.body);
    return ApiResponse.created(res, { data: cleanProduct(product), message: 'Product created successfully' });
  });

  update = asyncHandler(async (req, res) => {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    return ApiResponse.success(res, { data: cleanProduct(product), message: 'Product updated successfully' });
  });

  softDelete = asyncHandler(async (req, res) => {
    const product = await ProductService.softDeleteProduct(req.params.id);
    return ApiResponse.success(res, { data: cleanProduct(product), message: 'Product moved to trash' });
  });

  restore = asyncHandler(async (req, res) => {
    const product = await ProductService.restoreProduct(req.params.id);
    return ApiResponse.success(res, { data: cleanProduct(product), message: 'Product restored successfully' });
  });

  permanentDelete = asyncHandler(async (req, res) => {
    await ProductService.permanentDeleteProduct(req.params.id);
    return ApiResponse.success(res, { message: 'Product permanently deleted' });
  });

  publish = asyncHandler(async (req, res) => {
    const product = await ProductService.publishProduct(req.params.id);
    return ApiResponse.success(res, { data: cleanProduct(product), message: 'Product published' });
  });

  unpublish = asyncHandler(async (req, res) => {
    const product = await ProductService.unpublishProduct(req.params.id);
    return ApiResponse.success(res, { data: cleanProduct(product), message: 'Product unpublished' });
  });

  duplicate = asyncHandler(async (req, res) => {
    const product = await ProductService.duplicateProduct(req.params.id);
    return ApiResponse.created(res, { data: cleanProduct(product), message: 'Product duplicated' });
  });

  bulkOperation = asyncHandler(async (req, res) => {
    const { ids, action } = req.body;
    const result = await ProductService.bulkOperation(ids, action);
    return ApiResponse.success(res, { data: result, message: `Bulk ${action} completed` });
  });

  // Flag toggles removed as per requirements
}

module.exports = new ProductController();
