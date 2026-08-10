const bcrypt = require('bcryptjs');
const Auth = require('../../../models/admin/auth/auth');
const logger = require('../../../utils/logger');
const { ROLES } = require('../../../constants');

async function seedAuth() {
  const email = process.env.ADMIN_EMAIL || 'admin@velusfashtown.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  const existing = await Auth.findOne({ email });
  if (existing && !forceReset) {
    logger.info(`Admin account already exists: ${email}`);
    return;
  }

  if (existing && forceReset) {
    existing.password = password;
    existing.name = 'Super Admin';
    existing.role = ROLES.ADMIN;
    await existing.save();
    logger.info(`Admin password reset for: ${email}`);
    return;
  }

  await Auth.create({
    name: 'Super Admin',
    email,
    password,
    role: ROLES.ADMIN
  });

  logger.info(`Admin account created: ${email}`);
}

module.exports = { seedAuth };

