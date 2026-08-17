const Category = require('../../../../../models/admin/Products/Categories/Category/Category');
const SubCategory = require('../../../../../models/admin/Products/Categories/SubCategory/SubCategory');
const logger = require('../../../../../utils/logger');

// Sub-categories nested under the root "Sarees" category, so the admin
// Sub Category screen isn't empty.
async function seedSubCategories() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  const root = await Category.findOne({ name: 'Sarees' });
  if (!root) {
    logger.info('Root "Sarees" category not found yet — skipping sub-category seed.');
    return;
  }

  if (forceReset) {
    await SubCategory.deleteMany({ category: root._id });
  }

  const existingCount = await SubCategory.countDocuments({ category: root._id });
  if (existingCount > 0) {
    logger.info(`Sub-categories already seeded (${existingCount}). Skipping.`);
    return;
  }

  const subCategories = [
    { name: 'Banarasi Sarees', description: 'Silk sarees woven with intricate zari work' },
    { name: 'Cotton Sarees', description: 'Lightweight handloom cotton sarees for daily wear' },
    { name: 'Georgette Sarees', description: 'Flowy embroidered georgette sarees for festive occasions' },
    { name: 'Chiffon Sarees', description: 'Soft everyday chiffon sarees' },
    { name: 'Party Wear Sarees', description: 'Statement sarees for parties and receptions' },
  ];

  for (const sub of subCategories) {
    await SubCategory.create({ ...sub, category: root._id, isActive: true });
  }
  logger.info(`Seeded ${subCategories.length} sub-categories under "${root.name}"`);
}

module.exports = { seedSubCategories };
