const Product = require('../models/admin/Product');
const Category = require('../models/admin/Category');
const logger = require('../utils/logger');
const { STOCK_STATUS, PRODUCT_STATUS } = require('../constants');

async function seedProducts() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';
  const existingCount = await Product.countDocuments({});
  if (existingCount > 0 && !forceReset) {
    logger.info(`Products already seeded (${existingCount}). Skipping.`);
    return;
  }

  if (forceReset) {
    await Product.deleteMany({});
    logger.info('Existing products deleted for reseed.');
  }

  // Create a default category if none exists
  let category = await Category.findOne({ name: 'Sarees' });
  if (!category) {
    category = await Category.create({
      name: 'Sarees',
      description: 'Traditional and modern sarees',
      isActive: true,
    });
  }

  const products = [
    {
      name: "Aytin Banarasi Silk Saree - Zari Border",
      sku: "AYT-SAR-BAN-001",
      description: "Premium Banarasi silk saree with intricate zari border work. Perfect for weddings and festive occasions.",
      shortDescription: "Banarasi silk with zari border",
      mrp: 2999,
      sellingPrice: 2499,
      costPrice: 1500,
      discount: 17,
      gst: 5,
      category: category._id,
      stock: 20,
      lowStockAlert: 5,
      stockStatus: STOCK_STATUS.IN_STOCK,
      sareeFabric: 'Banarasi Silk',
      workType: 'Zari Border',
      primaryColor: 'Maroon',
      occasion: ['Wedding', 'Festival'],
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      status: PRODUCT_STATUS.PUBLISHED,
      isActive: true,
      tags: ['banarasi', 'silk', 'zari', 'wedding', 'festival'],
    },
    {
      name: "Aytin Cotton Handloom Saree - Daily Wear",
      sku: "AYT-SAR-COT-002",
      description: "Lightweight and breathable handloom cotton saree for daily comfort.",
      shortDescription: "Handloom cotton for daily wear",
      mrp: 1299,
      sellingPrice: 999,
      costPrice: 600,
      discount: 23,
      gst: 5,
      category: category._id,
      stock: 50,
      lowStockAlert: 10,
      stockStatus: STOCK_STATUS.IN_STOCK,
      sareeFabric: 'Cotton',
      workType: 'Minimal Work',
      primaryColor: 'Mustard',
      occasion: ['Casual', 'Daily'],
      isFeatured: false,
      isNewArrival: true,
      status: PRODUCT_STATUS.PUBLISHED,
      isActive: true,
      tags: ['cotton', 'handloom', 'daily', 'casual'],
    },
    {
      name: "Aytin Georgette Embroidered Saree - Festive",
      sku: "AYT-SAR-GEO-003",
      description: "Elegant georgette saree with beautiful embroidery work for festive occasions.",
      shortDescription: "Embroidered georgette saree",
      mrp: 2399,
      sellingPrice: 1999,
      costPrice: 1200,
      discount: 17,
      gst: 5,
      category: category._id,
      stock: 15,
      lowStockAlert: 5,
      stockStatus: STOCK_STATUS.IN_STOCK,
      sareeFabric: 'Georgette',
      workType: 'Embroidered',
      primaryColor: 'Royal Blue',
      occasion: ['Festival', 'Party'],
      isFeatured: true,
      isTodaysDeal: true,
      status: PRODUCT_STATUS.PUBLISHED,
      isActive: true,
      tags: ['georgette', 'embroidered', 'festive', 'party'],
    },
    {
      name: "Aytin Chiffon Saree - Everyday Elegance",
      sku: "AYT-SAR-CHI-004",
      description: "Soft and flowy chiffon saree perfect for office and casual events.",
      shortDescription: "Lightweight chiffon saree",
      mrp: 1799,
      sellingPrice: 1499,
      costPrice: 800,
      discount: 17,
      gst: 5,
      category: category._id,
      stock: 35,
      lowStockAlert: 5,
      stockStatus: STOCK_STATUS.IN_STOCK,
      sareeFabric: 'Chiffon',
      workType: 'Woven Texture',
      primaryColor: 'Sea Green',
      secondaryColor: 'Teal',
      occasion: ['Casual', 'Office'],
      isNewArrival: true,
      status: PRODUCT_STATUS.PUBLISHED,
      isActive: true,
      tags: ['chiffon', 'lightweight', 'office', 'casual'],
    },
  ];

  await Product.insertMany(products);
  logger.info(`Seeded ${products.length} products`);
}

module.exports = { seedProducts };

