const express = require('express');
const router = express.Router();
const { resolveWebsite } = require('../../middleware/resolveWebsite');
const { StorefrontController } = require('../../controllers/storefront/StorefrontController');

// Resolve the website for every storefront request.
router.use(resolveWebsite);

/**
 * @swagger
 * /api/storefront/:websiteSlug/home:
 *   get:
 *     summary: Get website config + homepage sections + banners
 *     tags: [Storefront]
 */
router.get('/home', StorefrontController.home);

/**
 * @swagger
 * /api/storefront/:websiteSlug/products:
 *   get:
 *     summary: List approved + published products for a website
 *     tags: [Storefront]
 */
router.get('/products', StorefrontController.products);
router.get('/products/:slug', StorefrontController.productionDetail);

/**
 * @swagger
 * /api/storefront/:websiteSlug/categories:
 *   get:
 *     summary: List categories
 *     tags: [Storefront]
 */
router.get('/categories', StorefrontController.categories);

/**
 * @swagger
 * /api/storefront/:websiteSlug/collections:
 *   get:
 *     summary: List collections
 *     tags: [Storefront]
 */
router.get('/collections', StorefrontController.collections);

/**
 * @swagger
 * /api/storefront/:websiteSlug/navigation:
 *   get:
 *     summary: Get website navigation
 *     tags: [Storefront]
 */
router.get('/navigation', StorefrontController.navigation);

/**
 * @swagger
 * /api/storefront/:websiteSlug/pages/:pageSlug:
 *   get:
 *     summary: Get a CMS page
 *     tags: [Storefront]
 */
router.get('/pages/:slug', StorefrontController.page);

/**
 * @swagger
 * /api/storefront/:websiteSlug/search:
 *   get:
 *     summary: Search live products for a website
 *     tags: [Storefront]
 */
router.get('/search', StorefrontController.search);

module.exports = router;
