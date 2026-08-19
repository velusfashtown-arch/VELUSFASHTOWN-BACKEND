const Collection = require('../../../../models/admin/Collections/Collection/Collection');
const Product = require('../../../../models/admin/Products/Product/Product');
const logger = require('../../../../utils/logger');
const { generateSlug } = require('../../../../utils/helpers');

// Groups the products seeded by seedProducts into a few storefront
// collections, so the admin Collections screen isn't empty.
async function seedCollections() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  if (forceReset) {
    await Collection.deleteMany({});
  }

  const existingCount = await Collection.countDocuments({});
  if (existingCount > 0) {
    logger.info(`Collections already seeded (${existingCount}). Skipping.`);
    return;
  }

  const products = await Product.find({ isDeleted: false }).select('_id tags occasion').lean();
  if (products.length === 0) {
    logger.info('No products found yet — skipping collection seed.');
    return;
  }

  const byOccasion = (occasion) =>
    products.filter((p) => (p.occasion || []).includes(occasion)).map((p) => p._id);
  const byTag = (tag) => products.filter((p) => (p.tags || []).includes(tag)).map((p) => p._id);

  const collections = [
    {
      name: 'Wedding Collection',
      description: 'Statement sarees for weddings and receptions',
      products: byOccasion('Wedding'),
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Festive Collection',
      description: 'Vibrant sarees for festivals and celebrations',
      products: byOccasion('Festival'),
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: 'Everyday Essentials',
      description: 'Comfortable sarees for daily and office wear',
      products: byTag('daily').length ? byTag('daily') : byOccasion('Casual'),
      isFeatured: false,
      sortOrder: 3,
    },
    {
      name: 'New Arrivals',
      description: 'Freshly added to the catalog',
      products: products.map((p) => p._id),
      isFeatured: true,
      sortOrder: 4,
    },
  ];

  // insertMany bypasses the pre('save') hook that generates the slug, so
  // build it here — the slug field has a unique index and must not be null
  // for more than one document (see products.seed.js for the same pattern).
  const withProducts = collections
    .filter((c) => c.products.length > 0)
    .map((c) => ({ ...c, slug: generateSlug(c.name) }));
  await Collection.insertMany(withProducts);
  logger.info(`Seeded ${withProducts.length} collections`);
}

module.exports = { seedCollections };
