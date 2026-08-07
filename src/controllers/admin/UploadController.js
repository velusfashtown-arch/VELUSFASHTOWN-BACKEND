const UploadService = require('../../services/UploadService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');
const path = require('path');

class UploadController {
  uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return ApiResponse.badRequest(res, { message: 'No images uploaded' });
    }

    const results = await UploadService.uploadMultiple(req.files, req.params.productId);
    return ApiResponse.success(res, { data: { images: results, count: results.length }, message: 'Images uploaded successfully' });
  });

  deleteImage = asyncHandler(async (req, res) => {
    const { filename, publicId } = req.body;

    if (!filename && !publicId) {
      return ApiResponse.badRequest(res, { message: 'filename or publicId required' });
    }

    if (publicId) {
      await UploadService.deleteImage(publicId);
    }

    if (filename) {
      UploadService.deleteLocalFile(filename);
    }

    return ApiResponse.success(res, { message: 'Image deleted' });
  });

  getUploadMiddleware = () => {
    const multerUpload = UploadService.getMulterConfig();
    return multerUpload.array('images', 20);
  };
}

module.exports = new UploadController();

