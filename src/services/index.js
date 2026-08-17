const AuthService = require('./admin/auth/AuthService');
const ProductService = require('./ProductService');
const CategoryService = require('./admin/products/Categories/Category/CategoryService');
const SubCategoryService = require('./admin/products/Categories/SubCategory/SubCategoryService');
const CollectionService = require('./CollectionService');
const OrderService = require('./OrderService');
const CustomerService = require('./CustomerService');
const DashboardService = require('./DashboardService');
const UploadService = require('./UploadService');
const SearchService = require('./SearchService');
const WebsiteService = require('./WebsiteService');
const WebsiteProductService = require('./WebsiteProductService');
const WebsiteContentService = require('./WebsiteContentService');
const MasterService = require('./admin/products/Masters/MasterService');
const FormService = require('./FormService');
const FormSubmissionService = require('./FormSubmissionService');

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

