const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/admin/ProductController');
const { authenticate, authorize, validate } = require('../../middleware');
const { createProductSchema, updateProductSchema, bulkProductSchema } = require('../../validators/product.validator');
const { ROLES } = require('../../constants');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: List all products
 *     tags: [Admin - Products]
 *     security: [{ bearerAuth: [] }]
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
 *         name: status
 *         schema: { type: string }
 *   post:
 *     summary: Create a product
 *     tags: [Admin - Products]
 *     security: [{ bearerAuth: [] }]
 */

router.get('/', ProductController.listAll);
router.post('/reserve-id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), ProductController.reserveId);
router.get('/:id', ProductController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(createProductSchema), ProductController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(updateProductSchema), ProductController.update);
router.delete('/:id', authorize(ROLES.ADMIN), ProductController.softDelete);

// Bulk operations
router.post('/bulk', authorize(ROLES.ADMIN), validate(bulkProductSchema), ProductController.bulkOperation);

// Product actions
router.post('/:id/restore', authorize(ROLES.ADMIN), ProductController.restore);
router.delete('/:id/permanent', authorize(ROLES.ADMIN), ProductController.permanentDelete);
router.post('/:id/publish', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), ProductController.publish);
router.post('/:id/unpublish', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), ProductController.unpublish);
router.post('/:id/duplicate', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), ProductController.duplicate);

// No flag routes - removed as per requirements

module.exports = router;

