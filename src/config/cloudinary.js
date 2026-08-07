const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

const configureCloudinary = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    logger.warn('Cloudinary not configured. Image upload will fall back to local storage.');
    return false;
  }

  cloudinary.config(config);
  logger.info('Cloudinary configured successfully');
  return true;
};

const getCloudinary = () => {
  if (!cloudinary.config().cloud_name) {
    return null;
  }
  return cloudinary;
};

module.exports = { configureCloudinary, getCloudinary, cloudinary };

