# Backend Restructuring TODO

## Phase 1: Foundation & Configuration
- [x] Install missing npm packages
- [x] Create enterprise folder structure
- [x] Create config files (db, cloudinary, jwt, mail, app)
- [x] Create utility files (response, error, async handler, logger)
- [x] Create constants/enums

## Phase 2: Models
- [x] Admin Model (roles, refresh token, etc.)
- [x] Product Model (complete rewrite)
- [x] Category Model (nested)
- [x] Brand Model
- [x] Collection Model
- [x] Enhanced Order Model
- [x] Enhanced Customer Model
- [x] Inventory Model

## Phase 3: Validators (Zod)
- [x] Auth validators
- [x] Product validators
- [x] Category/Brand/Collection validators
- [x] Order validators

## Phase 4: Repository Layer
- [x] Base repository
- [x] Product repository
- [x] Category repository
- [x] Brand repository
- [x] Collection repository
- [x] Order repository
- [x] Customer repository
- [x] Admin repository

## Phase 5: Service Layer
- [x] Auth service
- [x] Product service
- [x] Category service
- [x] Brand service
- [x] Collection service
- [x] Order service
- [x] Customer service
- [x] Dashboard service
- [x] Upload service
- [x] Search service

## Phase 6: Middleware
- [x] Auth middleware (JWT + roles)
- [x] Error handler
- [x] Validation middleware
- [x] Upload middleware
- [x] Rate limiter
- [x] Logger middleware
- [x] Security middleware

## Phase 7: Controllers
- [x] Auth controller
- [x] Product controller
- [x] Category controller
- [x] Brand controller
- [x] Collection controller
- [x] Order controller
- [x] Customer controller
- [x] Dashboard controller
- [x] Upload controller
- [x] Search controller

## Phase 8: Routes
- [x] All route files with Swagger docs
- [x] Route index

## Phase 9: Server & App Setup
- [x] Rewrite app.js
- [x] Rewrite server.js
- [x] Create .env

## Phase 10: Seed & Final
- [x] Enhanced seed scripts
- [x] Swagger API docs

---

# MULTI-WEBSITE / MULTI-TENANT PLATFORM

## PHASE 1: Multi-Website Foundation (DONE)
- [x] Website model (theme, contact, social, SEO, shipping/payment config, domain)
- [x] WebsiteDomain model
- [x] WebsiteProduct model (assignment: websiteTitle/Desc/Price/SEO/featured/order)
- [x] WebsiteProductApproval model (approval history)
- [x] HomepageSection model
- [x] Navigation + NavigationItem models
- [x] Banner model
- [x] Coupon, Offer models
- [x] Review model
- [x] Page, BlogPost (+ BlogCategory) models
- [x] AuditLog, Notification models
- [x] Role, Permission, RolePermission models
- [x] models/tenant/index.js aggregator
- [x] WebsiteRepository, WebsiteProductRepository
- [x] resolveWebsite middleware (hostname → domain → slug → default)
- [x] optionalResolveWebsite middleware
- [x] WebsiteService, WebsiteProductService (assign/approve/reject/publish/unpublish)
- [x] Admin WebsiteController, WebsiteProductController
- [x] routes/admin/website.routes.js (CRUD + assign/unassign + approve/reject/publish/unpublish)
- [x] StorefrontController (website-scoped, approved+published only)
- [x] routes/storefront/index.routes.js (resolveWebsite)
- [x] routes/index.js registration (storefront + admin/websites)
- [x] Constants/enums (ROLES, APPROVAL_STATUS, WEBSITE_STATUS, PERMISSIONS, etc.)
- [x] ROLES corrected to SUPER_ADMIN/ADMIN/CATALOG_MANAGER/ORDER_MANAGER/etc.
- [x] All route role references updated (product→CATALOG_MANAGER, order/shipping→ORDER_MANAGER, upload→CATALOG_MANAGER, category/collection→CATALOG_MANAGER, customer→ORDER_MANAGER)
- [x] website.seed.js (default VELU'S FASHTOWN + backfill existing products)
- [x] seed/index.js wired
- [x] Duplicate index warnings cleaned (Website, WebsiteDomain, Coupon)
- [x] Backend module graph loads cleanly

## PHASE 1b: Website Content Management (Homepage / Navigation / Banners) — DONE
- [x] WebsiteContentService (homepage sections CRUD/reorder/duplicate, navigation items, banners)
- [x] WebsiteContentController (admin endpoints)
- [x] routes/admin/website.routes.js — homepage/navigation/banner routes (CONTENT_MANAGER access)
- [x] services/index.js registered WebsiteContentService
- [x] Admin frontend API methods for homepage/navigation/banners
- [x] node --check passes on new backend files

<!-- PHASE 2: Product management (variants, colors, images, categories, collections, inventory) - NEXT -->
<!-- PHASE 3: Multi-website theme + settings + homepage builder + navigation builder -->
<!-- PHASE 4: Multi-website storefront (website-aware React) -->
<!-- PHASE 5: Cart + checkout + orders -->
<!-- PHASE 6: CMS + SEO + blogs -->
<!-- PHASE 7: Analytics + notifications + audit logs -->
<!-- PHASE 8: Testing + security + production hardening -->
