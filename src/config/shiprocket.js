const isShiprocketConfigured = () => {
  return Boolean(
    process.env.SHIPROCKET_EMAIL &&
    process.env.SHIPROCKET_PASSWORD &&
    process.env.SHIPROCKET_PICKUP_LOCATION
  );
};

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

module.exports = { isShiprocketConfigured, SHIPROCKET_BASE_URL };
