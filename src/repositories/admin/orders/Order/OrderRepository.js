const BaseRepository = require('../../../BaseRepository');
const Order = require('../../../../models/admin/Orders/Order/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Find orders with customer and item details populated.
   */
  async findAllWithDetails(filter = {}, options = {}) {
    return this.findAll(filter, {
      ...options,
      populate: 'items.product customerRef',
      select: '-__v',
    });
  }

  /**
   * Find orders by customer email.
   */
  async findByCustomerEmail(email) {
    return this.model.findByCustomerEmail(email);
  }

  /**
   * Find orders by status.
   */
  async findByStatus(status) {
    return this.model.findByStatus(status);
  }

  /**
   * Get order statistics.
   */
  async getOrderStats(period = 'all') {
    const match = {};
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      match.createdAt = { $gte: today };
    } else if (period === 'week') {
      const week = new Date();
      week.setDate(week.getDate() - 7);
      match.createdAt = { $gte: week };
    } else if (period === 'month') {
      const month = new Date();
      month.setMonth(month.getMonth() - 1);
      match.createdAt = { $gte: month };
    }

    return this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          totalPaid: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$total', 0] },
          },
          codOrders: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'COD'] }, 1, 0] },
          },
          onlineOrders: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, 1, 0] },
          },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);
  }

  /**
   * Get revenue grouped by date for charts.
   */
  async getRevenueByDate(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'Paid',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get top selling products.
   */
  async getTopSellingProducts(limit = 10) {
    return this.model.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);
  }
}

module.exports = new OrderRepository();
