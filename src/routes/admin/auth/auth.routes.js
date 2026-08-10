const express = require('express');
const router = express.Router();
const AuthController = require('../../../controllers/admin/auth/AuthController');
const { authenticate, validate, authLimiter } = require('../../../middleware');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } = require('../../../validators/admin/auth.validator');

// Public routes (with rate limiting)
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

// Protected route
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

module.exports = router;
