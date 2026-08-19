const AuthRepository = require('./AuthRepository');
const ProductRepository = require('./admin/products/Product/ProductRepository');
const CategoryRepository = require('./admin/products/Categories/Category/CategoryRepository');
const SubCategoryRepository = require('./admin/products/Categories/SubCategory/SubCategoryRepository');
const CollectionRepository = require('./admin/collections/Collection/CollectionRepository');
const OrderRepository = require('./admin/orders/Order/OrderRepository');
const CustomerRepository = require('./admin/customers/Customer/CustomerRepository');
const WebsiteRepository = require('./WebsiteRepository');
const WebsiteProductRepository = require('./WebsiteProductRepository');
const MasterRepository = require('./admin/products/Masters/MasterRepository');
const FormRepository = require('./admin/forms/Form/FormRepository');
const FormSubmissionRepository = require('./admin/forms/FormSubmission/FormSubmissionRepository');

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

