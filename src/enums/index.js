// Re-export from constants for clarity
const {
  ROLES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  STOCK_STATUS,
  PRODUCT_STATUS,
  RTO_STATUS,
  SORT_OPTIONS,
  GST_RATE,
} = require('../constants');

module.exports = {
  Roles: ROLES,
  OrderStatus: ORDER_STATUS,
  PaymentMethods: PAYMENT_METHODS,
  PaymentStatus: PAYMENT_STATUS,
  StockStatus: STOCK_STATUS,
  ProductStatus: PRODUCT_STATUS,
  RTOStatus: RTO_STATUS,
  SortOptions: SORT_OPTIONS,
  GSTRate: GST_RATE,
};

