const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transport = null;

const createTransport = () => {
  const host = process.env.MAIL_HOST;
  const port = parseInt(process.env.MAIL_PORT || '587', 10);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    logger.warn(
      'MAIL_HOST, MAIL_USER and MAIL_PASS not fully configured. Emails will be logged to console.'
    );
    return null;
  }

  transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  logger.info('Mail transport configured successfully');
  return transport;
};

const getTransport = () => transport;

const FROM = () => process.env.MAIL_FROM || '"VELU\'S FASHTOWN" <noreply@velusfashtown.com>';
const FRONTEND_URL = () => (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

module.exports = { createTransport, getTransport, FROM, FRONTEND_URL };

