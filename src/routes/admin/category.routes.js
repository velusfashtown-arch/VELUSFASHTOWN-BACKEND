const express = require('express');
const router = express.Router();
const CategoryController = require('../../controllers/admin/CategoryController');
const { authenticate, authorize, validate } = require('../../middleware');
const { createCategorySchema, updateCategorySchema } = require('../../validators/category.validator');
const { ROLES } = require('../../constants');

router.use(authenticate);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Admin - Category]
 *   post:
 *     summary: Create a category
 *     tags: [Admin - Category]
 */

router.get('/', CategoryController.list);
router.get('/tree', CategoryController.getTree);
router.get('/:id', CategoryController.getById);
router.get('/:id/children', CategoryController.getChildren);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createCategorySchema), CategoryController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), CategoryController.delete);

module.exports = router;

