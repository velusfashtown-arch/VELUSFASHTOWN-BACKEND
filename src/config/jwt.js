const jwt = require('jsonwebtoken');
const { TOKEN_EXPIRY } = require('../constants');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '-refresh';
  return secret;
};

const generateAccessToken = (payload) => {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_EXPIRY.ACCESS });
};

const generateToken = (payload) => {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: TOKEN_EXPIRY.REFRESH });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getSecret());
};

const verifyToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

const generateResetToken = (payload) => {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_EXPIRY.RESET_PASSWORD });
};

module.exports = {
  getSecret,
  getRefreshSecret,
  generateAccessToken,
  generateToken,
  verifyAccessToken,
  verifyToken,
  generateResetToken,
};

