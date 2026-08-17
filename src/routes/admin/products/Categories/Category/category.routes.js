const express = require('express');
const router = express.Router();
const CategoryController = require('../../../../../controllers/admin/products/Categories/Category/CategoryController');
const { authenticate, authorize, validate } = require('../../../../../middleware');
const { createCategorySchema, updateCategorySchema, toggleCategoryActiveSchema } = require('../../../../../validators/admin/products/Categories/Category/category.validator');
const { ROLES } = require('../../../../../constants');

router.use(authenticate);

router.get('/', CategoryController.list);
router.get('/:id', CategoryController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(createCategorySchema), CategoryController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(updateCategorySchema), CategoryController.update);
router.patch('/:id/toggle-active', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(toggleCategoryActiveSchema), CategoryController.toggleActive);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), CategoryController.delete);

module.exports = router;
