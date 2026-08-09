const HomepageSection = require('../models/tenant/HomepageSection');
const Navigation = require('../models/tenant/Navigation');
const NavigationItem = require('../models/tenant/NavigationItem');
const Banner = require('../models/tenant/Banner');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * WebsiteContentService
 *
 * Manages website-specific homepage sections, navigation, and banners.
 * All content is stored in MongoDB and rendered dynamically by the
 * storefront — nothing is hard-coded.
 */
class WebsiteContentService {
  // ─── Homepage Sections ─────────────────────────────────────────────
  async listHomepageSections(websiteId) {
    return HomepageSection.find({ website: websiteId }).sort({ sortOrder: 1 }).lean();
  }

  async createHomepageSection(websiteId, data = {}) {
    const count = await HomepageSection.countDocuments({ website: websiteId });
    const section = await HomepageSection.create({
      website: websiteId,
      type: data.type || 'Hero',
      title: data.title || '',
      settings: data.settings || {},
      items: data.items || [],
      sortOrder: data.sortOrder ?? count,
      isActive: data.isActive !== false,
    });
    logger.info(`Homepage section created for website ${websiteId}: ${section.type}`);
    return section;
  }

  async updateHomepageSection(websiteId, sectionId, data = {}) {
    const section = await HomepageSection.findOne({ _id: sectionId, website: websiteId });
    if (!section) throw AppError.notFound('Homepage section not found');
    const updatable = ['type', 'title', 'settings', 'items', 'sortOrder', 'isActive'];
    updatable.forEach((key) => {
      if (data[key] !== undefined) section[key] = data[key];
    });
    await section.save();
    return section;
  }

  async deleteHomepageSection(websiteId, sectionId) {
    const section = await HomepageSection.findOneAndDelete({ _id: sectionId, website: websiteId });
    if (!section) throw AppError.notFound('Homepage section not found');
    return { success: true };
  }

  async duplicateHomepageSection(websiteId, sectionId) {
    const section = await HomepageSection.findOne({ _id: sectionId, website: websiteId });
    if (!section) throw AppError.notFound('Homepage section not found');
    const count = await HomepageSection.countDocuments({ website: websiteId });
    const copy = await HomepageSection.create({
      website: websiteId,
      type: section.type,
      title: section.title ? `${section.title} (Copy)` : section.title,
      settings: section.settings || {},
      items: section.items || [],
      sortOrder: count,
      isActive: false,
    });
    return copy;
  }

  async reorderHomepageSections(websiteId, orderedIds = []) {
    const ops = orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: id, website: websiteId }, update: { $set: { sortOrder: index } } },
    }));
    if (ops.length) await HomepageSection.bulkWrite(ops);
    return HomepageSection.find({ website: websiteId }).sort({ sortOrder: 1 }).lean();
  }

  // ─── Navigation ────────────────────────────────────────────────────
  async listNavigations(websiteId) {
    const navigations = await Navigation.find({ website: websiteId }).sort({ location: 1 }).lean();
    const navIds = navigations.map((n) => n._id);
    const items = navIds.length
      ? await NavigationItem.find({ navigation: { $in: navIds } }).sort({ sortOrder: 1 }).lean()
      : [];
    return { navigations, items };
  }

  async createNavigationItem(websiteId, data = {}) {
    // Resolve or create the header navigation menu for this website.
    let nav = data.navigationId
      ? await Navigation.findOne({ _id: data.navigationId, website: websiteId })
      : null;
    if (!nav) {
      nav = await Navigation.findOne({ website: websiteId, location: data.location || 'header' });
    }
    if (!nav) {
      nav = await Navigation.create({
        website: websiteId,
        name: data.location === 'footer' ? 'Footer' : 'Header',
        location: data.location || 'header',
        isActive: true,
      });
    }

    const count = await NavigationItem.countDocuments({ navigation: nav._id });
    const item = await NavigationItem.create({
      navigation: nav._id,
      website: websiteId,
      parent: data.parent || null,
      label: data.label || 'Menu Item',
      type: data.type || 'CUSTOM_URL',
      targetId: data.targetId || null,
      url: data.url || '',
      sortOrder: data.sortOrder ?? count,
      isActive: data.isActive !== false,
    });
    return item;
  }

  async updateNavigationItem(websiteId, itemId, data = {}) {
    const item = await NavigationItem.findOne({ _id: itemId, website: websiteId });
    if (!item) throw AppError.notFound('Navigation item not found');
    const updatable = ['parent', 'label', 'type', 'targetId', 'url', 'sortOrder', 'isActive'];
    updatable.forEach((key) => {
      if (data[key] !== undefined) item[key] = data[key];
    });
    await item.save();
    return item;
  }

  async deleteNavigationItem(websiteId, itemId) {
    const item = await NavigationItem.findOneAndDelete({ _id: itemId, website: websiteId });
    if (!item) throw AppError.notFound('Navigation item not found');
    // Remove children referencing this item as parent.
    await NavigationItem.updateMany({ website: websiteId, parent: item._id }, { $set: { parent: null } });
    return { success: true };
  }

  async reorderNavigationItems(websiteId, orderedIds = []) {
    const ops = orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: id, website: websiteId }, update: { $set: { sortOrder: index } } },
    }));
    if (ops.length) await NavigationItem.bulkWrite(ops);
    const navigations = await Navigation.find({ website: websiteId }).lean();
    const navIds = navigations.map((n) => n._id);
    const items = await NavigationItem.find({ navigation: { $in: navIds } }).sort({ sortOrder: 1 }).lean();
    return items;
  }

  // ─── Banners ───────────────────────────────────────────────────────
  async listBanners(websiteId) {
    return Banner.find({ website: websiteId }).sort({ sortOrder: 1 }).lean();
  }

  async createBanner(websiteId, data = {}) {
    const count = await Banner.countDocuments({ website: websiteId });
    const banner = await Banner.create({
      website: websiteId,
      title: data.title || '',
      subtitle: data.subtitle || '',
      desktopImage: data.desktopImage || '',
      mobileImage: data.mobileImage || '',
      buttonText: data.buttonText || '',
      buttonUrl: data.buttonUrl || '',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      sortOrder: data.sortOrder ?? count,
      status: data.status || 'active',
    });
    return banner;
  }

  async updateBanner(websiteId, bannerId, data = {}) {
    const banner = await Banner.findOne({ _id: bannerId, website: websiteId });
    if (!banner) throw AppError.notFound('Banner not found');
    const updatable = ['title', 'subtitle', 'desktopImage', 'mobileImage', 'buttonText', 'buttonUrl', 'startDate', 'endDate', 'sortOrder', 'status'];
    updatable.forEach((key) => {
      if (data[key] !== undefined) banner[key] = data[key];
    });
    await banner.save();
    return banner;
  }

  async deleteBanner(websiteId, bannerId) {
    const banner = await Banner.findOneAndDelete({ _id: bannerId, website: websiteId });
    if (!banner) throw AppError.notFound('Banner not found');
    return { success: true };
  }
}

module.exports = new WebsiteContentService();
