# SchoolFinder — Backend Documentation

> **Stack:** Express.js 5 · TypeScript · Prisma 7 · PostgreSQL (Neon) · JWT · Cloudinary  
> **Default port:** `4000` · **Repository path:** `backend/`

This document describes the production-ready SchoolFinder REST API: architecture, authentication, security, data access, deployment, and operational behavior. It reflects security hardening (FIX-16), performance optimizations (FIX-19), and deployment readiness (FIX-20).

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

The SchoolFinder backend is a **stateless REST API** that powers:

- Public school discovery (listings, search, detail)
- Role-separated authentication (parent, school admin, platform admin)
- School registration and moderation workflows
- Parent inquiries and favourites
- Admin platform management (users, schools, inquiries)

The Next.js frontend handles UI, NextAuth sessions, and primary image uploads. The backend enforces business rules, JWT authorization, and database access.

### Express.js API Architecture

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP method + path mapping, middleware chains |
| **Controllers** | Request handling, Prisma operations, response shaping |
| **Middleware** | Auth, roles, validation, security, errors |
| **Lib** | Prisma client, pagination, queries, cache prep, Cloudinary |
| **Validators** | Zod schemas for request bodies |

Entry point: `src/server.ts` — mounts routes, global middleware, health checks, and error handlers.

### Prisma ORM

- **Client output:** `generated/prisma` (Prisma 7 pattern)
- **Schema source of truth:** `frontend/prisma/schema.prisma` (shared Neon database)
- **Backend workflow:** `npx prisma generate` only — schema migrations/push run from the frontend project

### JWT Authentication

- Bearer tokens issued on register/login
- Payload: `{ id, role, email }`
- Validated by `middleware/auth.ts` on protected routes
- Expiration configurable via `JWT_EXPIRES_IN` (default `7d`)

### Role-Based Access Control

| Role | Scope |
|------|--------|
| `PARENT` | Inquiries, favourites, public browsing |
| `SCHOOL_ADMIN` | Own school profile, own school inquiries |
| `ADMIN` | Full moderation panel APIs |

Roles are enforced with `requireRole()` after JWT verification.

---

## 2. Tech Stack

| Technology | Usage |
|------------|--------|
| **Express.js 5** | HTTP server, routing, middleware pipeline |
| **TypeScript** | Type-safe controllers and middleware |
| **Prisma ORM 7** | PostgreSQL access via `@prisma/adapter-pg` + `pg` pool |
| **PostgreSQL (Neon)** | Managed serverless Postgres with SSL |
| **JWT (`jsonwebtoken`)** | API authentication tokens |
| **Zod** | Request body validation |
| **bcryptjs** | Password hashing (`BCRYPT_ROUNDS`, default 12) |
| **Cloudinary** | Image storage utilities (`lib/cloudinary.ts`) |
| **Helmet** | Security headers |
| **express-rate-limit** | Global and auth route rate limiting |
| **Multer** | In-memory upload parsing (`middleware/upload.ts`) |
| **CORS** | Origin-restricted cross-origin requests |

---

## 3. Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma           # Mirror of shared schema (generate client)
├── generated/
│   └── prisma/                 # Prisma 7 generated client
├── render.yaml                 # Render deployment blueprint
├── .env.example                # Environment template
├── src/
│   ├── server.ts               # App bootstrap, routes, health checks
│   ├── config/
│   │   └── production.ts       # Production host, config warnings
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── schools.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── inquiry.controller.ts
│   │   └── favourite.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── schools.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── inquiry.routes.ts
│   │   └── favourite.routes.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification
│   │   ├── roleCheck.ts        # Role gate
│   │   ├── validate.ts         # Zod body validation
│   │   ├── security.ts         # Helmet, CORS, rate limits
│   │   ├── bruteForce.ts       # Login attempt throttling
│   │   ├── upload.ts           # Multer + file validation
│   │   └── errorHandler.ts     # Centralized errors
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── school.validator.ts
│   ├── lib/
│   │   ├── prisma.ts           # Database client + connection pool
│   │   ├── pagination.ts       # Page/limit helpers, response envelope
│   │   ├── cache.ts            # Redis-ready cache abstraction
│   │   ├── queries/schools.ts  # Select objects, search builders
│   │   ├── cloudinary.ts       # Upload/delete helpers
│   │   ├── sanitize.ts         # Request body sanitization
│   │   └── account-status.ts   # Disabled account sentinel
│   ├── scripts/
│   │   └── seed-admin.ts       # First admin user from ADMIN_EMAIL / ADMIN_PASSWORD
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
| `lib/` | Shared infrastructure (DB, pagination, queries, cache, Cloudinary) |
| `utils/` | Small reusable helpers (`AppError`, `asyncHandler`) |
| `config/` | Environment-specific startup behavior |

---

## 4. Authentication Architecture

Authentication is **role-separated**. There is no single generic login endpoint without role context.

### Parent (`PARENT`)

| Frontend route | Backend endpoint |
|----------------|------------------|
| `/register` | `POST /api/auth/register-parent` |
| `/login` | `POST /api/auth/login` with `expectedRole: "PARENT"` (optional but enforced when set) |

Parents receive a JWT on registration or login. Google OAuth is handled on the frontend via NextAuth; backend credentials cover email/password flows.

### School Administrator (`SCHOOL_ADMIN`)

| Frontend route | Backend endpoint |
|----------------|------------------|
| `/school-register` | `POST /api/auth/register-school` |
| `/school-login` | `POST /api/auth/login` with `expectedRole: "SCHOOL_ADMIN"` |

Registration creates a `User` + `School` in a transaction. New schools start with `status: PENDING` until admin approval.

### Platform Administrator (`ADMIN`)

| Frontend route | Backend endpoint |
|----------------|------------------|
| `/admin-login` (hidden) | `POST /api/auth/login` with `expectedRole: "ADMIN"` |

Admin sign-in on the frontend:

1. Calls backend login with `expectedRole: "ADMIN"`.
2. Stores JWT in HTTP-only cookie `sf_admin_token`.
3. Syncs NextAuth session for UI middleware.

### JWT Flow

```
Client → Authorization: Bearer <token>
       → auth middleware verifies signature + expiry
       → req.user = { id, role, email }
       → requireRole(...) if needed
       → controller
```

### Role Validation on Login

`login` accepts optional `expectedRole`:

- `PARENT` — rejects non-parent accounts
- `SCHOOL_ADMIN` — rejects non-school-admin accounts
- `ADMIN` — rejects non-admin accounts

Returns `403 Unauthorized account type` on mismatch.

### Protected APIs

Any route using `auth` middleware requires a valid Bearer token. Role-specific routes add `requireRole(...)`.

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

Base URL: `http://localhost:4000` (development) or your deployed HTTPS origin.

| Prefix | Domain |
|--------|--------|
| `/api/auth` | Registration, login, current user |
| `/api/schools` | Public listings, school CRUD |
| `/api/admin` | Platform administration (ADMIN only) |
| `/api/inquiries` | Parent inquiries, school/admin management |
| `/api/favourites` | Parent favourites |
| `/health` | Liveness + database connectivity |
| `/ready` | Lightweight readiness probe |

### Route Organization

- One router file per domain under `src/routes/`
- Routers mounted in `server.ts` with clear prefixes
- **Route order matters:** `/my-school` is registered before `/:slug` in `schools.routes.ts`

### Modular Controller Design

Controllers are plain async functions:

- Throw `AppError` for expected failures
- Use `asyncHandler` in routes to forward errors to `errorHandler`
- Keep Prisma logic colocated; shared selects live in `lib/queries/`

### Validation Flow

```
Request body
  → sanitizeRequestBody() (strip dangerous keys)
  → Zod safeParse
  → 400 + field errors on failure
  → req.body replaced with parsed data on success
  → controller
```

### Error Handling Flow

```
Controller throws AppError | Zod | Prisma | JWT error
  → asyncHandler catches
  → errorHandler maps to status + message
  → JSON { success: false, message, errors? }
  → stack trace only in development
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

### `auth` — JWT Verification

- Requires `Authorization: Bearer <token>`
- Validates JWT structure (three segments)
- Attaches `req.user` on success
- Maps expiry and malformed tokens to `401`

### `requireRole` — Role Gate

- Factory: `requireRole("ADMIN")` or `requireRole("SCHOOL_ADMIN", "ADMIN")`
- Returns `403` if role not in allowed list

### `validate` — Zod Validation

- Runs before controller on mutating routes
- Sanitizes then parses `req.body`
- Short-circuits with `400` and field-level `errors`

### `security` — Global Hardening

- **Helmet:** CSP, frame denial, XSS protection, hide `X-Powered-By`
- **CORS:** Allowlist from `FRONTEND_URL` (comma-separated for multiple origins)
- **Rate limiting:** General API limiter on all routes
- **Auth rate limiting:** Stricter limit on `/api/auth/*`
- **Trust proxy:** Enabled in production (or `TRUST_PROXY=true`) for correct client IP behind Render/Railway

### `bruteForce` — Login Protection

- Tracks failures by `IP + email`
- Blocks after 5 failures within 15 minutes
- Returns `429` when blocked
- Cleared on successful login

### `errorHandler` — Centralized Errors

- Registered last in `server.ts`
- Handles `AppError`, Zod, Prisma, JWT, syntax errors
- Production responses exclude stack traces

---

## 7. Validation Architecture

### Zod Validators

| File | Schemas |
|------|---------|
| `validators/auth.validator.ts` | `registerParentSchema`, `registerSchoolSchema`, `loginSchema` |
| `validators/school.validator.ts` | `createSchoolBodySchema`, `updateSchoolBodySchema` |

### Request Sanitization

`lib/sanitize.ts` strips prototype pollution keys and normalizes string fields before Zod parsing.

### Payload Validation

- Invalid bodies return `400` with `{ success: false, message: "Validation failed", errors: { field: "..." } }`
- Valid bodies are typed via Zod inference in controllers

### Safe Error Responses

Validation failures never leak internal schema details beyond field messages. Unexpected validation exceptions return a generic `400`.

---

## 8. Security Architecture

### Helmet Configuration

Configured in `middleware/security.ts`:

- Content Security Policy for API responses
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `crossOriginResourcePolicy: cross-origin` for image delivery

### Rate Limiting

| Limiter | Scope | Limit |
|---------|-------|-------|
| `generalRateLimiter` | All routes | 100 requests / 15 min / IP |
| `authRateLimiter` | `/api/auth/*` | 10 requests / 15 min / IP |

### Brute-Force Protection

In-memory tracker on auth routes (upgradeable to Redis). Blocks repeated failed logins per IP+email combination.

### JWT Validation

- Secret required via `JWT_SECRET` (server fails configuration check if missing at verify time)
- Malformed, expired, and not-yet-valid tokens return distinct `401` messages
- Payload must include `id`, `role`, and `email`

### CORS Restrictions

- **Development:** defaults to `http://localhost:3000` if `FRONTEND_URL` unset
- **Production:** empty allowlist if `FRONTEND_URL` unset (requests with `Origin` header rejected)
- Supports multiple origins via comma-separated `FRONTEND_URL`

### Upload Restrictions

See [Upload System](#9-upload-system). Backend validates MIME, extension, magic bytes, and 5MB limit when Multer middleware is used.

---

## 9. Upload System

### Cloudinary Integration

`lib/cloudinary.ts` provides:

- `uploadImage(buffer, folder, mime)` — uploads to `school-platform/{logos|gallery|profiles}`
- Automatic optimization: `quality: auto:good`, `fetch_format: auto`
- `deleteImage(publicId)` — cleanup helper

### Upload Middleware

`middleware/upload.ts`:

| Export | Purpose |
|--------|---------|
| `uploadMemory` | Multer memory storage, 5MB limit |
| `singleImageUpload` | Single `file` field handler |
| `validateUploadedFile` | Magic-byte + extension validation |
| `detectImageMime` | JPEG, PNG, WebP detection |

### MIME and Size Limits

| Rule | Value |
|------|--------|
| Allowed types | JPEG, PNG, WebP |
| Max size | 5 MB |
| Blocked | SVG, PDF, executables, scripts, HTML, etc. |

### Production Note

Primary user-facing uploads are handled by the **Next.js** route `POST /api/upload` on the frontend (same validation rules, server-side Cloudinary credentials). The backend upload layer is available for direct API integration or future endpoints.

### Optimization Flow

```
Buffer → magic-byte detect → Cloudinary upload_stream
      → optimized delivery URL returned to client
      → URL persisted on School / User via Prisma
```

---

## 10. Database Architecture

### Prisma Schema Usage

Shared models (defined in frontend schema, generated in backend):

| Model | Purpose |
|-------|---------|
| `User` | Accounts with `Role` enum; optional `resetToken` and `resetTokenExpiry` for password reset |
| `School` | Listings with `SchoolStatus` workflow |
| `SchoolImage` | Gallery images |
| `Facility` / `SchoolFacility` | Many-to-many facilities |
| `Inquiry` | Parent → school messages |
| `Favourite` | Parent saved schools |
| `Account`, `Session`, `VerificationToken` | NextAuth compatibility |

### Neon PostgreSQL

- Connection via `DATABASE_URL` with `?sslmode=require`
- Production pool uses SSL (`lib/prisma.ts`)
- Connection pool limits: 10 (production), 5 (development)

### Relationships (Key)

```
User 1──* School (owner)
User — resetToken, resetTokenExpiry (optional; password reset flow)
School 1──* Inquiry
User (parent) 1──* Inquiry
User 1──* Favourite *──1 School
School *──* Facility (via SchoolFacility)
School 1──* SchoolImage
```

### Pagination Strategy

`lib/pagination.ts`:

| Context | Default `limit` | Max |
|---------|-----------------|-----|
| Public schools | 12 | 50 |
| Admin tables | 20 | 50 |

Standard response envelope:

```json
{
  "data": [],
  "schools": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 0,
    "totalPages": 0
  }
}
```

Legacy alias keys (`schools`, `users`, `inquiries`) preserve backward compatibility.

### Query Optimization

`lib/queries/schools.ts`:

- `schoolListSelect` — card fields + facility count
- `schoolDetailSelect` — detail page fields + minimal relations
- `adminSchoolListSelect` — moderation list fields
- `buildSchoolSearchWhere()` — `OR` on name, city, state
- `mapSchoolListItem()` — maps `_count` to `facilitiesCount`

Controllers prefer `select` over heavy `include` to avoid overfetching.

### Cache Preparation

`lib/cache.ts` — `withCache()` is pass-through today; `buildCacheKey()` ready for Redis.

---

## 11. Error Handling System

### Centralized Error Handler

`middleware/errorHandler.ts` maps errors to HTTP status codes:

| Source | Typical status |
|--------|----------------|
| `AppError` | Custom (4xx/5xx) |
| `ZodError` | 400 |
| Prisma `P2002` | 409 Conflict |
| Prisma `P2025` | 404 Not found |
| JWT errors | 401 |
| Unknown | 500 |

### `asyncHandler`

Wraps async route handlers and forwards rejections to `next(err)`:

```typescript
router.get("/", asyncHandler(getSchools));
```

### Prisma Error Handling

Known error codes translated to user-safe messages. Other Prisma errors return generic `400`/`500` without exposing query internals.

### Validation Errors

Returned as `{ success: false, message: "Validation failed", errors: { field: "..." } }`.

### Production-Safe Responses

- Stack traces included **only** when `NODE_ENV=development`
- 5xx errors logged server-side; client receives generic message
- 4xx client errors logged only in development (except 5xx)

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
| POST | `/forgot-password` | Public | Generate hashed reset token; send reset email via Nodemailer SMTP |
| POST | `/reset-password` | Public | Verify token, update password, clear reset token fields |
| GET | `/me` | Bearer | Current user profile |

### Schools — `/api/schools`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Public | — | Paginated listing (search, filters, `status`) |
| GET | `/:slug` | Public | — | School detail by slug |
| GET | `/my-school` | Bearer | `SCHOOL_ADMIN` | Authenticated owner's school |
| POST | `/` | Bearer | `SCHOOL_ADMIN` | Create school |
| PATCH | `/:id` | Bearer | Owner/Admin | Update school |
| DELETE | `/:id` | Bearer | `ADMIN` | Delete school |

**Listing query params:** `search`, `city`, `board`, `schoolType`, `medium`, `status`, `page`, `limit`

### Admin — `/api/admin`

All routes require `ADMIN` role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Platform statistics |
| GET | `/schools` | Paginated school moderation list |
| GET | `/users` | Paginated user list |
| GET | `/inquiries` | Paginated cross-school inquiries |
| PATCH | `/schools/:id/approve` | Approve school by ID |
| PATCH | `/schools/:id/reject` | Reject school by ID |
| POST | `/approve` | Approve school (body) |
| POST | `/reject` | Reject school (body) |
| POST | `/add-school` | Admin direct school creation |
| PATCH | `/users/:id/role` | Change user role |
| PATCH | `/users/:id/status` | Enable/disable account |

### Inquiries — `/api/inquiries`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Bearer | `PARENT` | Create inquiry for approved school |
| GET | `/my` | Bearer | `PARENT` | Paginated list of inquiries sent by the logged-in parent (school name, city, logo) |
| GET | `/school/:schoolId` | Bearer | `SCHOOL_ADMIN`, `ADMIN` | List inquiries (ownership enforced for school admin) |
| PATCH | `/:id/status` | Bearer | `SCHOOL_ADMIN`, `ADMIN` | Update status (`NEW`, `CONTACTED`, `CLOSED`) |

### Favourites — `/api/favourites`

All routes require `PARENT` role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List favourites |
| POST | `/` | Add favourite (`schoolId` in body) |
| DELETE | `/` | Remove favourite (`schoolId` query param) |

---

## 13. Dashboard Permissions

Permissions below map to frontend dashboards. The backend enforces them via JWT + `requireRole`.

### Parent Permissions

| Action | Allowed |
|--------|---------|
| Browse public schools | Yes (no auth) |
| Create inquiry | Yes (`PARENT`) |
| Manage favourites | Yes (`PARENT`) |
| Access school/admin dashboards | No |
| Moderate schools | No |

### School Admin Permissions

| Action | Allowed |
|--------|---------|
| View/update own school | Yes (ownership check on mutations) |
| View inquiries for own school | Yes |
| Update inquiry status (own school) | Yes |
| Access admin panel | No |
| Delete arbitrary schools | No |

### Admin Permissions

| Action | Allowed |
|--------|---------|
| Approve/reject schools | Yes |
| List/manage all users | Yes |
| View all inquiries | Yes |
| Add school directly | Yes |
| Delete schools | Yes |
| Disable accounts (`phone = "__DISABLED__"`) | Yes |

---

## 14. Environment Variables

Copy `backend/.env.example` to `.env`. Never commit real secrets.

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Recommended | `development` or `production` |
| `PORT` | No (local) | Server port; injected by Render/Railway in production |
| `DATABASE_URL` | Yes | Neon PostgreSQL URL with `sslmode=require` |
| `JWT_SECRET` | Yes | Signing secret for API tokens |
| `JWT_EXPIRES_IN` | No | Token TTL (default `7d`) |
| `FRONTEND_URL` | Yes (prod) | CORS allowlist; HTTPS, no trailing slash |
| `CLOUDINARY_CLOUD_NAME` | For uploads* | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads* | Cloudinary API secret |
| `BCRYPT_ROUNDS` | No | Password hashing cost (default `12`) |
| `TRUST_PROXY` | No | `true` behind reverse proxy (auto in production) |
| `ADMIN_EMAIL` | For seeder† | Email for the initial admin account (`npm run seed:admin`) |
| `ADMIN_PASSWORD` | For seeder† | Password for the initial admin account (one-time seeder) |
| `SMTP_HOST` | For reset mail‡ | SMTP server hostname (password reset emails) |
| `SMTP_PORT` | For reset mail‡ | SMTP port (e.g. `587`) |
| `SMTP_USER` | For reset mail‡ | SMTP authentication username |
| `SMTP_PASS` | For reset mail‡ | SMTP authentication password or app password |
| `SMTP_FROM` | For reset mail‡ | From address for outbound mail (e.g. `SchoolFinder <noreply@example.com>`) |

\* Required when using Cloudinary upload utilities.  
† Required when running the admin seeder (`npm run seed:admin`). Remove or rotate after first use.  
‡ Required for forgot-password / reset-password email delivery.

### Setup Instructions

```bash
cp .env.example .env
# Edit .env with your Neon, JWT, and Cloudinary values
```

**Production:** set all variables in the Render/Railway dashboard. Use `generateValue` or a secrets manager for `JWT_SECRET`.

---

## 15. Local Development Setup

### Prerequisites

- Node.js 18+
- Neon (or local) PostgreSQL database
- Frontend project for schema push (shared DB)

### Commands

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Generate Prisma client (schema pushed from frontend)
npx prisma generate

# 5. Start development server
npm run dev
```

API available at [http://localhost:4000](http://localhost:4000).

### Database Setup

Schema is owned by the frontend:

```bash
# From frontend/
npx prisma db push
npx prisma generate

# From backend/
npx prisma generate
```

Do **not** run conflicting migrations from both projects.

### Verify

```bash
curl http://localhost:4000/health
# Expect: { "status": "ok", "database": "connected", ... }
```

---

## 16. Production Deployment

### Target: Render

Blueprint: `render.yaml`

```yaml
buildCommand: npm ci && npx prisma generate && npm run build
startCommand: npm start
healthCheckPath: /health
```

### Railway Alternative

| Setting | Value |
|---------|--------|
| Build | `npm ci && npx prisma generate && npm run build` |
| Start | `npm start` |
| Health check | `/health` |

Use the same environment variables as `.env.example`.

### Production Environment

| Variable | Production value |
|----------|------------------|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `DATABASE_URL` | Neon URL with SSL |
| `JWT_SECRET` | Strong random secret (64+ bytes) |

### Neon Setup

1. Create a Neon project and database.
2. Copy connection string with `?sslmode=require`.
3. Run `npx prisma db push` from **frontend** once.
4. Set identical `DATABASE_URL` on Render and Vercel.

### Production Build

```bash
npm run build    # compiles TypeScript to dist/
npm start        # runs dist/server.js (prestart builds)
```

### SSL Requirements

- Public API must be **HTTPS** (Render/Railway provide TLS termination).
- Frontend `NEXT_PUBLIC_API_URL` must use `https://`.
- CORS `FRONTEND_URL` must match the Vercel domain exactly.

### Production Server Behavior

| Feature | Behavior |
|---------|----------|
| Listen | `0.0.0.0` on `PORT` |
| Trust proxy | Enabled in production |
| Config warnings | Logged for missing `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` |
| Health | Returns `503` if database unreachable |

---

## 17. Performance Optimizations

### Pagination

- Bounded `limit` with defaults (schools: 12, admin: 20, max: 50)
- `skip`/`take` Prisma queries — no unbounded list endpoints

### Optimized Queries

- Explicit `select` objects in `lib/queries/schools.ts`
- Facility counts via `_count` instead of loading relations
- Admin list endpoints use minimal field selections

### Controlled Includes

- School detail uses targeted `select` for images, facilities, and owner name only
- Avoids loading unused nested graphs

### Payload Minimization

- `paginatedResponse()` returns `data` + `pagination` (+ legacy alias)
- List mappers strip internal Prisma fields (`_count` → `facilitiesCount`)

### Cache Layer (Prepared)

`withCache()` ready for Redis; listing endpoints already compute deterministic cache keys.

---

## 18. Security Notes

### Hidden Admin Auth

- No public discovery endpoint for admin login
- `expectedRole: "ADMIN"` required on login for admin panel JWT
- Admin routes mounted under `/api/admin` with global `requireRole("ADMIN")`

### Role Restrictions

- Cross-role login blocked via `expectedRole`
- School admins cannot access other schools' inquiries (ownership check)
- Parents cannot call admin or school-management endpoints

### Protected APIs

All non-public routes require valid Bearer JWT. Role middleware applied per router or route.

### Upload Security

- Magic-byte validation prevents MIME spoofing
- Extension blocklist for dangerous file types
- 5MB hard limit at Multer and validation layers

### Token Validation

- Bearer scheme enforced
- Three-part JWT structure checked before verify
- Expired tokens return explicit `401` message

### Account Disable

Disabled users have `phone = "__DISABLED__"` (no schema migration). Login returns `403` for disabled accounts.

---

## 19. Future Improvements

| Area | Direction |
|------|-----------|
| **Redis caching** | Enable `withCache()` for school listings and stats |
| **WebSockets** | Real-time inquiry notifications for school admins |
| **Inquiry notifications** | Email or SMS alerts on inquiry status and school approval events |
| **Audit logs** | Immutable admin action trail |
| **Analytics** | Aggregated inquiry and search metrics |
| **Microservices readiness** | Split auth, schools, and admin into services behind API gateway |

---

## Quick Reference

| Task | Command / Path |
|------|----------------|
| Dev server | `npm run dev` |
| Production build | `npm run build && npm start` |
| Prisma generate | `npx prisma generate` |
| Health check | `GET /health` |
| Env template | `.env.example` |
| Deploy blueprint | `render.yaml` |
| Pagination helpers | `src/lib/pagination.ts` |
| School query selects | `src/lib/queries/schools.ts` |

---

## Production Checklist

| Step | Action |
|------|--------|
| 1 | Deploy API to Render/Railway with `render.yaml` or equivalent |
| 2 | Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, Cloudinary vars |
| 3 | Confirm `GET /health` returns `database: connected` |
| 4 | Deploy frontend to Vercel with `NEXT_PUBLIC_API_URL` pointing to API |
| 5 | Verify CORS from production frontend origin |
| 6 | Configure Google OAuth and admin user (`npm run seed:admin` or manual role update) |
| 7 | Smoke-test auth, listings, inquiries, and moderation |

---

*Last updated: production documentation pass (FIX-22) — reflects Express API architecture, split auth flows, security middleware, performance patterns, and Render deployment.*
