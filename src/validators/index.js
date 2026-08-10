const authValidator = require('./admin/auth.validator');
const productValidator = require('./product.validator');
const categoryValidator = require('./category.validator');
const collectionValidator = require('./collection.validator');
const orderValidator = require('./order.validator');
const websiteValidator = require('./website.validator');

module.exports = {
  authValidator,
  productValidator,
  categoryValidator,
  collectionValidator,
  orderValidator,
  websiteValidator,
};

