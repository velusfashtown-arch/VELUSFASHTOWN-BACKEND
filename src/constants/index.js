const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
});

const ROLE_HIERARCHY = Object.freeze({
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.EMPLOYEE]: 1,
});

const ORDER_STATUS = Object.freeze({
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RTO: 'RTO',
});

const PAYMENT_METHODS = Object.freeze({
  COD: 'COD',
  ONLINE: 'ONLINE',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'Pending',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
});

const STOCK_STATUS = Object.freeze({
  IN_STOCK: 'In Stock',
  OUT_OF_STOCK: 'Out of Stock',
  LOW_STOCK: 'Low Stock',
  DISCONTINUED: 'Discontinued',
});

const PRODUCT_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  UNPUBLISHED: 'Unpublished',
  ARCHIVED: 'Archived',
});

const RTO_STATUS = Object.freeze({
  NONE: 'None',
  REQUESTED: 'Requested',
  IN_TRANSIT: 'In Transit',
  RECEIVED: 'Received',
  COMPLETED: 'Completed',
});

const COURIER_LIST = [
  { id: 'delhivery', name: 'Delhivery' },
  { id: 'bluedart', name: 'Blue Dart' },
  { id: 'dtdc', name: 'DTDC' },
  { id: 'indiapost', name: 'India Post' },
  { id: 'xpressbees', name: 'XpressBees' },
  { id: 'ecomexpress', name: 'Ecom Express' },
  { id: 'trackon', name: 'TrackOn' },
  { id: 'others', name: 'Others' },
];

const SORT_OPTIONS = Object.freeze({
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  POPULARITY: 'popularity',
  ALPHABETICAL_ASC: 'alpha_asc',
  ALPHABETICAL_DESC: 'alpha_desc',
});

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

const TOKEN_EXPIRY = Object.freeze({
  ACCESS: '30d',
  REFRESH: '30d',
  RESET_PASSWORD: '15m',
  VERIFY_EMAIL: '24h',
});

const UPLOAD_LIMITS = Object.freeze({
  MAX_FILES: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'],
  THUMBNAIL_WIDTH: 300,
  THUMBNAIL_HEIGHT: 300,
});

const GST_RATE = Object.freeze({
  ZERO: 0,
  FIVE: 5,
  TWELVE: 12,
  EIGHTEEN: 18,
  TWENTY_EIGHT: 28,
});

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  STOCK_STATUS,
  PRODUCT_STATUS,
  RTO_STATUS,
  COURIER_LIST,
  SORT_OPTIONS,
  PAGINATION,
  TOKEN_EXPIRY,
  UPLOAD_LIMITS,
  GST_RATE,
};

