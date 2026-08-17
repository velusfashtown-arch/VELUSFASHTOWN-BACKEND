const express = require('express');
const router = express.Router();
const SubCategoryController = require('../../../../../controllers/admin/products/Categories/SubCategory/SubCategoryController');
const { authenticate, authorize, validate } = require('../../../../../middleware');
const { createSubCategorySchema, updateSubCategorySchema, toggleSubCategoryActiveSchema } = require('../../../../../validators/admin/products/Categories/SubCategory/subCategory.validator');
const { ROLES } = require('../../../../../constants');

router.use(authenticate);

router.get('/', SubCategoryController.list);
router.get('/:id', SubCategoryController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(createSubCategorySchema), SubCategoryController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(updateSubCategorySchema), SubCategoryController.update);
router.patch('/:id/toggle-active', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(toggleSubCategoryActiveSchema), SubCategoryController.toggleActive);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), SubCategoryController.delete);

module.exports = router;
