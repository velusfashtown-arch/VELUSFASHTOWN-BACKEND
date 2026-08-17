// Must run before any other require in this file — several seed modules
// require config/connections.js at load time, which reads env vars eagerly.
if (require.main === module) require('dotenv').config();

const { seedAuth } = require('./admin/auth/auth.seed');
const { seedProducts } = require('./admin/products/Product/product.seed');
const { seedCategories } = require('./admin/products/Categories/Category/category.seed');
const { seedSubCategories } = require('./admin/products/Categories/SubCategory/subCategory.seed');
const { seedWebsites } = require('./website.seed');
const { seedMasters } = require('./admin/products/Masters/master.seed');
const { seedCollections } = require('./collection.seed');
const { seedCustomers } = require('./customer.seed');
const { seedOrders } = require('./order.seed');
const { seedForms } = require('./form.seed');
const { seedWebsiteContent } = require('./websiteContent.seed');
const logger = require('../utils/logger');

async function runSeeds() {
  try {
    await seedAuth();
    await seedProducts();
    await seedCategories();
    await seedSubCategories();
    await seedWebsites();
    await seedMasters();
    await seedCollections();
    await seedCustomers();
    await seedOrders();
    await seedForms();
    await seedWebsiteContent();
  } catch (err) {
    logger.error('Seed error:', err);
  }
}

module.exports = { runSeeds };

// Allows `npm run seed` to run this file standalone (outside `app.js`'s
// startup sequence), by connecting to MongoDB itself first.
if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB()
    .then(() => runSeeds())
    .then(() => {
      logger.info('Standalone seed run complete.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Standalone seed run failed:', err);
      process.exit(1);
    });
}
