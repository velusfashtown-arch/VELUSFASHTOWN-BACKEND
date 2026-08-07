const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/website/ProductController');

/**
 * @swagger
 * /api/website/products:
 *   get:
 *     summary: List active products
 *     tags: [Website - Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price_asc, price_desc, newest, popularity] }
 */

// Important: Specific routes must come before /:slug
router.get('/', ProductController.list);
router.get('/featured', ProductController.getFeatured);
router.get('/trending', ProductController.getTrending);
router.get('/best-seller', ProductController.getBestSeller);
router.get('/todays-deal', ProductController.getTodaysDeal);
router.get('/new-arrivals', ProductController.getNewArrivals);
router.get('/flash-sale', ProductController.getFlashSale);
router.get('/recommended', ProductController.getRecommended);
router.get('/search', ProductController.search);
router.post('/check-delivery', ProductController.checkDelivery);

router.get('/:slug', ProductController.getBySlug);
router.get('/:id/related', ProductController.getRelated);

module.exports = router;
