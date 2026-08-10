const Admin = require('./auth/auth');
const Product = require('./Product');
const Category = require('./Category');
const Collection = require('./Collection');
const Order = require('./Order');
const Customer = require('./Customer');
const { Inventory, LowStockAlert } = require('./Inventory');

const tenantModels = require('../tenant');

module.exports = {
  Admin,
  Product,
  Category,
  Collection,
  Order,
  Customer,
  Inventory,
  LowStockAlert,
  ...tenantModels,
};

