const express = require('express');
const router = express.Router();
const DashboardController = require('../../controllers/admin/DashboardController');
const { authenticate } = require('../../middleware');

router.use(authenticate);

router.get('/', DashboardController.getDashboard);

module.exports = router;

