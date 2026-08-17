const OrderRepository = require('../repositories/OrderRepository');
const ProductRepository = require('../repositories/admin/products/Product/ProductRepository');
const CustomerRepository = require('../repositories/CustomerRepository');
const { generateOrderNumber } = require('../utils/helpers');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants');

class OrderService {
  /**
   * List orders with filters, pagination.
   */
  async listOrders(queryParams) {
    const { page = 1, limit = 20, status, paymentStatus, search, from, to, customerRef } = queryParams;
    const filter = {};

    if (customerRef) filter.customerRef = customerRef;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    return OrderRepository.findAll(filter, {
      sort: { createdAt: -1 },
      page: Number(page),
      limit: Number(limit),
      populate: 'items.product customerRef',
    });
  }

  /**
   * Get a single order by ID.
   */
  async getOrder(id) {
    return OrderRepository.findById(id, {
      populate: 'items.product customerRef',
    });
  }

  /**
   * Place a new order (from website).
   */
  async placeOrder(orderData) {
    const { customer, items, paymentMethod, couponCode, customerRef } = orderData;

    // Validate and fetch products — items reference the customer-facing
    // productId (e.g. "PRD00001"), not the internal Mongo _id.
    const productIds = items.map((item) => item.productId);
    const products = await ProductRepository.findByPublicIds(productIds, '');
    const findProduct = (item) => products.find(
      (p) => p.productId === item.productId || p._id.toString() === item.productId
    );

    if (products.length !== productIds.length) {
      throw AppError.badRequest('One or more products not found');
    }

    // Build order items and validate stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = findProduct(item);

      if (!product) {
        throw AppError.badRequest(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw AppError.badRequest(`${product.name} is out of stock`);
      }

      const sellingPrice = product.sellingPrice || product.mrp || 0;
      const total = sellingPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.mainImage || (product.images?.[0]?.url) || '',
        sku: product.sku || '',
        price: sellingPrice,
        mrp: product.mrp || 0,
        quantity: item.quantity,
        gst: product.gst || 0,
        discount: product.discount || 0,
        total,
      });

      subtotal += total;
    }

    // Calculate shipping (free above ₹999)
    const shippingCharge = subtotal >= 999 ? 0 : 99;

    // Calculate discount
    let discount = 0;
    if (couponCode) {
      // TODO: Implement coupon validation
      discount = 0;
    }

    const total = subtotal + shippingCharge - discount;

    // Create order
    const order = await OrderRepository.create({
      orderNumber: generateOrderNumber(),
      customer,
      customerRef: customerRef || null,
      items: orderItems,
      subtotal,
      shippingCharge,
      discount,
      total,
      paidAmount: 0,
      dueAmount: total,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: PAYMENT_STATUS.PENDING,
      status: ORDER_STATUS.PLACED,
      timeline: [{ status: ORDER_STATUS.PLACED, timestamp: new Date() }],
    });

    // Decrease stock
    await Promise.all(
      items.map((item) => {
        const product = findProduct(item);
        return ProductRepository.updateById(product._id, {
          stock: Math.max(0, product.stock - item.quantity),
          totalSold: (product.totalSold || 0) + item.quantity,
        });
      })
    );

    // Update customer total orders/spent if customerRef exists
    if (customerRef) {
      await CustomerRepository.updateById(customerRef, {
        $inc: { totalOrders: 1, totalSpent: total },
      });
    }

    logger.info(`Order placed: ${order.orderNumber}`);
    return order;
  }

  /**
   * Update order status.
   */
  async updateOrderStatus(id, status, notes, updatedBy = 'admin') {
    const order = await OrderRepository.findById(id);

    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw AppError.badRequest(`Invalid order status: ${status}`);
    }

    // Update status-dependent fields
    const updateData = { status };
    if (notes) updateData.notes = notes;

    if (status === ORDER_STATUS.SHIPPED) {
      updateData.shippedDate = new Date();
    }
    if (status === ORDER_STATUS.DELIVERED) {
      updateData.deliveredDate = new Date();
    }
    if (status === ORDER_STATUS.CANCELLED) {
      updateData.isRTO = false;
    }

    // Add timeline entry
    order.timeline.push({ status, updatedBy, timestamp: new Date() });

    const updated = await OrderRepository.updateById(id, {
      ...updateData,
      timeline: order.timeline,
    });

    logger.info(`Order ${order.orderNumber} status updated to ${status}`);
    return updated;
  }

  /**
   * Delete an order.
   */
  async deleteOrder(id) {
    await OrderRepository.deleteById(id);
    logger.info(`Order deleted: ${id}`);
  }

  /**
   * Get order statistics for dashboard.
   */
  async getOrderStats(period = 'all') {
    return OrderRepository.getOrderStats(period);
  }

  /**
   * Get revenue by date for charts.
   */
  async getRevenueByDate(days = 30) {
    return OrderRepository.getRevenueByDate(days);
  }

  /**
   * Get top selling products.
   */
  async getTopSellingProducts(limit = 10) {
    return OrderRepository.getTopSellingProducts(limit);
  }

  /**
   * Get order counts by status.
   */
  async getOrderCounts() {
    const allStatuses = Object.values(ORDER_STATUS);
    const counts = await Promise.all(
      allStatuses.map(async (status) => {
        const count = await OrderRepository.count({ status });
        return { status, count };
      })
    );

    const total = counts.reduce((sum, c) => sum + c.count, 0);

    return {
      total,
      byStatus: counts,
    };
  }
}

module.exports = new OrderService();

