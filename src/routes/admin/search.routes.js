const express = require('express');
const router = express.Router();
const SearchController = require('../../controllers/admin/SearchController');
const { authenticate } = require('../../middleware');

router.use(authenticate);

router.get('/', SearchController.globalSearch);
router.get('/suggestions', SearchController.suggestions);

module.exports = router;

