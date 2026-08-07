const express = require('express');
const router = express.Router();
const UploadController = require('../../controllers/admin/UploadController');
const { authenticate, authorize, uploadLimiter } = require('../../middleware');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

const uploadMiddleware = UploadController.getUploadMiddleware();

router.post('/:productId', uploadLimiter, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed',
        data: null,
      });
    }
    next();
  });
}, UploadController.uploadImages);

router.delete('/', UploadController.deleteImage);

module.exports = router;

