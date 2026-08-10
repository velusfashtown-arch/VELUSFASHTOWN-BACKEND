const { seedAuth } = require('./admin/auth/auth.seed');
const { seedProducts } = require('./products.seed');
const { seedWebsites } = require('./website.seed');
const logger = require('../utils/logger');

async function runSeeds() {
  try {
    await seedAuth();
    await seedProducts();
    await seedWebsites();
  } catch (err) {
    logger.error('Seed error:', err);
  }
}

module.exports = { runSeeds };

