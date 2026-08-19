const AuthService = require('./admin/auth/AuthService');
const ProductService = require('./admin/products/Product/ProductService');
const CategoryService = require('./admin/products/Categories/Category/CategoryService');
const SubCategoryService = require('./admin/products/Categories/SubCategory/SubCategoryService');
const CollectionService = require('./admin/collections/Collection/CollectionService');
const OrderService = require('./admin/orders/Order/OrderService');
const CustomerService = require('./admin/customers/Customer/CustomerService');
const DashboardService = require('./DashboardService');
const UploadService = require('./UploadService');
const SearchService = require('./SearchService');
const WebsiteService = require('./WebsiteService');
const WebsiteProductService = require('./WebsiteProductService');
const WebsiteContentService = require('./WebsiteContentService');
const MasterService = require('./admin/products/Masters/MasterService');
const FormService = require('./admin/forms/Form/FormService');
const FormSubmissionService = require('./admin/forms/FormSubmission/FormSubmissionService');

module.exports = {
  AuthService,
  ProductService,
  CategoryService,
  SubCategoryService,
  CollectionService,
  OrderService,
  CustomerService,
  DashboardService,
  UploadService,
  SearchService,
  WebsiteService,
  WebsiteProductService,
  WebsiteContentService,
  MasterService,
  FormService,
  FormSubmissionService,
};

