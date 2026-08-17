const Order = require('../models/admin/Order');
const Customer = require('../models/admin/Customer');
const Product = require('../models/admin/Products/Product/Product');
const logger = require('../utils/logger');
const { generateOrderNumber } = require('../utils/helpers');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } = require('../constants');

function buildItem(product, quantity) {
  const price = product.sellingPrice;
  const gstAmount = Math.round((price * quantity * (product.gst || 0)) / 100);
  return {
    product: product._id,
    name: product.name,
    image: product.images?.[0]?.url || '',
    sku: product.sku,
    price,
    mrp: product.mrp,
    quantity,
    gst: product.gst || 0,
    discount: 0,
    total: price * quantity + gstAmount,
  };
}

// A handful of orders across every status, tied to the seeded customers and
// products, so the admin Orders screen has real data to work with.
async function seedOrders() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  if (forceReset) {
    await Order.deleteMany({});
  }

  const existingCount = await Order.countDocuments({});
  if (existingCount > 0) {
    logger.info(`Orders already seeded (${existingCount}). Skipping.`);
    return;
  }

  const customers = await Customer.find({}).lean();
  const products = await Product.find({ isDeleted: false }).lean();
  if (customers.length === 0 || products.length === 0) {
    logger.info('No customers/products found yet — skipping order seed.');
    return;
  }

  const plans = [
    { status: ORDER_STATUS.DELIVERED, paymentStatus: PAYMENT_STATUS.PAID, paymentMethod: PAYMENT_METHODS.ONLINE, daysAgo: 12 },
    { status: ORDER_STATUS.SHIPPED, paymentStatus: PAYMENT_STATUS.PAID, paymentMethod: PAYMENT_METHODS.ONLINE, daysAgo: 4 },
    { status: ORDER_STATUS.PROCESSING, paymentStatus: PAYMENT_STATUS.PENDING, paymentMethod: PAYMENT_METHODS.COD, daysAgo: 2 },
    { status: ORDER_STATUS.PLACED, paymentStatus: PAYMENT_STATUS.PENDING, paymentMethod: PAYMENT_METHODS.COD, daysAgo: 1 },
    { status: ORDER_STATUS.CANCELLED, paymentStatus: PAYMENT_STATUS.REFUNDED, paymentMethod: PAYMENT_METHODS.ONLINE, daysAgo: 6 },
  ];

  const orders = plans.map((plan, index) => {
    const customer = customers[index % customers.length];
    const product = products[index % products.length];
    const quantity = (index % 2) + 1;
    const item = buildItem(product, quantity);
    const subtotal = item.price * item.quantity;
    const gstTotal = item.total - subtotal;
    const shippingCharge = subtotal >= 999 ? 0 : 79;
    const total = subtotal + gstTotal + shippingCharge;
    const createdAt = new Date(Date.now() - plan.daysAgo * 24 * 60 * 60 * 1000);
    const address = customer.addresses?.[0];
    const paidAmount = plan.paymentStatus === PAYMENT_STATUS.PAID ? total : 0;

    return {
      orderNumber: generateOrderNumber(),
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || address?.phone || '9999999999',
        address: address?.address || 'N/A',
        city: address?.city || 'Mumbai',
        state: address?.state || 'Maharashtra',
        pincode: address?.pincode || '400001',
        country: 'India',
      },
      customerRef: customer._id,
      items: [item],
      subtotal,
      shippingCharge,
      discount: 0,
      gstTotal,
      total,
      paidAmount,
      dueAmount: total - paidAmount,
      paymentMethod: plan.paymentMethod,
      paymentStatus: plan.paymentStatus,
      status: plan.status,
      timeline: [{ status: plan.status, note: 'Seeded demo order', timestamp: createdAt }],
      createdAt,
    };
  });

  // insertMany bypasses the pre('save') hook that pushes a timeline entry —
  // fine here since each order already carries its own seeded timeline.
  await Order.insertMany(orders);

  // Placing an order through the normal flow increments the customer's
  // totalOrders/totalSpent counters — insertMany skips that too, so
  // backfill them here to match the orders we just created.
  for (const order of orders) {
    if (!order.customerRef) continue;
    await Customer.updateOne(
      { _id: order.customerRef },
      { $inc: { totalOrders: 1, totalSpent: order.total } }
    );
  }

  logger.info(`Seeded ${orders.length} orders`);
}

module.exports = { seedOrders };
