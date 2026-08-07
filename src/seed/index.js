const { seedAdmin } = require('./admin.seed');
const { seedProducts } = require('./products.seed');
const logger = require('../utils/logger');

async function runSeeds() {
  try {
    await seedAdmin();
    await seedProducts();
  } catch (err) {
    logger.error('Seed error:', err);
  }
}

module.exports = { runSeeds };

