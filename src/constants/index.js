const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CATALOG_MANAGER: 'catalog_manager',
  ORDER_MANAGER: 'order_manager',
  CONTENT_MANAGER: 'content_manager',
  MARKETING_MANAGER: 'marketing_manager',
  SUPPORT_MANAGER: 'support_manager',
});

const ROLE_HIERARCHY = Object.freeze({
  [ROLES.SUPER_ADMIN]: 7,
  [ROLES.ADMIN]: 6,
  [ROLES.MARKETING_MANAGER]: 5,
  [ROLES.CONTENT_MANAGER]: 4,
  [ROLES.CATALOG_MANAGER]: 3,
  [ROLES.ORDER_MANAGER]: 2,
  [ROLES.SUPPORT_MANAGER]: 1,
});

// Module-action permission keys
const PERMISSIONS = Object.freeze({
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_APPROVE: 'product:approve',
  PRODUCT_PUBLISH: 'product:publish',
  CATEGORY_VIEW: 'category:view',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',
  COLLECTION_VIEW: 'collection:view',
  COLLECTION_CREATE: 'collection:create',
  COLLECTION_UPDATE: 'collection:update',
  COLLECTION_DELETE: 'collection:delete',
  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_UPDATE: 'customer:update',
  WEBSITE_VIEW: 'website:view',
  WEBSITE_CREATE: 'website:create',
  WEBSITE_UPDATE: 'website:update',
  WEBSITE_DELETE: 'website:delete',
  COUPON_VIEW: 'coupon:view',
  COUPON_CREATE: 'coupon:create',
  COUPON_UPDATE: 'coupon:update',
  COUPON_DELETE: 'coupon:delete',
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  ADMIN_USER_VIEW: 'admin_user:view',
  ADMIN_USER_CREATE: 'admin_user:create',
  ADMIN_USER_UPDATE: 'admin_user:update',
  ANALYTICS_VIEW: 'analytics:view',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
});

const ORDER_STATUS = Object.freeze({
  PENDING: 'Pending',
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
  RTO: 'RTO',
});

const APPROVAL_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
});

const WEBSITE_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

const REVIEW_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const COUPON_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
});

const COUPON_TYPES = Object.freeze({
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
});

const OFFER_TYPES = Object.freeze({
  PERCENT: 'percent',
  FLAT: 'flat',
  BUY_X_GET_Y: 'buy_x_get_y',
  FREE_SHIPPING: 'free_shipping',
});

const NAVIGATION_TYPES = Object.freeze({
  CATEGORY: 'CATEGORY',
  COLLECTION: 'COLLECTION',
  PRODUCT: 'PRODUCT',
  PAGE: 'PAGE',
  CUSTOM_URL: 'CUSTOM_URL',
});

const HOMEPAGE_SECTION_TYPES = Object.freeze({
  ANNOUNCEMENT_BAR: 'AnnouncementBar',
  HERO: 'Hero',
  BANNER: 'Banner',
  CATEGORY_GRID: 'CategoryGrid',
  COLLECTION_GRID: 'CollectionGrid',
  PRODUCT_CAROUSEL: 'ProductCarousel',
  PRODUCT_GRID: 'ProductGrid',
  IMAGE_TEXT: 'ImageText',
  VIDEO: 'Video',
  LOOKBOOK: 'Lookbook',
  TESTIMONIALS: 'Testimonials',
  NEWSLETTER: 'Newsletter',
  INSTAGRAM: 'Instagram',
});

const INVENTORY_TX_TYPES = Object.freeze({
  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  ORDER: 'ORDER',
  RETURN: 'RETURN',
  ADJUSTMENT: 'ADJUSTMENT',
  CANCELLED_ORDER: 'CANCELLED_ORDER',
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

// Input types a custom product field can render as.
const CUSTOM_FIELD_TYPES = Object.freeze({
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  DROPDOWN: 'dropdown',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  RICHTEXT: 'richtext',
  IMAGE: 'image',
});

const FORM_SUBMISSION_STATUS = Object.freeze({
  NEW: 'new',
  READ: 'read',
  ARCHIVED: 'archived',
});

// What a customer-facing form is for — purely a label/category so admins
// can tell forms apart and filter them; it doesn't change how the form
// behaves or renders.
const FORM_TYPES = Object.freeze({
  CONTACT_US: 'contact_us',
  PRODUCT_INQUIRY: 'product_inquiry',
  CATEGORY_REQUEST: 'category_request',
  GENERAL: 'general',
});

const FORM_TYPE_LABELS = Object.freeze({
  [FORM_TYPES.CONTACT_US]: 'Contact Us',
  [FORM_TYPES.PRODUCT_INQUIRY]: 'Product Inquiry',
  [FORM_TYPES.CATEGORY_REQUEST]: 'Category Request',
  [FORM_TYPES.GENERAL]: 'General / Custom',
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
  PERMISSIONS,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  STOCK_STATUS,
  PRODUCT_STATUS,
  APPROVAL_STATUS,
  WEBSITE_STATUS,
  REVIEW_STATUS,
  COUPON_STATUS,
  COUPON_TYPES,
  OFFER_TYPES,
  NAVIGATION_TYPES,
  HOMEPAGE_SECTION_TYPES,
  INVENTORY_TX_TYPES,
  RTO_STATUS,
  CUSTOM_FIELD_TYPES,
  FORM_SUBMISSION_STATUS,
  FORM_TYPES,
  FORM_TYPE_LABELS,
  COURIER_LIST,
  SORT_OPTIONS,
  PAGINATION,
  TOKEN_EXPIRY,
  UPLOAD_LIMITS,
  GST_RATE,
};

