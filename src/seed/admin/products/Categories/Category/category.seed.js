const Category = require('../../../../../models/admin/Products/Categories/Category/Category');
const logger = require('../../../../../utils/logger');

// Root "Sarees" category used by seedProducts and, in turn, by the
// sub-category seed below.
async function seedCategories() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  if (forceReset) {
    await Category.deleteMany({});
  }

  const existingCount = await Category.countDocuments({});
  if (existingCount > 0) {
    logger.info(`Categories already seeded (${existingCount}). Skipping.`);
    return;
  }

  await Category.create({
    name: 'Sarees',
    description: 'Traditional and modern sarees',
    isActive: true,
  });
  logger.info('Seeded 1 category ("Sarees")');
}

module.exports = { seedCategories };
