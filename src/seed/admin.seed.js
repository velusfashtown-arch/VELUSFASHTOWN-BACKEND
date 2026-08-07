const bcrypt = require('bcryptjs');
const Admin = require('../models/admin/Admin');
const logger = require('../utils/logger');
const { ROLES } = require('../constants');

async function seedAdmin() {
const email = process.env.ADMIN_EMAIL || 'admin@velusfashtown.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  const existing = await Admin.findOne({ email });
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

  await Admin.create({
    name: 'Super Admin',
    email,
    password,
    role: ROLES.ADMIN,
    isActive: true,
  });

  logger.info(`Admin account created: ${email}`);
}

module.exports = { seedAdmin };

