const { SHIPROCKET_BASE_URL, isShiprocketConfigured } = require('../config/shiprocket');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

let cachedToken = null;
let cachedTokenExpiry = 0;

class ShiprocketService {
  /**
   * Log in and cache the bearer token (Shiprocket tokens are valid ~10 days).
   */
  async getToken() {
    if (!isShiprocketConfigured()) {
      throw AppError.badRequest('Shiprocket is not configured. Add SHIPROCKET_EMAIL/PASSWORD/PICKUP_LOCATION to .env.');
    }

    if (cachedToken && Date.now() < cachedTokenExpiry) {
      return cachedToken;
    }

    const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.token) {
      logger.error(`Shiprocket auth failed: ${data.message || res.status}`);
      throw AppError.badRequest(`Shiprocket authentication failed: ${data.message || 'Invalid credentials'}`);
    }

    cachedToken = data.token;
    // Cache for 9 days (their tokens last 10) so we refresh a bit early.
    cachedTokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
    return cachedToken;
  }

  async request(path, options = {}) {
    const token = await this.getToken();
    const res = await fetch(`${SHIPROCKET_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // 401 likely means our cached token expired early — clear it so the
      // next call re-authenticates instead of looping on a stale token.
      if (res.status === 401) { cachedToken = null; cachedTokenExpiry = 0; }
      logger.error(`Shiprocket API error (${path}): ${JSON.stringify(data)}`);
      throw AppError.badRequest(data.message || `Shiprocket request failed (${res.status})`);
    }
    return data;
  }

  /**
   * Push an order to Shiprocket as an adhoc order and return the
   * shiprocket order/shipment IDs. Does not assign an AWB yet.
   */
  async createAdhocOrder(order) {
    const items = (order.items || []).map((item) => ({
      name: item.name,
      sku: item.sku || item.product?.toString() || 'SKU',
      units: item.quantity,
      selling_price: item.price,
    }));

    const payload = {
      order_id: order.orderNumber,
      order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19).replace('T', ' '),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
      billing_customer_name: order.customer.name,
      billing_last_name: '',
      billing_address: order.customer.address,
      billing_city: order.customer.city,
      billing_pincode: order.customer.pincode,
      billing_state: order.customer.state,
      billing_country: order.customer.country || 'India',
      billing_email: order.customer.email,
      billing_phone: order.customer.phone,
      shipping_is_billing: true,
      order_items: items,
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.subtotal,
      // Shiprocket requires package weight/dimensions; we don't track
      // per-product shipping weight yet, so ship a sane default parcel.
      length: 20,
      breadth: 15,
      height: 5,
      weight: Math.max(0.5, items.length * 0.3),
    };

    return this.request('/orders/create/adhoc', { method: 'POST', body: JSON.stringify(payload) });
  }

  /**
   * Auto-assign the best available courier's AWB to a shipment.
   */
  async assignAWB(shipmentId, courierId) {
    return this.request('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify(courierId ? { shipment_id: shipmentId, courier_id: courierId } : { shipment_id: shipmentId }),
    });
  }

  /**
   * Get the current tracking status for a shipment by AWB.
   */
  async trackShipment(awbCode) {
    return this.request(`/courier/track/awb/${awbCode}`);
  }

  /**
   * Generate a shipping label PDF for the given shipment.
   */
  async generateLabel(shipmentId) {
    return this.request('/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify({ shipment_id: [shipmentId] }),
    });
  }
}

module.exports = new ShiprocketService();
