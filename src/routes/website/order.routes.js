const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/website/OrderController');
const { authenticateCustomer } = require('../../middleware');

/**
 * @swagger
 * /api/website/orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Website - Orders]
 *   get:
 *     summary: List orders
 *     tags: [Website - Orders]
 */

router.post('/', authenticateCustomer, OrderController.placeOrder);
router.get('/mine', authenticateCustomer, OrderController.listMyOrders);
router.get('/', OrderController.listOrders);
router.post('/track', OrderController.trackOrder);
router.get('/:id', OrderController.getOrder);

module.exports = router;
