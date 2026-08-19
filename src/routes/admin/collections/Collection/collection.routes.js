const express = require('express');
const router = express.Router();
const CollectionController = require('../../../../controllers/admin/collections/Collection/CollectionController');
const { authenticate, authorize, validate } = require('../../../../middleware');
const { createCollectionSchema, updateCollectionSchema } = require('../../../../validators/admin/collections/Collection/collection.validator');
const { ROLES } = require('../../../../constants');

router.use(authenticate);

router.get('/', CollectionController.list);
router.get('/:id', CollectionController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(createCollectionSchema), CollectionController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(updateCollectionSchema), CollectionController.update);
router.delete('/:id', authorize(ROLES.ADMIN), CollectionController.delete);
router.post('/:id/products', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), CollectionController.addProducts);
router.delete('/:id/products', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), CollectionController.removeProducts);

module.exports = router;
