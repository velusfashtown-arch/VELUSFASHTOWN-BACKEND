const ProductRepository = require('../repositories/ProductRepository');
const OrderRepository = require('../repositories/OrderRepository');
const CustomerRepository = require('../repositories/CustomerRepository');

class DashboardService {
  /**
   * Get complete dashboard data.
   */
  async getDashboardData() {
    const [
      productCounts,
      orderCounts,
      orderStats,
      revenueByDate,
      topSellingProducts,
      customerStats,
    ] = await Promise.all([
      this._getProductCounts(),
      this._getOrderCounts(),
      OrderRepository.getOrderStats('month'),
      OrderRepository.getRevenueByDate(30),
      OrderRepository.getTopSellingProducts(10),
      CustomerRepository.getStats(),
    ]);

    return {
      products: productCounts,
      orders: orderCounts,
      revenue: {
        total: orderStats[0]?.totalRevenue || 0,
        totalPaid: orderStats[0]?.totalPaid || 0,
        thisMonth: orderStats[0]?.totalRevenue || 0,
        avgOrderValue: orderStats[0]?.avgOrderValue || 0,
      },
      revenueTrend: revenueByDate,
      topSellingProducts,
      customers: customerStats[0] || { totalCustomers: 0, verifiedCustomers: 0, activeCustomers: 0 },
      lowStockProducts: await ProductRepository.findLowStockProducts(5),
    };
  }

  /**
   * Get product counts.
   */
  async _getProductCounts() {
    const [total, active, deleted, outOfStock] = await Promise.all([
      ProductRepository.count({ isDeleted: false }),
      ProductRepository.count({ isDeleted: false, isActive: true }),
      ProductRepository.count({ isDeleted: true }),
      ProductRepository.count({ isDeleted: false, isActive: true, stock: 0 }),
    ]);

    return { total, active, deleted, outOfStock };
  }

  /**
   * Get order counts.
   */
  async _getOrderCounts() {
    const [total, pending, shipped, delivered, cancelled, rto] = await Promise.all([
      OrderRepository.count({}),
      OrderRepository.count({ status: 'Placed' }),
      OrderRepository.count({ status: 'Shipped' }),
      OrderRepository.count({ status: 'Delivered' }),
      OrderRepository.count({ status: 'Cancelled' }),
      OrderRepository.count({ isRTO: true }),
    ]);

    return { total, pending, shipped, delivered, cancelled, rto };
  }
}

module.exports = new DashboardService();

