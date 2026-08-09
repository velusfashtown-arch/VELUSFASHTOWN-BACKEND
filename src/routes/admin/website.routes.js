const express = require('express');
const router = express.Router();
const WebsiteController = require('../../controllers/admin/WebsiteController');
const WebsiteProductController = require('../../controllers/admin/WebsiteProductController');
const WebsiteContentController = require('../../controllers/admin/WebsiteContentController');
const { authenticate, authorize } = require('../../middleware');
const { ROLES } = require('../../constants');

// All routes require authentication
router.use(authenticate);

// ─── Website CRUD ────────────────────────────────────────────────────
router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), WebsiteController.list);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), WebsiteController.create);
router.get('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), WebsiteController.get);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), WebsiteController.update);
router.post('/:id/activate', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), WebsiteController.activate);
router.post('/:id/deactivate', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), WebsiteController.deactivate);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), WebsiteController.remove);

// ─── Website Domains ─────────────────────────────────────────────────
router.get('/:id/domains', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), WebsiteController.listDomains);
router.post('/:id/domains', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), WebsiteController.addDomain);
router.delete('/:id/domains/:domainId', authorize(ROLES.SUPER_ADMIN), WebsiteController.removeDomain);
router.post('/:id/domains/:domainId/primary', authorize(ROLES.SUPER_ADMIN), WebsiteController.setPrimaryDomain);

// ─── Website Product Assignment / Approval / Publishing ───────────────
router.get('/:id/products', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.listForWebsite);
router.post('/:id/products', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.assign);
router.post('/:id/products/bulk-assign', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.bulkAssign);
router.get('/:id/products/:productId', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.getAssignment);
router.get('/:id/products/:productId/history', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.getHistory);
router.put('/:id/products/:productId', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.update);
router.delete('/:id/products/:productId', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.unassign);

// Approval / publishing
router.post('/:id/products/:productId/approve', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.approve);
router.post('/:id/products/:productId/reject', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.reject);
router.post('/:id/products/:productId/publish', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.publish);
router.post('/:id/products/:productId/unpublish', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.unpublish);

// Bulk approve / publish
router.post('/:id/products/bulk-approve', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.bulkApprove);
router.post('/:id/products/bulk-publish', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CATALOG_MANAGER), WebsiteProductController.bulkPublish);

// ─── Website Homepage Sections ────────────────────────────────────────
const contentAllowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT_MANAGER];
router.get('/:id/homepage', authorize(...contentAllowed), WebsiteContentController.listHomepageSections);
router.post('/:id/homepage', authorize(...contentAllowed), WebsiteContentController.createHomepageSection);
router.post('/:id/homepage/reorder', authorize(...contentAllowed), WebsiteContentController.reorderHomepageSections);
router.put('/:id/homepage/:sectionId', authorize(...contentAllowed), WebsiteContentController.updateHomepageSection);
router.delete('/:id/homepage/:sectionId', authorize(...contentAllowed), WebsiteContentController.deleteHomepageSection);
router.post('/:id/homepage/:sectionId/duplicate', authorize(...contentAllowed), WebsiteContentController.duplicateHomepageSection);

// ─── Website Navigation ───────────────────────────────────────────────
router.get('/:id/navigation', authorize(...contentAllowed), WebsiteContentController.listNavigations);
router.post('/:id/navigation', authorize(...contentAllowed), WebsiteContentController.createNavigationItem);
router.post('/:id/navigation/reorder', authorize(...contentAllowed), WebsiteContentController.reorderNavigationItems);
router.put('/:id/navigation/:itemId', authorize(...contentAllowed), WebsiteContentController.updateNavigationItem);
router.delete('/:id/navigation/:itemId', authorize(...contentAllowed), WebsiteContentController.deleteNavigationItem);

// ─── Website Banners ──────────────────────────────────────────────────
router.get('/:id/banners', authorize(...contentAllowed), WebsiteContentController.listBanners);
router.post('/:id/banners', authorize(...contentAllowed), WebsiteContentController.createBanner);
router.put('/:id/banners/:bannerId', authorize(...contentAllowed), WebsiteContentController.updateBanner);
router.delete('/:id/banners/:bannerId', authorize(...contentAllowed), WebsiteContentController.deleteBanner);

module.exports = router;
