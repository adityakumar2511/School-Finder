# SchoolFinder — Backend Documentation

> **Stack:** Express.js 5 · TypeScript · Prisma 5 · PostgreSQL (Neon) · JWT · Cloudinary · Resend  
> **Default port:** `4000` · **Repository path:** `backend/`  
> **Schema owner:** `backend/prisma/schema.prisma` (single source of truth)

This document describes the production-ready SchoolFinder REST API: architecture, authentication, security, data access, deployment, and operational behavior.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Authentication Architecture](#4-authentication-architecture)
5. [API Architecture](#5-api-architecture)
6. [Middleware System](#6-middleware-system)
7. [Validation Architecture](#7-validation-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Upload System](#9-upload-system)
10. [Database Architecture](#10-database-architecture)
11. [Error Handling System](#11-error-handling-system)
12. [API Endpoints](#12-api-endpoints)
13. [Dashboard Permissions](#13-dashboard-permissions)
14. [Environment Variables](#14-environment-variables)
15. [Local Development Setup](#15-local-development-setup)
16. [Production Deployment](#16-production-deployment)
17. [Performance Optimizations](#17-performance-optimizations)
18. [Security Notes](#18-security-notes)
19. [Future Improvements](#19-future-improvements)

---

## 1. Project Overview

### Backend Purpose

The SchoolFinder backend is a **stateless REST API** and the **single source of truth** for all database operations. It powers:

- Public school discovery (listings, search, detail)
- Role-separated authentication (parent, school admin, platform admin)
- School registration and moderation workflows
- Parent inquiries and favourites
- Admin platform management (users, schools, inquiries)
- Parent profile and dashboard APIs

The Next.js frontend handles UI, NextAuth sessions, and primary image uploads to Cloudinary. The backend enforces business rules, JWT authorization, and all Prisma/database access.

### Express.js API Architecture

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP method + path mapping, middleware chains |
| **Controllers** | Request handling, Prisma operations, response shaping |
| **Middleware** | Auth, roles, validation, security, errors |
| **Lib** | Prisma client, pagination, queries, cache, Cloudinary, mailer |
| **Validators** | Zod schemas for request bodies |

Entry point: `src/server.ts` — mounts routes, global middleware, health checks, and error handlers.

### Prisma ORM

- **Schema source of truth:** `backend/prisma/schema.prisma`
- **Client output:** `generated/prisma` (Prisma 5 with `@prisma/adapter-pg`)
- **Migrations:** `backend/prisma/migrations/` — run from backend only
- **Scripts:** `migrate:dev`, `migrate:deploy`, `db:generate`

The frontend has **no Prisma dependency** and does not run migrations.

### JWT Authentication

- Bearer tokens issued on register/login/google-sync
- Algorithm: **HS256**, issuer: **`schoolfinder-api`**
- Payload: `{ id, role, email }`
- Validated by `middleware/auth.ts` on protected routes
- In-memory token blacklist on logout
- Expiration via `JWT_EXPIRES_IN` (default `7d`)

### Role-Based Access Control

| Role | Scope |
|------|--------|
| `PARENT` | Inquiries, favourites, parent profile APIs |
| `SCHOOL_ADMIN` | Own school profile, images, own school inquiries |
| `ADMIN` | Full moderation panel APIs |

Roles are enforced with `requireRole()` after JWT verification.

---

## 2. Tech Stack

| Technology | Usage |
|------------|--------|
| **Express.js 5** | HTTP server, routing, middleware pipeline |
| **TypeScript** | Type-safe controllers and middleware |
| **Prisma 5** | PostgreSQL access via `@prisma/adapter-pg` + `pg` pool |
| **PostgreSQL (Neon)** | Managed serverless Postgres with SSL |
| **JWT (`jsonwebtoken`)** | API authentication tokens |
| **Zod** | Request body validation |
| **bcryptjs** | Password hashing (`BCRYPT_ROUNDS`, default 12) |
| **Resend** | Password reset and OTP emails |
| **Cloudinary** | Image storage utilities (`lib/cloudinary.ts`) |
| **Helmet** | Security headers (CSP, HSTS) |
| **express-rate-limit** | Global and route-specific rate limiting |
| **Multer** | In-memory upload parsing (`middleware/upload.ts`, not mounted) |
| **CORS** | Origin-restricted cross-origin requests |

---

## 3. Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Database schema (source of truth)
│   └── migrations/             # Prisma migration history
├── generated/
│   └── prisma/                 # Generated Prisma client
├── render.yaml                 # Render deployment blueprint
├── .env.example                # Environment template
├── src/
│   ├── server.ts               # App bootstrap, routes, health checks
│   ├── config/
│   │   └── production.ts       # Startup env validation
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── schools.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── inquiry.controller.ts
│   │   ├── favourite.controller.ts
│   │   └── parent.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── schools.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── inquiry.routes.ts
│   │   ├── favourite.routes.ts
│   │   └── parent.routes.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification, signAccessToken, blacklist
│   │   ├── roleCheck.ts        # Role gate
│   │   ├── validate.ts         # Zod body validation
│   │   ├── security.ts         # Helmet, CORS, rate limits
│   │   ├── bruteForce.ts       # Login attempt throttling
│   │   ├── upload.ts           # Multer + file validation (unused in routes)
│   │   └── errorHandler.ts     # Centralized errors
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── school.validator.ts
│   ├── lib/
│   │   ├── prisma.ts           # Database client + connection pool
│   │   ├── pagination.ts       # Page/limit helpers, response envelope
│   │   ├── cache.ts            # In-memory TTL cache + invalidation
│   │   ├── mailer.ts           # Resend email (reset, OTP)
│   │   ├── sanitize.ts         # HTML encoding, phone validation
│   │   ├── queries/schools.ts  # Select objects, search builders
│   │   ├── cloudinary.ts       # Upload/delete helpers
│   │   └── account-status.ts   # Disabled account sentinel
│   ├── scripts/
│   │   └── seed-admin.ts       # First admin from ADMIN_EMAIL/PASSWORD
│   └── utils/
│       ├── AppError.ts         # Typed HTTP errors
│       └── asyncHandler.ts     # Async route wrapper
├── package.json
└── tsconfig.json
```

### Folder Responsibilities

| Folder | Responsibility |
|--------|----------------|
| `controllers/` | Business logic, Prisma calls, HTTP responses |
| `routes/` | Express routers; compose middleware + controllers |
| `middleware/` | Cross-cutting concerns (auth, security, validation, errors) |
| `validators/` | Zod schemas exported for `validate()` middleware |
| `lib/` | Shared infrastructure (DB, pagination, queries, cache, mail) |
| `utils/` | Small reusable helpers |
| `config/` | Environment-specific startup behavior |

---

## 4. Authentication Architecture

Authentication is **role-separated**. Login accepts optional `expectedRole` to prevent cross-role access.

### Parent (`PARENT`)

| Frontend route | Backend endpoint |
|----------------|------------------|
| `/register` | `POST /api/auth/register-parent` |
| `/login` | `POST /api/auth/login` with `expectedRole: "PARENT"` |
| Google OAuth | `POST /api/auth/google-sync` (upsert parent, return JWT) |

### School Administrator (`SCHOOL_ADMIN`)

| Frontend route | Backend endpoint |
|----------------|------------------|
| `/school-register` | `POST /api/auth/register-school` |
| `/school-login` | `POST /api/auth/login` with `expectedRole: "SCHOOL_ADMIN"` |

Registration creates `User` + `School` in a transaction. New schools start with `status: PENDING`.

### Platform Administrator (`ADMIN`)

| Frontend route | Backend endpoint |
|----------------|------------------|
| `/admin-login` | `POST /api/auth/login` with `expectedRole: "ADMIN"` |

### JWT Flow

```
Client → Authorization: Bearer <token>
       → auth middleware verifies HS256 + issuer schoolfinder-api
       → check in-memory blacklist
       → req.user = { id, role, email }
       → requireRole(...) if needed
       → controller
```

### Password Reset

1. `POST /api/auth/forgot-password` — generates random token, stores SHA-256 hash + 1h expiry on `User`
2. Email sent via Resend with link `{FRONTEND_URL}/reset-password?token=...`
3. `POST /api/auth/reset-password` — validates token hash + expiry, updates password, clears reset fields

### Logout

`POST /api/auth/logout` (authenticated) — adds token to in-memory blacklist.

### Profile

- `GET /api/auth/me` — current user profile
- `PATCH /api/auth/me` — update name, phone, image

### Middleware Flow (Auth Routes)

```
POST /api/auth/login
  → authRateLimiter (10 / 15 min)
  → bruteForceGuard
  → validate(loginSchema)
  → asyncHandler(login)
```

---

## 5. API Architecture

### REST Structure

Base URL: `http://localhost:4000` (development) or deployed HTTPS origin.

| Prefix | Domain |
|--------|--------|
| `/api/auth` | Registration, login, profile, password reset, Google sync |
| `/api/schools` | Public listings, search, school CRUD, images |
| `/api/admin` | Platform administration (ADMIN only) |
| `/api/inquiries` | Parent inquiries, school/admin management |
| `/api/favourites` | Parent favourites (legacy shape) |
| `/api/parent` | Parent profile, favourites, inquiries (dashboard shape) |
| `/health` | Liveness + database connectivity |
| `/ready` | Lightweight readiness probe |

### Route Organization

- One router file per domain under `src/routes/`
- Routers mounted in `server.ts` with clear prefixes
- **Route order matters:** static paths (`/my-school`, `/search`) before `/:slug`

### Validation Flow

```
Request body
  → sanitizeRequestBody()
  → Zod safeParse
  → 400 + field errors on failure
  → req.body replaced with parsed data
  → controller
```

---

## 6. Middleware System

### Request Lifecycle

```
Incoming request
  → applySecurityMiddleware (trust proxy, Helmet, CORS, method guard)
  → express.json / urlencoded (2MB limit)
  → generalRateLimiter (100 / 15 min per IP)
  → route-specific middleware chain
  → controller
  → notFoundHandler (unknown routes)
  → errorHandler (global)
```

### Rate Limiters

| Limiter | Scope | Limit |
|---------|-------|-------|
| `generalRateLimiter` | All routes | 100 / 15 min / IP |
| `authRateLimiter` | `/api/auth/*` (login, register, etc.) | 10 / 15 min / IP |
| `forgotPasswordRateLimiter` | Forgot password | 3 / hour / IP |
| `resetPasswordRateLimiter` | Reset password | 5 / hour / IP |

### `auth` — JWT Verification

- Requires `Authorization: Bearer <token>`
- Validates HS256, issuer `schoolfinder-api`
- Checks in-memory blacklist
- Attaches `req.user` on success

### `requireRole` — Role Gate

- Factory: `requireRole("ADMIN")` or `requireRole("SCHOOL_ADMIN", "ADMIN")`
- Returns `403` if role not in allowed list

### `bruteForce` — Login Protection

- Tracks failures by `IP + email`
- Blocks after 5 failures within 15 minutes
- Returns `429` when blocked

---

## 7. Validation Architecture

### Zod Validators

| File | Schemas |
|------|---------|
| `validators/auth.validator.ts` | `registerParentSchema`, `registerSchoolSchema`, `loginSchema`, forgot/reset schemas |
| `validators/school.validator.ts` | `createSchoolBodySchema`, `updateSchoolBodySchema` |

### Sanitization

`lib/sanitize.ts`:

- HTML entity encoding and tag stripping on text fields
- Indian phone number normalization
- `sanitizeSchoolData()` for school create/update
- Prototype pollution key stripping in `sanitizeRequestBody()`

---

## 8. Security Architecture

### Helmet Configuration

- Content Security Policy
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- HSTS via `strictTransportSecurity` in production

### CORS

- **Development:** defaults to `http://localhost:3000` if `FRONTEND_URL` unset
- **Production:** requires `FRONTEND_URL` (comma-separated for multiple origins)
- Exact origin match — no trailing slash

### JWT Hardening

- Algorithm locked to HS256
- Issuer claim: `schoolfinder-api`
- Three-part structure validated before verify
- Token blacklist on logout (in-memory; use Redis in multi-instance deployments)

### Account Disable

Disabled users have `phone = "__DISABLED__"`. Login returns `403`. Admin toggles via `PATCH /api/admin/users/:id/status`.

---

## 9. Upload System

### Current Architecture

Primary uploads happen on the **frontend** (`POST /api/upload` → Cloudinary). The backend receives **image URLs** in JSON bodies:

- School logo/profile: `PATCH /api/schools/:id` with `logoUrl`
- Gallery: `POST /api/schools/my-school/images` with `{ url, caption? }`
- Delete gallery: `DELETE /api/schools/images/:id`

### Backend Upload Utilities (Available)

`lib/cloudinary.ts` and `middleware/upload.ts` provide Multer + magic-byte validation + Cloudinary upload. These are **not mounted on any route** currently but are available for direct API integration.

| Rule | Value |
|------|--------|
| Allowed types | JPEG, PNG, WebP |
| Max size | 5 MB |

---

## 10. Database Architecture

### Schema Location

**Single source of truth:** `backend/prisma/schema.prisma`

Run all schema changes and migrations from the backend project only.

### Enums

| Enum | Values |
|------|--------|
| `Role` | `PARENT`, `SCHOOL_ADMIN`, `ADMIN` |
| `SchoolStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `BoardType` | `CBSE`, `ICSE`, `UP_BOARD`, `OTHER` |
| `SchoolType` | `BOYS`, `GIRLS`, `CO_ED` |
| `MediumType` | `HINDI`, `ENGLISH`, `BOTH` |
| `InquiryStatus` | `NEW`, `CONTACTED`, `CLOSED` |

### Models

| Model | Purpose |
|-------|---------|
| `User` | Accounts; `resetToken`, `resetTokenExpiry` for password reset; OTP fields |
| `School` | Listings with fees, status, owner relation |
| `SchoolImage` | Gallery images |
| `Facility` / `SchoolFacility` | Many-to-many facilities |
| `Inquiry` | Parent → school messages |
| `Favourite` | Parent saved schools |
| `Account`, `Session`, `VerificationToken` | OAuth tables (schema retained; frontend uses JWT-only NextAuth) |

### Indexes

**School:**

- `@@index([status, createdAt])`
- `@@index([city, status])`
- `@@index([board, status])`
- `@@index([ownerId])`

**Inquiry:**

- `@@index([schoolId, status])`
- `@@index([parentId])`

**Favourite:**

- `@@unique([parentId, schoolId])`
- `@@index([parentId])`

### Relationships

```
User 1──* School (owner)
User 1──* Inquiry (as parent)
User 1──* Favourite *──1 School
School 1──* SchoolImage
School *──* Facility (via SchoolFacility)
School 1──* Inquiry
```

### Migrations

```bash
# Development — create and apply migration
npm run migrate:dev

# Production — apply pending migrations
npm run migrate:deploy
# or: npx prisma migrate deploy (via render.yaml preDeployCommand)
```

Migration history: `prisma/migrations/`

### Pagination

| Context | Default `limit` | Max |
|---------|-----------------|-----|
| Public schools | 12 | 50 (1000 for sitemap) |
| Admin tables | 20 | 50 |
| Parent dashboard | 20 | 50 |

Response envelope:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 0,
    "totalPages": 0
  }
}
```

Legacy alias keys (`schools`, `users`, `inquiries`) preserve backward compatibility.

### Cache Layer

`lib/cache.ts` — in-memory Map with TTL:

| Namespace | TTL |
|-----------|-----|
| School list | 60 seconds |
| School detail | 300 seconds |
| Admin stats | 30 seconds |

`invalidateSchoolCache()` clears related keys on school approve/reject/update.

---

## 11. Error Handling System

### Centralized Error Handler

| Source | Typical status |
|--------|----------------|
| `AppError` | Custom (4xx/5xx) |
| `ZodError` | 400 |
| Prisma `P2002` | 409 Conflict |
| Prisma `P2025` | 404 Not found |
| JWT errors | 401 |
| Unknown | 500 |

Stack traces included **only** when `NODE_ENV=development`.

---

## 12. API Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Service status + DB ping (`503` if DB down) |
| GET | `/ready` | Public | Lightweight readiness check |

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register-parent` | Public | Create parent account + JWT |
| POST | `/register-school` | Public | Create school admin + school (`PENDING`) + JWT |
| POST | `/login` | Public | Login; optional `expectedRole` |
| POST | `/forgot-password` | Public | Generate reset token; send email via Resend |
| POST | `/verify-otp` | Public | Verify OTP code |
| POST | `/reset-password` | Public | Verify token, update password |
| POST | `/logout` | Bearer | Revoke token (blacklist) |
| GET | `/me` | Bearer | Current user profile |
| PATCH | `/me` | Bearer | Update profile |
| POST | `/google-sync` | Public | Upsert parent from Google profile; return JWT |

### Schools — `/api/schools`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Public | — | Paginated listing (search, filters, cursor/offset) |
| GET | `/search` | Public | — | Autocomplete search |
| GET | `/my-school` | Bearer | `SCHOOL_ADMIN` | Owner's school with images, facilities |
| POST | `/my-school/images` | Bearer | `SCHOOL_ADMIN` | Add gallery image (URL in body) |
| DELETE | `/images/:id` | Bearer | `SCHOOL_ADMIN` | Delete gallery image |
| GET | `/:slug` | Public | — | School detail by slug |
| POST | `/` | Bearer | `SCHOOL_ADMIN` | Create school |
| PATCH | `/:id` | Bearer | Owner/Admin | Update school |
| DELETE | `/:id` | Bearer | `ADMIN` | Delete school |

**Listing query params:** `search`, `city`, `board`, `schoolType`, `medium`, `status`, `page`, `limit`, `cursor`

### Admin — `/api/admin`

All routes require `ADMIN` role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Platform statistics (cached 30s) |
| GET | `/schools` | Paginated school moderation list |
| GET | `/users` | Paginated user list |
| GET | `/inquiries` | Paginated cross-school inquiries |
| PATCH | `/schools/:id/approve` | Approve school by ID |
| PATCH | `/schools/:id/reject` | Reject school by ID |
| POST | `/approve` | Approve school (legacy body `schoolId`) |
| POST | `/reject` | Reject school (legacy body) |
| POST | `/add-school` | Admin direct school creation |
| PATCH | `/users/:id/role` | Change user role |
| PATCH | `/users/:id/status` | Enable/disable account |

### Inquiries — `/api/inquiries`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Bearer | `PARENT` | Create inquiry for approved school |
| GET | `/my` | Bearer | `PARENT` | Paginated own inquiries |
| GET | `/school/:schoolId` | Bearer | `SCHOOL_ADMIN`, `ADMIN` | List school inquiries |
| PATCH | `/:id/status` | Bearer | `SCHOOL_ADMIN`, `ADMIN` | Update status |

### Favourites — `/api/favourites`

All routes require `PARENT` role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List favourites |
| POST | `/` | Add favourite (`schoolId` in body) |
| DELETE | `/` | Remove favourite (`schoolId` query param) |

### Parent — `/api/parent`

All routes require `PARENT` role. Richer response shapes for dashboard pages.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile` | Parent profile |
| PATCH | `/profile` | Update parent profile |
| GET | `/favourites` | Paginated favourites with school details |
| POST | `/favourites` | Add favourite |
| DELETE | `/favourites` | Remove favourite (`schoolId` query param) |
| GET | `/inquiries` | Paginated sent inquiries with school details |

> **Note:** `/api/favourites` and `/api/parent/favourites` overlap. The frontend dashboards use `/api/parent/*`; public favourite toggle may use `/api/favourites`.

---

## 13. Dashboard Permissions

### Parent Permissions

| Action | Allowed |
|--------|---------|
| Browse public schools | Yes (no auth) |
| Create inquiry | Yes (`PARENT`) |
| Manage favourites | Yes (`PARENT`) |
| Access school/admin dashboards | No |

### School Admin Permissions

| Action | Allowed |
|--------|---------|
| View/update own school | Yes (ownership check) |
| Manage gallery images | Yes (own school) |
| View/update inquiries for own school | Yes |
| Access admin panel | No |

### Admin Permissions

| Action | Allowed |
|--------|---------|
| Approve/reject schools | Yes |
| List/manage all users | Yes |
| View all inquiries | Yes |
| Add school directly | Yes |
| Delete schools | Yes |
| Disable accounts | Yes |

---

## 14. Environment Variables

Copy `backend/.env.example` to `.env`. Never commit real secrets.

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Recommended | `development` or `production` |
| `PORT` | No (local) | Server port; injected by Render/Railway |
| `DATABASE_URL` | Yes | Neon PostgreSQL URL with `sslmode=require` |
| `JWT_SECRET` | Yes | Signing secret (must match frontend `JWT_SECRET`) |
| `JWT_EXPIRES_IN` | No | Token TTL (default `7d`) |
| `FRONTEND_URL` | Yes (prod) | CORS allowlist; HTTPS, no trailing slash |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `RESEND_API_KEY` | For email | Resend API key (password reset emails) |
| `EMAIL_FROM` | For email | From address for Resend (e.g. `SchoolFinder <noreply@example.com>`) |
| `BCRYPT_ROUNDS` | No | Password hashing cost (default `12`) |
| `TRUST_PROXY` | No | `true` behind reverse proxy |
| `ADMIN_EMAIL` | For seeder | Initial admin email |
| `ADMIN_PASSWORD` | For seeder | Initial admin password |

### Email Configuration Note

Password reset emails are sent via **Resend** (`RESEND_API_KEY`, `EMAIL_FROM`). The `.env.example` still lists SMTP variables, and `validateStartupEnv()` checks SMTP keys — align these in a future cleanup. For production email delivery, configure Resend.

### Setup

```bash
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, FRONTEND_URL, Cloudinary, Resend
```

---

## 15. Local Development Setup

### Prerequisites

- Node.js 18+
- Neon (or local) PostgreSQL database

### Commands

```bash
cd backend
npm install
cp .env.example .env

npx prisma generate
npm run migrate:dev    # create/apply migrations
npm run dev
```

API: [http://localhost:4000](http://localhost:4000)

### Verify

```bash
curl http://localhost:4000/health
# Expect: { "status": "ok", "database": "connected", ... }

npx tsc --noEmit
```

### First admin

```bash
# Set ADMIN_EMAIL and ADMIN_PASSWORD in .env
npm run seed:admin
```

---

## 16. Production Deployment

### Target: Render

Blueprint: `render.yaml`

```yaml
buildCommand: npm ci && npx prisma generate && npm run build
preDeployCommand: npx prisma migrate deploy
startCommand: npm start
healthCheckPath: /health
```

### Railway Alternative

| Setting | Value |
|---------|--------|
| Build | `npm ci && npx prisma generate && npm run build` |
| Pre-deploy | `npx prisma migrate deploy` |
| Start | `npm start` |
| Health check | `/health` |

### Production Environment

| Variable | Production value |
|----------|------------------|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `DATABASE_URL` | Neon URL with SSL |
| `JWT_SECRET` | Strong random secret (64+ bytes); same on frontend |

### Neon Setup

1. Create Neon project and copy connection string with `?sslmode=require`.
2. Run `npx prisma migrate deploy` from backend.
3. Set `DATABASE_URL` on Render only (not Vercel).

### Production Server Behavior

| Feature | Behavior |
|---------|----------|
| Listen | `0.0.0.0` on `PORT` |
| Trust proxy | Enabled in production |
| Startup validation | Warns/exits on missing critical env vars |
| Health | Returns `503` if database unreachable |

---

## 17. Performance Optimizations

### Pagination

- Bounded `limit` with defaults (schools: 12, admin: 20, max: 50)
- Cursor pagination support on school listings

### Optimized Queries

- Explicit `select` objects in `lib/queries/schools.ts`
- Facility counts via `_count` instead of loading relations
- `Promise.all` for parallel findMany + count

### Cache

- In-memory TTL cache on list, detail, and admin stats
- Invalidation on school mutations
- Upgrade path: replace Map with Redis for multi-instance deployments

### Sanitization

- Input sanitization before persistence reduces XSS risk on stored text fields

---

## 18. Security Notes

### Hidden Admin Auth

- No public discovery endpoint for admin login
- `expectedRole: "ADMIN"` required on login
- All `/api/admin/*` routes use global `requireRole("ADMIN")`

### Role Restrictions

- Cross-role login blocked via `expectedRole`
- School admins cannot access other schools' data (ownership checks)
- Parents cannot call admin or school-management endpoints

### Token Security

- Bearer scheme enforced
- Logout blacklists token (in-memory — note multi-instance limitation)
- Password reset tokens stored as SHA-256 hashes, 1-hour expiry

---

## 19. Future Improvements

| Area | Direction |
|------|-----------|
| **Redis caching** | Replace in-memory cache for horizontal scaling |
| **Redis token blacklist** | Shared logout across instances |
| **Unified parent API** | Consolidate `/api/favourites` and `/api/parent/*` |
| **Backend upload route** | Mount Multer + Cloudinary for direct API uploads |
| **Email config cleanup** | Align `.env.example` and startup validation with Resend |
| **WebSockets** | Real-time inquiry notifications |
| **Audit logs** | Immutable admin action trail |

---

## Quick Reference

| Task | Command / Path |
|------|----------------|
| Dev server | `npm run dev` |
| Production build | `npm run build && npm start` |
| Prisma generate | `npm run db:generate` |
| Migrate (dev) | `npm run migrate:dev` |
| Migrate (prod) | `npm run migrate:deploy` |
| Seed admin | `npm run seed:admin` |
| Type check | `npx tsc --noEmit` |
| Health check | `GET /health` |
| Schema | `prisma/schema.prisma` |
| Deploy blueprint | `render.yaml` |

---

## Production Checklist

| Step | Action |
|------|--------|
| 1 | Deploy API to Render with `render.yaml` |
| 2 | Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, Cloudinary, Resend |
| 3 | Confirm `GET /health` returns `database: connected` |
| 4 | Deploy frontend with matching `JWT_SECRET` and `NEXT_PUBLIC_API_URL` |
| 5 | Verify CORS from production frontend origin |
| 6 | Run `npm run seed:admin` or promote user manually |
| 7 | Smoke-test auth, listings, inquiries, moderation |

---

*Last updated: Post-Prisma migration — backend owns schema and all database operations; parent API routes; JWT hardening; in-memory cache; Resend email.*
