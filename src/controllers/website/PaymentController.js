const crypto = require('crypto');
const { getRazorpay, isRazorpayConfigured } = require('../../config/razorpay');
const OrderRepository = require('../../repositories/OrderRepository');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../../constants');

class PaymentController {
  /**
   * POST /api/website/payments/create-order
   * Creates a Razorpay order for the given order ID.
   * Body: { orderId: string }
   */
  createRazorpayOrder = asyncHandler(async (req, res) => {
    if (!isRazorpayConfigured()) {
      throw AppError.badRequest('Online payments are not configured. Please use Cash on Delivery.');
    }

    const { orderId } = req.body;
    if (!orderId) {
      throw AppError.badRequest('Order ID is required');
    }

    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found');
    }

    if (order.paymentMethod !== 'ONLINE') {
      throw AppError.badRequest('This order is not marked for online payment');
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw AppError.badRequest('This order is already paid');
    }

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    // Store razorpay_order_id in the order
    await OrderRepository.updateById(order._id, {
      'paymentDetails.transactionId': razorpayOrder.id,
      'paymentDetails.paymentGateway': 'razorpay',
    });

    logger.info(`Razorpay order created: ${razorpayOrder.id} for order ${order.orderNumber}`);

    return ApiResponse.success(res, {
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderNumber: order.orderNumber,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
        },
      },
      message: 'Razorpay order created',
    });
  });

  /**
   * POST /api/website/payments/verify
   * Verifies Razorpay payment signature after successful payment on client side.
   * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
   */
  verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw AppError.badRequest('Missing payment verification parameters');
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.error(`Payment signature mismatch for order ${orderId}`);
      throw AppError.badRequest('Payment verification failed. Invalid signature.');
    }

    // Update order as paid
    const updateData = {
      paymentStatus: PAYMENT_STATUS.PAID,
      paidAmount: 0, // Will be set from order total
      'paymentDetails.transactionId': razorpay_payment_id,
      'paymentDetails.paymentDate': new Date(),
      'paymentDetails.paymentGateway': 'razorpay',
      'paymentDetails.paymentResponse': {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
    };

    // Get the order to calculate paid amount
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found');
    }

    updateData.paidAmount = order.total;
    updateData.dueAmount = 0;

    // Add timeline entry
    const timeline = order.timeline || [];
    timeline.push({
      status: ORDER_STATUS.CONFIRMED,
      note: `Payment received via Razorpay. Payment ID: ${razorpay_payment_id}`,
      updatedBy: 'system',
      timestamp: new Date(),
    });
    updateData.timeline = timeline;

    // If order is still 'Placed', move to 'Confirmed'
    if (order.status === ORDER_STATUS.PLACED) {
      updateData.status = ORDER_STATUS.CONFIRMED;
    }

    const updatedOrder = await OrderRepository.updateById(orderId, updateData);

    logger.info(`Payment verified for order ${order.orderNumber}. Razorpay payment: ${razorpay_payment_id}`);

    return ApiResponse.success(res, {
      data: updatedOrder,
      message: 'Payment verified successfully',
    });
  });

  /**
   * POST /api/website/payments/webhook
   * Server-to-server backstop for the client-driven verify/failed flow
   * above — covers cases where the browser tab closes before the client
   * can call back (payment still succeeds/fails on Razorpay's side).
   * Configure this URL + a webhook secret in the Razorpay dashboard.
   */
  webhook = asyncHandler(async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!secret) {
      logger.warn('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured');
      return res.status(200).json({ received: true, verified: false });
    }
    if (!signature || !req.rawBody) {
      return res.status(400).json({ received: false, message: 'Missing signature or raw body' });
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
    if (expectedSignature !== signature) {
      logger.error('Razorpay webhook signature mismatch');
      return res.status(400).json({ received: false, message: 'Invalid signature' });
    }

    const event = req.body?.event;
    const payload = req.body?.payload || {};
    logger.info(`Razorpay webhook received: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        const order = await OrderRepository.findOne({ 'paymentDetails.transactionId': razorpayOrderId });
        if (order && order.paymentStatus !== PAYMENT_STATUS.PAID) {
          const timeline = order.timeline || [];
          timeline.push({
            status: ORDER_STATUS.CONFIRMED,
            note: `Payment captured via Razorpay webhook. Payment ID: ${paymentEntity.id}`,
            updatedBy: 'system',
            timestamp: new Date(),
          });
          await OrderRepository.updateById(order.id, {
            paymentStatus: PAYMENT_STATUS.PAID,
            paidAmount: order.total,
            dueAmount: 0,
            'paymentDetails.transactionId': paymentEntity.id,
            'paymentDetails.paymentDate': new Date(),
            'paymentDetails.paymentGateway': 'razorpay',
            status: order.status === ORDER_STATUS.PLACED ? ORDER_STATUS.CONFIRMED : order.status,
            timeline,
          });
          logger.info(`Order ${order.orderNumber} marked paid via webhook`);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        const order = await OrderRepository.findOne({ 'paymentDetails.transactionId': razorpayOrderId });
        if (order && order.paymentStatus !== PAYMENT_STATUS.PAID) {
          await OrderRepository.updateById(order.id, {
            paymentStatus: PAYMENT_STATUS.FAILED,
            'paymentDetails.paymentResponse': {
              error: paymentEntity?.error_description || 'Payment failed (webhook)',
              failedAt: new Date().toISOString(),
            },
          });
        }
      }
    }

    return res.status(200).json({ received: true, verified: true });
  });

  /**
   * POST /api/website/payments/failed
   * Called when Razorpay payment fails on client side.
   * Body: { orderId, error }
   */
  paymentFailed = asyncHandler(async (req, res) => {
    const { orderId, error } = req.body;

    if (!orderId) {
      throw AppError.badRequest('Order ID is required');
    }

    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found');
    }

    // Update payment status to failed
    await OrderRepository.updateById(orderId, {
      paymentStatus: PAYMENT_STATUS.FAILED,
      'paymentDetails.paymentResponse': {
        error: error || 'Payment failed on client side',
        failedAt: new Date().toISOString(),
      },
    });

    logger.warn(`Payment failed for order ${order.orderNumber}: ${error || 'Unknown error'}`);

    return ApiResponse.success(res, {
      message: 'Payment failure recorded',
    });
  });
}

module.exports = new PaymentController();
