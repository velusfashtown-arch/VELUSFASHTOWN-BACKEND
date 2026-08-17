const Website = require('../models/tenant/Website');
const WebsiteDomain = require('../models/tenant/WebsiteDomain');
const WebsiteProduct = require('../models/tenant/WebsiteProduct');
const Product = require('../models/admin/Products/Product/Product');
const logger = require('../utils/logger');
const { APPROVAL_STATUS, PRODUCT_STATUS } = require('../constants');

/**
 * Seed the default website (VELU'S FASHTOWN) and backfill all existing
 * published products as APPROVED + PUBLISHED assignments so the existing
 * catalog is immediately visible on the default storefront.
 */
async function seedWebsites() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  let website = await Website.findOne({ isDefault: true });
  if (!website) {
    // Try by slug
    website = await Website.findOne({ slug: 'velus-fashtown' });
  }

  if (!website) {
    website = await Website.create({
      name: "VELU'S FASHTOWN",
      slug: 'velus-fashtown',
      brandName: "VELU'S FASHTOWN",
      description: 'Premium sarees and ethnic wear',
      domain: process.env.WEBSITE_DOMAIN || 'velusfashtown.com',
      defaultCurrency: 'INR',
      defaultLanguage: 'en',
      status: 'active',
      isDefault: true,
      contact: {
        contactEmail: process.env.CONTACT_EMAIL || 'support@velusfashtown.com',
        contactPhone: process.env.CONTACT_PHONE || '+91 90000 00000',
        whatsapp: process.env.CONTACT_WHATSAPP || '+91 90000 00000',
        address: 'Velus Fashtown, India',
      },
      socialLinks: {
        instagram: 'https://instagram.com/velusfashtown',
        facebook: 'https://facebook.com/velusfashtown',
      },
      theme: {
        primaryColor: '#a74e3e',
        secondaryColor: '#241b18',
        accentColor: '#f3c997',
        backgroundColor: '#fff9f1',
        textColor: '#241b18',
        borderColor: '#e8ddd2',
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
        buttonStyle: 'rounded-full',
        borderRadius: '16px',
        containerWidth: '1280px',
      },
    });
    logger.info(`Default website created: ${website.name}`);
  } else if (forceReset) {
    // Ensure it's the default even on reset
    await Website.updateMany({}, { isDefault: false });
    await Website.updateOne({ _id: website._id }, { isDefault: true });
  }

  // Register primary domain
  if (website.domain) {
    const existingDomain = await WebsiteDomain.findOne({ domain: website.domain.toLowerCase() });
    if (!existingDomain) {
      await WebsiteDomain.create({
        website: website._id,
        domain: website.domain.toLowerCase(),
        isPrimary: true,
        verified: true,
      });
    }
  }

  // Backfill existing published products as approved + published assignments
  if (forceReset) {
    await WebsiteProduct.deleteMany({ website: website._id });
  }

  const existingAssignments = await WebsiteProduct.countDocuments({ website: website._id });
  if (existingAssignments === 0) {
    const products = await Product.find({
      isDeleted: false,
      status: PRODUCT_STATUS.PUBLISHED,
    }).select('_id');

    if (products.length > 0) {
      const docs = products.map((p) => ({
        website: website._id,
        product: p._id,
        approvalStatus: APPROVAL_STATUS.APPROVED,
        status: APPROVAL_STATUS.PUBLISHED,
        published: true,
        isActive: true,
      }));
      await WebsiteProduct.insertMany(docs);
      logger.info(`Backfilled ${products.length} products as APPROVED + PUBLISHED on ${website.name}`);
    }
  }

  return website;
}

module.exports = { seedWebsites };
