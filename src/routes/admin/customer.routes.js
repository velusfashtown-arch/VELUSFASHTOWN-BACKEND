const express = require('express');
const router = express.Router();
const CustomerController = require('../../controllers/admin/CustomerController');
const { authenticate, authorize } = require('../../middleware');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.get('/', CustomerController.list);
router.get('/stats', CustomerController.getStats);
router.get('/:id', CustomerController.getById);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), CustomerController.update);
router.delete('/:id', authorize(ROLES.ADMIN), CustomerController.delete);

module.exports = router;

