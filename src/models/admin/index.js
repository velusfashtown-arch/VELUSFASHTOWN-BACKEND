const Admin = require('./auth/auth');
const Product = require('./Products/Product/Product');
const Category = require('./Products/Categories/Category/Category');
const SubCategory = require('./Products/Categories/SubCategory/SubCategory');
const Collection = require('./Collections/Collection/Collection');
const Order = require('./Orders/Order/Order');
const Customer = require('./Customers/Customer/Customer');

const tenantModels = require('../tenant');

module.exports = {
  Admin,
  Product,
  Category,
  SubCategory,
  Collection,
  Order,
  Customer,
  ...tenantModels,
};

