const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/admin/AuthController');
const { authenticate, authorize, validate, authLimiter } = require('../../middleware');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, refreshTokenSchema, registerSchema } = require('../../validators/auth.validator');
const { ROLES } = require('../../constants');

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminLogin:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         data:
 *           type: object
 *           properties:
 *             accessToken: { type: string }
 *             refreshToken: { type: string }
 *             admin: { type: object }
 */

// Public routes (with rate limiting)
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/refresh-token', authLimiter, validate(refreshTokenSchema), AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.get('/me', authenticate, AuthController.getProfile);

// Super admin routes
router.post('/create', authenticate, authorize(ROLES.ADMIN), validate(registerSchema), AuthController.createAdmin);
router.get('/admins', authenticate, authorize(ROLES.ADMIN), AuthController.listAdmins);
router.put('/admins/:id', authenticate, authorize(ROLES.ADMIN), AuthController.updateAdmin);
router.delete('/admins/:id', authenticate, authorize(ROLES.ADMIN), AuthController.deleteAdmin);

module.exports = router;

