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

// ─── Admin Routes (Private) ───────────────────────────────────────────
const adminAuthRoutes = require('./admin/auth.routes');
const adminProductRoutes = require('./admin/product.routes');
const adminCategoryRoutes = require('./admin/category.routes');
const adminCollectionRoutes = require('./admin/collection.routes');
const adminOrderRoutes = require('./admin/order.routes');
const adminCustomerRoutes = require('./admin/customer.routes');
const adminDashboardRoutes = require('./admin/dashboard.routes');
const adminUploadRoutes = require('./admin/upload.routes');
const adminSearchRoutes = require('./admin/search.routes');
const adminShippingRoutes = require('./admin/shipping.routes');

router.use('/admin/auth', adminAuthRoutes);
router.use('/admin/products', adminProductRoutes);
router.use('/admin/categories', adminCategoryRoutes);
router.use('/admin/collections', adminCollectionRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/customers', adminCustomerRoutes);
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/upload', adminUploadRoutes);
router.use('/admin/search', adminSearchRoutes);
router.use('/admin/shipping', adminShippingRoutes);

module.exports = router;
