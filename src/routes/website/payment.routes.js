const express = require('express');
const PaymentController = require('../../controllers/website/PaymentController');

const router = express.Router();

router.post('/create-order', PaymentController.createRazorpayOrder);
router.post('/verify', PaymentController.verifyPayment);
router.post('/failed', PaymentController.paymentFailed);
router.post('/webhook', PaymentController.webhook);

module.exports = router;
