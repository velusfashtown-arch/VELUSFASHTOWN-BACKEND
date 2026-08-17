const express = require('express');
const router = express.Router();

// ─── Website Routes (Public) ──────────────────────────────────────────
const websiteProductRoutes = require('./website/product.routes');
const websiteAuthRoutes = require('./website/auth.routes');
const websiteOrderRoutes = require('./website/order.routes');
const websitePaymentRoutes = require('./website/payment.routes');

router.use('/website/products', websiteProductRoutes);
router.use('/website/auth', websiteAuthRoutes);
router.use('/website/orders', websiteOrderRoutes);
router.use('/website/payments', websitePaymentRoutes);

// ─── Storefront Routes (Multi-Website) ────────────────────────────────
const storefrontRoutes = require('./storefront/index.routes');
router.use('/storefront', storefrontRoutes);

// ─── Admin Routes (Private) ───────────────────────────────────────────
const adminAuthRoutes = require('./admin/auth/auth.routes');
const adminCategoryRoutes = require('./admin/products/Categories/Category/category.routes');
const adminSubCategoryRoutes = require('./admin/products/Categories/SubCategory/subCategory.routes');
const adminMasterRoutes = require('./admin/products/Masters/master.routes');
const adminProductRoutes = require('./admin/products/Product/product.routes');
const adminCollectionRoutes = require('./admin/collection.routes');
const adminOrderRoutes = require('./admin/order.routes');
const adminCustomerRoutes = require('./admin/customer.routes');
const adminDashboardRoutes = require('./admin/dashboard.routes');
const adminUploadRoutes = require('./admin/upload.routes');
const adminSearchRoutes = require('./admin/search.routes');
const adminShippingRoutes = require('./admin/shipping.routes');
const adminWebsiteRoutes = require('./admin/website.routes');

router.use('/admin/auth', adminAuthRoutes);
router.use('/admin/category', adminCategoryRoutes);
router.use('/admin/sub-category', adminSubCategoryRoutes);
router.use('/admin/masters', adminMasterRoutes);
router.use('/admin/products', adminProductRoutes);
router.use('/admin/collections', adminCollectionRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/customers', adminCustomerRoutes);
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/upload', adminUploadRoutes);
router.use('/admin/search', adminSearchRoutes);
router.use('/admin/shipping', adminShippingRoutes);
router.use('/admin/websites', adminWebsiteRoutes);

module.exports = router;
