const AuthRepository = require('./AuthRepository');
const ProductRepository = require('./admin/products/Product/ProductRepository');
const CategoryRepository = require('./admin/products/Categories/Category/CategoryRepository');
const SubCategoryRepository = require('./admin/products/Categories/SubCategory/SubCategoryRepository');
const CollectionRepository = require('./CollectionRepository');
const OrderRepository = require('./OrderRepository');
const CustomerRepository = require('./CustomerRepository');
const WebsiteRepository = require('./WebsiteRepository');
const WebsiteProductRepository = require('./WebsiteProductRepository');
const MasterRepository = require('./admin/products/Masters/MasterRepository');
const FormRepository = require('./FormRepository');
const FormSubmissionRepository = require('./FormSubmissionRepository');

module.exports = {
  AuthRepository,
  ProductRepository,
  CategoryRepository,
  SubCategoryRepository,
  CollectionRepository,
  OrderRepository,
  CustomerRepository,
  WebsiteRepository,
  WebsiteProductRepository,
  MasterRepository,
  FormRepository,
  FormSubmissionRepository,
};

