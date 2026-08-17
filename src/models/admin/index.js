const Admin = require('./auth/auth');
const Product = require('./Product');
const Category = require('./Products/Categories/Category/Category');
const SubCategory = require('./Products/Categories/SubCategory/SubCategory');
const Collection = require('./Collection');
const Order = require('./Order');
const Customer = require('./Customer');
const { Inventory, LowStockAlert } = require('./Inventory');

const tenantModels = require('../tenant');

module.exports = {
  Admin,
  Product,
  Category,
  SubCategory,
  Collection,
  Order,
  Customer,
  Inventory,
  LowStockAlert,
  ...tenantModels,
};

