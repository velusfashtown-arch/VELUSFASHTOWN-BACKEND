const mongoose = require('mongoose');

const adminUri = process.env.MONGODB_ADMIN_URI;
const websiteUri = process.env.MONGODB_WEBSITE_URI;

if (!adminUri) throw new Error('MONGODB_ADMIN_URI is missing in environment variables');
if (!websiteUri) throw new Error('MONGODB_WEBSITE_URI is missing in environment variables');

mongoose.set('strictQuery', true);

const connectionOptions = {
  autoIndex: true,
  // Fail fast instead of buffering commands while disconnected.
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

/**
 * Two logical databases, two separate mongoose connections:
 *   - adminConnection   -> catalog + staff data (Admin, Product, Category,
 *                          Collection, Order, Customer, Inventory, Counter)
 *   - websiteConnection -> per-website storefront data (Website, homepage
 *                          sections, navigation, banners, coupons, etc.)
 *
 * Kept as separate connections (not one connection + `.useDb()`) so either
 * database can move to a different cluster later without touching model
 * files — only MONGODB_ADMIN_URI / MONGODB_WEBSITE_URI would change.
 *
 * Mongoose model registries are per-connection, so a doc in one database
 * can't `.populate()` a ref that lives in the other — those joins are
 * done with a manual lookup instead (see WebsiteProductService /
 * WebsiteProductRepository for the pattern).
 */
const adminConnection = mongoose.createConnection(adminUri, connectionOptions);
const websiteConnection = mongoose.createConnection(websiteUri, connectionOptions);

module.exports = { adminConnection, websiteConnection };
