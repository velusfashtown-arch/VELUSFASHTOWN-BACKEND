const Website = require('../models/tenant/Website');
const HomepageSection = require('../models/tenant/HomepageSection');
const Navigation = require('../models/tenant/Navigation');
const NavigationItem = require('../models/tenant/NavigationItem');
const Banner = require('../models/tenant/Banner');
const Category = require('../models/admin/Products/Categories/Category/Category');
const Collection = require('../models/admin/Collections/Collection/Collection');
const logger = require('../utils/logger');
const { HOMEPAGE_SECTION_TYPES, NAVIGATION_TYPES } = require('../constants');

// Demo homepage sections, a header navigation menu and two banners for the
// default website, so the Websites → Homepage/Navigation/Banners admin
// screens aren't empty on first login.
async function seedWebsiteContent() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  const website = await Website.findOne({ isDefault: true });
  if (!website) {
    logger.info('Default website not found yet — skipping homepage/navigation/banner seed.');
    return;
  }

  if (forceReset) {
    await HomepageSection.deleteMany({ website: website._id });
    await NavigationItem.deleteMany({ website: website._id });
    await Navigation.deleteMany({ website: website._id });
    await Banner.deleteMany({ website: website._id });
  }

  await seedHomepageSections(website);
  await seedNavigation(website);
  await seedBanners(website);
}

async function seedHomepageSections(website) {
  const existingCount = await HomepageSection.countDocuments({ website: website._id });
  if (existingCount > 0) {
    logger.info(`Homepage sections already seeded (${existingCount}). Skipping.`);
    return;
  }

  const sections = [
    {
      type: HOMEPAGE_SECTION_TYPES.ANNOUNCEMENT_BAR,
      title: '',
      settings: { text: 'Free shipping on orders above ₹999', link: '/shop' },
      items: [],
      sortOrder: 1,
    },
    {
      type: HOMEPAGE_SECTION_TYPES.HERO,
      title: 'Hero Banner',
      settings: { heading: 'Timeless Sarees, Modern Elegance', subheading: 'Handpicked weaves for every occasion', buttonText: 'Shop Now', buttonLink: '/shop' },
      items: [{ image: 'https://picsum.photos/seed/velus-hero/1600/800', link: '/shop' }],
      sortOrder: 2,
    },
    {
      type: HOMEPAGE_SECTION_TYPES.CATEGORY_GRID,
      title: 'Shop by Category',
      settings: { limit: 4 },
      items: [],
      sortOrder: 3,
    },
    {
      type: HOMEPAGE_SECTION_TYPES.PRODUCT_CAROUSEL,
      title: 'Best Sellers',
      settings: { filter: 'isBestSeller', limit: 8 },
      items: [],
      sortOrder: 4,
    },
    {
      type: HOMEPAGE_SECTION_TYPES.COLLECTION_GRID,
      title: 'Shop by Collection',
      settings: { limit: 4 },
      items: [],
      sortOrder: 5,
    },
    {
      type: HOMEPAGE_SECTION_TYPES.TESTIMONIALS,
      title: 'What our customers say',
      settings: {},
      items: [
        { name: 'Priya Sharma', text: 'Beautiful saree, exactly as shown. Fast delivery too!', rating: 5 },
        { name: 'Ananya Iyer', text: 'The fabric quality is amazing for the price.', rating: 5 },
        { name: 'Kavita Patel', text: 'My go-to store for festive sarees now.', rating: 4 },
      ],
      sortOrder: 6,
    },
    {
      type: HOMEPAGE_SECTION_TYPES.NEWSLETTER,
      title: 'Stay in the loop',
      settings: { heading: 'Get 10% off your first order', subheading: 'Subscribe to our newsletter' },
      items: [],
      sortOrder: 7,
    },
  ];

  await HomepageSection.insertMany(sections.map((s) => ({ ...s, website: website._id })));
  logger.info(`Seeded ${sections.length} homepage sections`);
}

async function seedNavigation(website) {
  const existingCount = await Navigation.countDocuments({ website: website._id });
  if (existingCount > 0) {
    logger.info(`Navigation already seeded (${existingCount}). Skipping.`);
    return;
  }

  const rootCategory = await Category.findOne({}).sort({ createdAt: 1 });
  const collections = await Collection.find({}).limit(2).lean();

  const header = await Navigation.create({ website: website._id, name: 'Main Menu', location: 'header', isActive: true });
  const footer = await Navigation.create({ website: website._id, name: 'Footer Menu', location: 'footer', isActive: true });

  const headerItems = [
    { label: 'Shop All', type: NAVIGATION_TYPES.CUSTOM_URL, url: '/shop', sortOrder: 1 },
    rootCategory
      ? { label: rootCategory.name, type: NAVIGATION_TYPES.CATEGORY, targetId: rootCategory._id, url: '', sortOrder: 2 }
      : { label: 'Sarees', type: NAVIGATION_TYPES.CUSTOM_URL, url: '/shop', sortOrder: 2 },
    ...collections.map((c, i) => ({ label: c.name, type: NAVIGATION_TYPES.COLLECTION, targetId: c._id, url: '', sortOrder: 3 + i })),
    { label: 'Contact Us', type: NAVIGATION_TYPES.CUSTOM_URL, url: '/contact', sortOrder: 5 },
  ];

  const footerItems = [
    { label: 'About Us', type: NAVIGATION_TYPES.CUSTOM_URL, url: '/about', sortOrder: 1 },
    { label: 'Track Order', type: NAVIGATION_TYPES.CUSTOM_URL, url: '/account', sortOrder: 2 },
    { label: 'Contact Us', type: NAVIGATION_TYPES.CUSTOM_URL, url: '/contact', sortOrder: 3 },
  ];

  await NavigationItem.insertMany(headerItems.map((item) => ({ ...item, navigation: header._id, website: website._id })));
  await NavigationItem.insertMany(footerItems.map((item) => ({ ...item, navigation: footer._id, website: website._id })));
  logger.info(`Seeded navigation: ${headerItems.length} header item(s), ${footerItems.length} footer item(s)`);
}

async function seedBanners(website) {
  const existingCount = await Banner.countDocuments({ website: website._id });
  if (existingCount > 0) {
    logger.info(`Banners already seeded (${existingCount}). Skipping.`);
    return;
  }

  const banners = [
    {
      title: 'Wedding Season Sale',
      subtitle: 'Up to 30% off on premium silk sarees',
      desktopImage: 'https://picsum.photos/seed/velus-banner-1/1600/500',
      mobileImage: 'https://picsum.photos/seed/velus-banner-1m/800/1000',
      buttonText: 'Shop Wedding Collection',
      buttonUrl: '/shop',
      sortOrder: 1,
      status: 'active',
    },
    {
      title: 'New Arrivals',
      subtitle: 'Fresh handloom weaves, just in',
      desktopImage: 'https://picsum.photos/seed/velus-banner-2/1600/500',
      mobileImage: 'https://picsum.photos/seed/velus-banner-2m/800/1000',
      buttonText: 'Explore Now',
      buttonUrl: '/shop',
      sortOrder: 2,
      status: 'active',
    },
  ];

  await Banner.insertMany(banners.map((b) => ({ ...b, website: website._id })));
  logger.info(`Seeded ${banners.length} banners`);
}

module.exports = { seedWebsiteContent };
