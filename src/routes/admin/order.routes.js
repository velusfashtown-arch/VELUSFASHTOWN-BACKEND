const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/admin/OrderController');
const { authenticate, authorize, validate } = require('../../middleware');
const { updateOrderStatusSchema } = require('../../validators/order.validator');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.get('/', OrderController.list);
router.get('/stats', OrderController.getStats);
router.get('/counts', OrderController.getCounts);
router.get('/:id', OrderController.getById);
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(updateOrderStatusSchema), OrderController.updateStatus);
router.delete('/:id', authorize(ROLES.ADMIN), OrderController.delete);

module.exports = router;

