const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { cloudinary, getCloudinary } = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { UPLOAD_LIMITS } = require('../constants');
const { appConfig } = require('../config/app');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

class UploadService {
  constructor() {
    this.useCloudinary = !!getCloudinary();
    this.uploadDir = uploadDir;
  }

  /**
   * Get Multer middleware configuration.
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const productId = req.params.productId;
        const dir = productId
          ? path.join(this.uploadDir, 'products', productId)
          : this.uploadDir;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
      },
    });

    const fileFilter = (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const mimeType = file.mimetype;

      if (
        UPLOAD_LIMITS.ALLOWED_MIME_TYPES.includes(mimeType) ||
        ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(ext)
      ) {
        cb(null, true);
      } else {
        cb(new AppError('Only image files (JPEG, PNG, GIF, WebP, BMP, SVG) are allowed', 400), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE,
        files: UPLOAD_LIMITS.MAX_FILES,
      },
    });
  }

  /**
   * Process image: compress and generate thumbnail using Sharp.
   */
  async processImage(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      if (['.svg'].includes(ext)) return; // Don't process SVGs

      const compressedPath = filePath.replace(/(\.\w+)$/, '_compressed$1');
      const thumbnailPath = filePath.replace(/(\.\w+)$/, '_thumb$1');

      // Compress image
      await sharp(filePath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(compressedPath);

      // Generate thumbnail
      await sharp(filePath)
        .resize(UPLOAD_LIMITS.THUMBNAIL_WIDTH, UPLOAD_LIMITS.THUMBNAIL_HEIGHT, {
          fit: 'cover',
          position: 'centre',
        })
        .jpeg({ quality: 60 })
        .toFile(thumbnailPath);

      // Replace original with compressed
      fs.unlinkSync(filePath);
      fs.renameSync(compressedPath, filePath);

      logger.debug(`Image processed: ${path.basename(filePath)}`);
    } catch (error) {
      logger.error(`Image processing failed: ${error.message}`);
    }
  }

  /**
   * Build an absolute URL for a locally-stored file (used when Cloudinary
   * isn't configured), e.g. http://localhost:5000/uploads/products/PRD00001/xxx.jpg
   */
  buildLocalUrl(filePath) {
    const relative = path.relative(this.uploadDir, filePath).split(path.sep).join('/');
    return `${appConfig.backendUrl}/uploads/${relative}`;
  }

  /**
   * Upload file to Cloudinary.
   */
  async uploadToCloudinary(filePath, folder = 'aytin') {
    if (!this.useCloudinary) {
      return { url: this.buildLocalUrl(filePath), publicId: '' };
    }

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, height: 1200, crop: 'limit' },
        ],
      });

      // Delete local file after upload
      fs.unlinkSync(filePath);

      // Also delete thumbnail
      const thumbPath = filePath.replace(/(\.\w+)$/, '_thumb$1');
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }

      logger.debug(`Uploaded to Cloudinary: ${result.public_id}`);
      return { url: result.secure_url, publicId: result.public_id, thumbnail: result.secure_url.replace('/upload/', '/upload/w_300/') };
    } catch (error) {
      logger.error(`Cloudinary upload failed: ${error.message}`);
      return { url: this.buildLocalUrl(filePath), publicId: '' };
    }
  }

  /**
   * Upload multiple files. `productId`, when given, organizes the
   * Cloudinary folder the same way the local disk folder is organized.
   */
  async uploadMultiple(files, productId) {
    const folder = productId ? `aytin/products/${productId}` : 'aytin';
    const results = [];

    for (const file of files) {
      // Process with Sharp (compress + thumbnail)
      await this.processImage(file.path);

      // Upload to Cloudinary (or local)
      const result = await this.uploadToCloudinary(file.path, folder);
      results.push(result);
    }

    return results;
  }

  /**
   * Delete image from Cloudinary.
   */
  async deleteImage(publicId) {
    if (!publicId) return;

    try {
      if (this.useCloudinary) {
        await cloudinary.uploader.destroy(publicId);
        logger.debug(`Deleted from Cloudinary: ${publicId}`);
      }
    } catch (error) {
      logger.error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Delete local file.
   */
  deleteLocalFile(filename) {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}

module.exports = new UploadService();

