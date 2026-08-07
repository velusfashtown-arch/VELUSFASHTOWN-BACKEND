const slugify = require('slugify');

/**
 * Generate a URL-friendly slug from a string.
 */
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

/**
 * Generate a unique SKU based on category prefix and random string.
 */
const generateSKU = (prefix = 'AYT') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate a barcode (EAN-13 compatible numeric string).
 */
const generateBarcode = () => {
  const prefix = '890'; // India prefix
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const barcode = prefix + random;
  // Simple checksum
  const checksum = barcode.split('').reduce((sum, digit, idx) => {
    return sum + parseInt(digit) * (idx % 2 === 0 ? 1 : 3);
  }, 0);
  const checkDigit = (10 - (checksum % 10)) % 10;
  return barcode + checkDigit;
};

/**
 * Generate a unique order number.
 */
const generateOrderNumber = () => {
  const prefix = 'AYT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Calculate profit margin percentage.
 */
const calculateProfitMargin = (costPrice, sellingPrice) => {
  if (costPrice <= 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
};

/**
 * Calculate GST amount.
 */
const calculateGST = (price, gstRate) => {
  return (price * gstRate) / 100;
};

/**
 * Calculate discount percentage.
 */
const calculateDiscountPercent = (mrp, sellingPrice) => {
  if (mrp <= 0) return 0;
  return ((mrp - sellingPrice) / mrp) * 100;
};

/**
 * Sanitize a string for search (remove special chars, lowercase).
 */
const sanitizeSearchTerm = (term) => {
  return term.replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase();
};

/**
 * Build regex for partial matching (used in search).
 */
const buildSearchRegex = (term) => {
  const sanitized = sanitizeSearchTerm(term);
  if (!sanitized) return null;
  return new RegExp(sanitized.split(/\s+/).join('|'), 'i');
};

/**
 * Pagination helper - returns skip and limit for Mongoose queries.
 */
const getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build sort object from query param.
 */
const buildSort = (sortBy, allowedFields = ['createdAt', 'price', 'name']) => {
  if (!sortBy) return { createdAt: -1 };

  const [field, order] = sortBy.startsWith('-')
    ? [sortBy.slice(1), -1]
    : [sortBy, 1];

  if (!allowedFields.includes(field)) {
    return { createdAt: -1 };
  }

  return { [field]: order };
};

module.exports = {
  generateSlug,
  generateSKU,
  generateBarcode,
  generateOrderNumber,
  calculateProfitMargin,
  calculateGST,
  calculateDiscountPercent,
  sanitizeSearchTerm,
  buildSearchRegex,
  getPagination,
  buildSort,
};

