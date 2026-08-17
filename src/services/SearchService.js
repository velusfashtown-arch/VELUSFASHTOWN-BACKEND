const ProductRepository = require('../repositories/ProductRepository');
const CategoryRepository = require('../repositories/admin/products/Categories/Category/CategoryRepository');

class SearchService {
  /**
   * Global search across products and categories.
   */
  async globalSearch(searchTerm, options = {}) {
    const { page = 1, limit = 20 } = options;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return { products: [], categories: [], totalResults: 0 };
    }

    const regex = new RegExp(searchTerm.trim(), 'i');

    const [products, categories] = await Promise.all([
      ProductRepository.findAll(
        {
          isDeleted: false,
          isActive: true,
          $or: [
            { name: regex },
            { sku: regex },
            { tags: { $in: [regex] } },
            { sareeFabric: regex },
            { primaryColor: regex },
            { occasion: { $in: [regex] } },
          ],
        },
        {
          sort: { totalSold: -1 },
          page: Number(page),
          limit: Number(limit),
          populate: 'category',
        }
      ),
      CategoryRepository.findAll(
        { isActive: true, name: regex },
        { page: 1, limit: 10, sort: { sortOrder: 1 } }
      ),
    ]);

    return {
      products: products.data || [],
      categories: categories.data || [],
      totalResults: (products.pagination?.total || 0) +
        (categories.pagination?.total || 0),
    };
  }

  /**
   * Get search suggestions (autocomplete).
   */
  async getSuggestions(searchTerm, limit = 5) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const regex = new RegExp(searchTerm.trim(), 'i');

    const products = await ProductRepository.findAll(
      { isDeleted: false, isActive: true, name: regex },
      { sort: { totalSold: -1 }, limit, select: 'name slug sellingPrice mainImage' }
    );

    return (products.data || []).map((p) => ({
      type: 'product',
      id: p._id,
      name: p.name,
      slug: p.slug,
      price: p.sellingPrice,
      image: p.mainImage || '',
    }));
  }
}

module.exports = new SearchService();

