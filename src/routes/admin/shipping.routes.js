const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware');
const { ROLES, COURIER_LIST, ORDER_STATUS } = require('../../constants');
const Order = require('../../models/admin/Order');
const ShiprocketService = require('../../services/ShiprocketService');
const { isShiprocketConfigured } = require('../../config/shiprocket');
const ApiResponse = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

router.use(authenticate);

// GET /api/admin/shipping/couriers - List couriers
router.get('/couriers', (req, res) => {
  return ApiResponse.success(res, { data: { couriers: COURIER_LIST } });
});

// POST /api/admin/shipping/:orderId/shiprocket/push - Push order to Shiprocket, assign AWB
router.post('/:orderId/shiprocket/push', authorize(ROLES.ADMIN, ROLES.ORDER_MANAGER), asyncHandler(async (req, res) => {
  if (!isShiprocketConfigured()) {
    return ApiResponse.badRequest(res, { message: 'Shiprocket is not configured. Add SHIPROCKET_EMAIL/PASSWORD/PICKUP_LOCATION to the backend .env.' });
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) return ApiResponse.notFound(res, { message: 'Order not found' });
  if (order.shiprocket?.shipmentId) {
    return ApiResponse.badRequest(res, { message: 'This order has already been pushed to Shiprocket' });
  }

  const created = await ShiprocketService.createAdhocOrder(order);
  const shipmentId = created.shipment_id;
  const shiprocketOrderId = created.order_id;

  let awbResult = null;
  try {
    awbResult = await ShiprocketService.assignAWB(shipmentId);
  } catch (error) {
    // Order is pushed even if courier auto-assignment fails — admin can
    // retry AWB assignment from the Shiprocket dashboard directly.
  }

  order.shiprocket = {
    orderId: shiprocketOrderId ? String(shiprocketOrderId) : '',
    shipmentId: shipmentId ? String(shipmentId) : '',
    awbCode: awbResult?.response?.data?.awb_code ? String(awbResult.response.data.awb_code) : '',
    courierName: awbResult?.response?.data?.courier_name || '',
    labelUrl: '',
    status: awbResult ? 'AWB Assigned' : 'Pushed',
    pushedAt: new Date(),
  };
  if (order.status === ORDER_STATUS.CONFIRMED || order.status === ORDER_STATUS.PACKED) {
    order.status = ORDER_STATUS.SHIPPED;
    order.shippedDate = new Date();
  }
  await order.save();

  return ApiResponse.success(res, { data: order, message: 'Order pushed to Shiprocket' });
}));

// GET /api/admin/shipping/:orderId/shiprocket/track - Pull latest tracking status
router.get('/:orderId/shiprocket/track', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return ApiResponse.notFound(res, { message: 'Order not found' });
  if (!order.shiprocket?.awbCode) {
    return ApiResponse.badRequest(res, { message: 'This order has no Shiprocket AWB yet' });
  }

  const tracking = await ShiprocketService.trackShipment(order.shiprocket.awbCode);
  const currentStatus = tracking?.tracking_data?.shipment_track?.[0]?.current_status;
  if (currentStatus && currentStatus !== order.shiprocket.status) {
    order.shiprocket.status = currentStatus;
    await order.save();
  }

  return ApiResponse.success(res, { data: tracking });
}));

// POST /api/admin/shipping/:orderId/assign - Assign courier
router.post('/:orderId/assign', authorize(ROLES.ADMIN, ROLES.ORDER_MANAGER), asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { courierName, trackingNumber, awbNumber } = req.body;

  if (!courierName || !trackingNumber) {
    return ApiResponse.badRequest(res, { message: 'Courier name and tracking number are required' });
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      courierName: courierName.trim(),
      trackingNumber: trackingNumber.trim(),
      awbNumber: (awbNumber || '').trim(),
      shippedDate: new Date(),
      status: 'Shipped',
    },
    { new: true, runValidators: true }
  );

  if (!order) return ApiResponse.notFound(res, { message: 'Order not found' });
  return ApiResponse.success(res, { data: order, message: `Courier ${courierName} assigned` });
}));

// POST /api/admin/shipping/:orderId/rto - Manage RTO
router.post('/:orderId/rto', authorize(ROLES.ADMIN, ROLES.ORDER_MANAGER), asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { rtoStatus, rtoReason, rtoTrackingNumber, rtoCourierName } = req.body;

  const update = {
    isRTO: true,
    rtoDate: new Date(),
    status: 'RTO',
  };
  if (rtoStatus) update.rtoStatus = rtoStatus;
  if (rtoReason !== undefined) update.rtoReason = rtoReason;
  if (rtoTrackingNumber) update.rtoTrackingNumber = rtoTrackingNumber;
  if (rtoCourierName) update.rtoCourierName = rtoCourierName;

  const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
  if (!order) return ApiResponse.notFound(res, { message: 'Order not found' });
  return ApiResponse.success(res, { data: order, message: 'RTO status updated' });
}));

// POST /api/admin/shipping/:orderId/cancel-rto - Cancel RTO
router.post('/:orderId/cancel-rto', authorize(ROLES.ADMIN), asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      isRTO: false,
      rtoStatus: 'None',
      rtoReason: '',
      rtoDate: null,
      rtoTrackingNumber: '',
      rtoCourierName: '',
      status: 'Shipped',
    },
    { new: true }
  );
  if (!order) return ApiResponse.notFound(res, { message: 'Order not found' });
  return ApiResponse.success(res, { data: order, message: 'RTO cancelled' });
}));

// GET /api/admin/shipping/:orderId/label - Generate label
router.get('/:orderId/label', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate('items.product', 'name price images');

  if (!order) return ApiResponse.notFound(res, { message: 'Order not found' });

  const itemsList = (order.items || []).map(item =>
    `<tr><td style="padding:6px 10px;border-bottom:1px solid #ddd;font-size:12px;">${item.quantity}×</td>
     <td style="padding:6px 10px;border-bottom:1px solid #ddd;font-size:12px;">${item.name}</td>
     <td style="padding:6px 10px;border-bottom:1px solid #ddd;font-size:12px;text-align:right;">₹${Number(item.price).toLocaleString('en-IN')}</td></tr>`
  ).join('');

  const labelHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Shipping Label - ${order.orderNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Courier New',monospace; background:#f5f5f5; padding:20px; }
  .label { max-width:600px; margin:0 auto; background:#fff; border:2px solid #333; padding:24px; }
  .header { text-align:center; border-bottom:2px dashed #333; padding-bottom:12px; margin-bottom:16px; }
  .header h1 { font-size:18px; text-transform:uppercase; }
  .from-to { display:flex; gap:20px; margin-bottom:16px; }
  .from, .to { flex:1; }
  .from { border-right:1px solid #ccc; padding-right:16px; }
  .section-title { font-size:10px; text-transform:uppercase; font-weight:bold; margin-bottom:6px; border-bottom:1px solid #eee; padding-bottom:2px; }
  .address { font-size:13px; line-height:1.5; }
  .address .name { font-size:15px; font-weight:bold; }
  table { width:100%; border-collapse:collapse; margin:12px 0; }
  table th { text-align:left; font-size:10px; text-transform:uppercase; border-bottom:2px solid #333; padding:4px 10px; }
  .tracking-info { border-top:2px dashed #333; padding-top:12px; margin-top:12px; }
  .tracking-info .row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; }
  .barcode { text-align:center; margin:12px 0; padding:16px; border:1px dashed #ccc; font-size:11px; letter-spacing:4px; }
  @media print { body { background:#fff; padding:0; } .label { border:none; max-width:100%; } }
</style></head>
<body>
  <div class="label">
    <div class="header"><h1>VELU'S FASHTOWN</h1><div style="font-size:11px;">Order: ${order.orderNumber}</div></div>
    <div class="from-to">
      <div class="from">
        <div class="section-title">From</div>
        <div class="address"><div class="name">VELU'S FASHTOWN</div><div>Surat, Gujarat</div><div>Phone: +91 98765 43210</div></div>
      </div>
      <div class="to">
        <div class="section-title">To</div>
        <div class="address">
          <div class="name">${order.customer?.name || 'N/A'}</div>
          <div>${order.customer?.address || ''}${order.customer?.landmark ? ', ' + order.customer.landmark : ''}</div>
          <div>${order.customer?.city || ''}, ${order.customer?.state || ''} - ${order.customer?.pincode || ''}</div>
          <div>Phone: ${order.customer?.phone || ''}</div>
        </div>
      </div>
    </div>
    <table><thead><tr><th>Qty</th><th>Item</th><th style="text-align:right;">Price</th></tr></thead><tbody>${itemsList}</tbody></table>
    <div class="tracking-info">
      <div class="row"><strong>Courier:</strong> <span>${order.courierName || 'Not assigned'}</span></div>
      <div class="row"><strong>Tracking:</strong> <span>${order.trackingNumber || '--'}</span></div>
      ${order.awbNumber ? `<div class="row"><strong>AWB:</strong> <span>${order.awbNumber}</span></div>` : ''}
      <div class="barcode">${order.trackingNumber || 'NO TRACKING'}</div>
    </div>
  </div>
  <script>window.print();</script>
</body></html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.send(labelHtml);
}));

module.exports = router;

