const Razorpay = require('razorpay');
const logger = require('../utils/logger');

let razorpayInstance = null;

const configureRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_xxxxxxxxxxxx') {
    logger.warn('Razorpay not configured. Online payments will be disabled.');
    return false;
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  logger.info('Razorpay configured successfully');
  return true;
};

const getRazorpay = () => {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }
  return razorpayInstance;
};

const isRazorpayConfigured = () => {
  return razorpayInstance !== null;
};

module.exports = { configureRazorpay, getRazorpay, isRazorpayConfigured };
