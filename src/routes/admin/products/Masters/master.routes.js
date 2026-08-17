const express = require('express');
const router = express.Router();
const MasterController = require('../../../../controllers/admin/products/Masters/MasterController');
const { authenticate, authorize, validate } = require('../../../../middleware');
const { createMasterSchema, updateMasterSchema } = require('../../../../validators/admin/products/Masters/master.validator');
const { ROLES } = require('../../../../constants');

router.use(authenticate);

router.get('/', MasterController.list);
router.get('/:id', MasterController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(createMasterSchema), MasterController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), validate(updateMasterSchema), MasterController.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.CATALOG_MANAGER), MasterController.delete);

module.exports = router;