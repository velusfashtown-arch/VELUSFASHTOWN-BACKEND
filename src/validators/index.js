const authValidator = require('./admin/auth/auth.validator');
const productValidator = require('./product.validator');
const categoryValidator = require('./admin/products/Categories/Category/category.validator');
const subCategoryValidator = require('./admin/products/Categories/SubCategory/subCategory.validator');
const collectionValidator = require('./collection.validator');
const orderValidator = require('./order.validator');
const websiteValidator = require('./website.validator');

module.exports = {
  authValidator,
  productValidator,
  categoryValidator,
  subCategoryValidator,
  collectionValidator,
  orderValidator,
  websiteValidator,
};

