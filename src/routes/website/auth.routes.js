const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/website/AuthController');
const { authLimiter, authenticateCustomer } = require('../../middleware');

/**
 * @swagger
 * /api/website/auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Website - Auth]
 * /api/website/auth/login:
 *   post:
 *     summary: Customer login
 *     tags: [Website - Auth]
 */

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/verify-otp', authLimiter, AuthController.verifyOtp);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.get('/me', authenticateCustomer, AuthController.getProfile);
router.put('/me', authenticateCustomer, AuthController.updateProfile);

router.post('/addresses', authenticateCustomer, AuthController.addAddress);
router.put('/addresses/:addressId', authenticateCustomer, AuthController.updateAddress);
router.delete('/addresses/:addressId', authenticateCustomer, AuthController.deleteAddress);

module.exports = router;
