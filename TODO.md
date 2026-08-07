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
