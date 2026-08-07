const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/website/OrderController');
const { authenticateCustomer, optionalCustomer } = require('../../middleware');

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

// Order placement allows both signed-in customers and "guest" checkout.
// When a valid customer token is present, the order is linked to that
// customer; otherwise it is created with the submitted billing address.
router.post('/', optionalCustomer, OrderController.placeOrder);
router.get('/mine', authenticateCustomer, OrderController.listMyOrders);
router.get('/', OrderController.listOrders);
router.post('/track', OrderController.trackOrder);
router.get('/:id', OrderController.getOrder);

module.exports = router;
