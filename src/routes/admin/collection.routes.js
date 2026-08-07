const express = require('express');
const router = express.Router();
const CollectionController = require('../../controllers/admin/CollectionController');
const { authenticate, authorize, validate } = require('../../middleware');
const { createCollectionSchema, updateCollectionSchema } = require('../../validators/collection.validator');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.get('/', CollectionController.list);
router.get('/:id', CollectionController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createCollectionSchema), CollectionController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(updateCollectionSchema), CollectionController.update);
router.delete('/:id', authorize(ROLES.ADMIN), CollectionController.delete);
router.post('/:id/products', authorize(ROLES.ADMIN, ROLES.MANAGER), CollectionController.addProducts);
router.delete('/:id/products', authorize(ROLES.ADMIN, ROLES.MANAGER), CollectionController.removeProducts);

module.exports = router;

