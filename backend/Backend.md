# SchoolFinder — Backend Documentation

> Last updated: June 19, 2026

> **Stack:** Express.js 5 · TypeScript · Prisma 5 · PostgreSQL (Neon) · JWT · Brevo · Fast2SMS  
> **Default port:** `4000` · **Repository path:** `backend/`  
> **Schema owner:** `backend/prisma/schema.prisma`

The backend is a stateless REST API and the **single source of truth** for all database operations. The Next.js frontend handles UI, NextAuth sessions, and Cloudinary uploads; the backend stores image URLs only.

**Entry point:** `src/server.ts`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Request Lifecycle](#4-request-lifecycle)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Endpoints](#6-api-endpoints)
7. [Controllers](#7-controllers)
8. [Middleware](#8-middleware)
9. [Validation Layer](#9-validation-layer)
10. [Database Schema](#10-database-schema)
11. [Lib Modules](#11-lib-modules)
12. [Caching](#12-caching)
13. [Error Handling](#13-error-handling)
14. [Logging](#14-logging)
15. [Background Jobs](#15-background-jobs)
16. [File Storage](#16-file-storage)
17. [Environment Variables](#17-environment-variables)
18. [Deployment](#18-deployment)

---

## 1. Architecture Overview

```
Client (Next.js frontend)
    │  Authorization: Bearer <JWT>
    │  HTTPS
    ▼
Express API (port 4000)
    ├── Security (Helmet, CORS, rate limits)
    ├── Auth middleware (JWT verify, role check)
    ├── Validation (Zod + sanitize)
    ├── Controllers
    └── Lib (cache, mailer, OTP, pagination)
            │
            ▼
    PostgreSQL (Neon) via Prisma + pg adapter
```

| Responsibility | Detail |
|----------------|--------|
| Public discovery | School list, search, detail by slug, cities |
| Auth | JWT (HS256), role-separated login, email OTP reset, phone OTP (SMS) |
| Parent | Profile, favourites, inquiries |
| School admin | Own school CRUD (scalar + related models), gallery URLs, inquiry status |
| Platform admin | Moderation, users, stats, direct school/parent/admin creation, user delete, school visibility toggle |

---

## 2. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 5.2 | HTTP API |
| TypeScript | 6.0 | Type safety |
| Prisma | 5.22 | ORM → client in `generated/prisma` |
| PostgreSQL | — | Neon via `@prisma/adapter-pg` + `pg` |
| JWT | jsonwebtoken 9.0 | API auth (HS256, issuer `schoolfinder-api`) |
| Zod | 4.4 | Request validation |
| bcryptjs | 3.0 | Password hashing |
| Brevo | HTTPS API (raw `https` module) | Password reset OTP email (`BREVO_API_KEY`) |
| Fast2SMS | HTTPS API | Phone OTP SMS (`FAST2SMS_API_KEY`) |
| Helmet | 8.2 | Security headers |
| express-rate-limit | 8.5 | Rate limiting |
| compression | 1.8 | Response gzip |

**No background job runner, no file upload middleware, no structured logger.**

> **Cleanup note (June 2026):** Removed unused dependencies `@getbrevo/brevo`, `axios`, and `resend` from `package.json`. The mailer was already calling the Brevo API via Node's built-in `https` module, so none of these were needed. `getListenHost()` (unused, server hardcodes `"0.0.0.0"`) was also removed from `config/production.ts`.

---

## 3. Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Single source of truth for DB schema
│   └── migrations/
├── generated/prisma/           # Generated Prisma client (gitignored)
├── src/
│   ├── server.ts               # Entry point, route mounts, health checks
│   ├── config/
│   │   └── production.ts       # Startup env validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── schools.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── inquiry.routes.ts
│   │   ├── favourite.routes.ts  # Legacy — deprecation header
│   │   └── parent.routes.ts     # Preferred parent API
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── schools.controller.ts   # Updated: transaction-based sync helpers
│   │   ├── admin.controller.ts     # Updated: deleteUserDirect, toggleSchoolVisibility
│   │   ├── inquiry.controller.ts
│   │   ├── favourite.controller.ts
│   │   └── parent.controller.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification + blacklist
│   │   ├── roleCheck.ts        # requireRole() + requireAdminLevel() + blockIfSuperAdminTarget()
│   │   ├── security.ts         # Helmet, CORS, rate limiters
│   │   ├── validate.ts         # Zod validation + sanitize
│   │   ├── bruteForce.ts       # Login throttling
│   │   └── errorHandler.ts     # Global error pipeline
│   ├── validators/
│   │   ├── auth.validator.ts   # Updated: PARENT→SCHOOL_ADMIN blocked; isSuperAdmin stripped
│   │   └── school.validator.ts # Updated: all 22-section fields + nested schemas
│   ├── lib/
│   │   ├── prisma.ts           # DB client + SSL pool
│   │   ├── cache.ts            # In-memory TTL cache
│   │   ├── mailer.ts           # Brevo OTP email (raw https)
│   │   ├── otp.ts              # OTP generate/verify + Fast2SMS
│   │   ├── tokenBlacklist.ts   # JWT jti blacklist
│   │   ├── favourites.ts       # Shared favourite logic
│   │   ├── pagination.ts       # Page/limit helpers
│   │   ├── queries/schools.ts  # School selects and filters; isVisible filter added
│   │   ├── sanitize.ts         # Input sanitization
│   │   └── account-status.ts   # Disabled account sentinel
│   ├── utils/
│   │   ├── AppError.ts         # Typed error factory
│   │   └── asyncHandler.ts     # Async route wrapper
│   └── scripts/
│       ├── seed-admin.ts       # Initial admin seeder
│       └── seed-super-admin.ts # One-time super admin flag setter
├── render.yaml                 # Render deployment blueprint
├── .env.example
└── package.json
```

---

## 4. Request Lifecycle

```
HTTP Request
    │
    ▼
applySecurityMiddleware()     Helmet CSP, CORS, method guard
    │
    ▼
compression + express.json    2MB body limit
    │
    ▼
generalRateLimiter            100 req / 15 min / IP
    │
    ▼
Route-specific middleware     auth, requireRole, requireAdminLevel, validate, rate limiters
    │
    ▼
Controller handler            Business logic via asyncHandler
    │
    ├─ Success → JSON response
    └─ Error → errorHandler → standardized envelope
```

**Global error pipeline:** `notFoundHandler` (404) → `errorHandler` (AppError, Zod, Prisma, JWT errors).

**Startup:** `validateStartupEnv()` runs before `app.listen()`. Missing required vars exit process in production.

---

## 5. Authentication & Authorization

### JWT Configuration

| Setting | Value |
|---------|--------|
| Algorithm | HS256 |
| Issuer | `schoolfinder-api` |
| Secret | `JWT_SECRET` (must match frontend) |
| Expiry | `JWT_EXPIRES_IN` (default `7d`) |
| Payload | `id`, `role`, `email`, `jti` (UUID per token), `adminAccessLevel` (ADMIN role only), `isSuperAdmin` (ADMIN role only) |
| Header | `Authorization: Bearer <token>` |
| Logout | `jti` added to in-memory blacklist |

> `adminAccessLevel` and `isSuperAdmin` are included in the JWT payload at login for `ADMIN` role users only (`null`/`false` for PARENT/SCHOOL_ADMIN). Frontend reads these to gate UI elements without extra API calls. **Backend always re-checks DB for super admin status — JWT value is for UI convenience only.**

### Auth Flows

| Flow | Endpoint | Notes |
|------|----------|-------|
| Register parent | `POST /api/auth/register-parent` | Returns JWT |
| Register school | `POST /api/auth/register-school` | User + `PENDING` school, returns JWT |
| Login | `POST /api/auth/login` | Optional `expectedRole`; brute-force guard; includes `adminAccessLevel` + `isSuperAdmin` in JWT for ADMIN |
| Logout | `POST /api/auth/logout` | Blacklists `jti` |
| Forgot password | `POST /api/auth/forgot-password` | Email OTP via Brevo; generic 200 on no match |
| Verify reset OTP | `POST /api/auth/verify-reset-otp` | Sets `otpVerified` flag |
| Reset password | `POST /api/auth/reset-password` | Requires prior OTP verification |
| Send phone OTP | `POST /api/auth/send-otp` | Fast2SMS; **backend ready, frontend integration pending** |
| Verify phone OTP | `POST /api/auth/verify-otp` | Returns JWT; **backend ready, frontend integration pending** |
| Google sync | `POST /api/auth/google-sync` | Upsert PARENT user |
| Profile | `GET/PATCH /api/auth/me` | Bearer required |

### Role Enforcement

Roles: `PARENT` · `SCHOOL_ADMIN` · `ADMIN`

Applied via `auth` middleware + `requireRole()` on protected routes.

Admin-level mutations are further gated by `requireAdminLevel()` — see [Middleware](#8-middleware) and the route map below.

### Super Admin

- Exactly **one** super admin account per system; created only via `seed-super-admin.ts` — never via the add-admin API.
- `User.isSuperAdmin Boolean @default(false)` — enforced unique by a Postgres partial index (`WHERE "isSuperAdmin" = true`).
- `addAdminSchema` and `addAdminDirect` controller explicitly strip/reject any `isSuperAdmin` field in request body.
- `blockIfSuperAdminTarget(targetUserId)` guard (in `roleCheck.ts`) returns `403` when any mutation targets the super admin — used in `deleteUserDirect`, `updateUserRole`, `updateUserStatus`, and access-level changes. Backend re-checks DB; JWT `isSuperAdmin` is never trusted for enforcement.
- Super admin's actions are audit-logged like all other admins.

### Account Disable

Disabled users have `phone = "__DISABLED__"` (`lib/account-status.ts`). Login returns 403. The disabled-check is applied to **all roles** in the `login` controller — not just PARENT. Bug fix (June 2026): confirmed `updateUserStatus` correctly sets the sentinel in DB and `login` now checks it across all role branches.

### Role Transition Rules

| Transition | Allowed | Enforcement |
|---|---|---|
| `SCHOOL_ADMIN → PARENT` | ❌ Blocked | Validator + controller |
| `PARENT → SCHOOL_ADMIN` | ❌ Blocked | Validator + controller |
| Any → Super Admin target | ❌ Blocked | `blockIfSuperAdminTarget` guard |

### Admin Access Level Route Map

All routes below already require `requireRole(ADMIN)`. `requireAdminLevel` is applied as an additional guard:

| Minimum Level | Routes |
|---|---|
| `READ_ONLY` | `GET /stats`, `GET /schools`, `GET /users`, `GET /inquiries`, `GET /check-owner` |
| `READ_WRITE` | `PATCH /schools/:id/approve`, `PATCH /schools/:id/reject`, `POST /add-school`, `POST /add-parent`, `PATCH /schools/:id/visibility` |
| `FULL_ACCESS` | `PATCH /schools/:id` (edit), `DELETE /schools/:id`, `DELETE /users/:id`, `PATCH /users/:id/role`, `PATCH /users/:id/status`, `POST /add-admin` |

> Frontend gating is UX-only — `requireAdminLevel` middleware is the actual enforcement.

---

## 6. API Endpoints

### Health (no prefix)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | DB ping, `blacklistSize`; 503 if DB down |
| GET | `/ready` | `{ ready: true }` |

### `/api/auth`

| Method | Path | Rate Limit | Handler |
|--------|------|------------|---------|
| POST | `/register-parent` | auth + bruteForce | `registerParent` |
| POST | `/register-school` | auth + bruteForce | `registerSchool` |
| POST | `/login` | auth + bruteForce | `login` |
| POST | `/forgot-password` | forgotPassword (3/h) | `forgotPassword` |
| POST | `/verify-reset-otp` | resetPassword (5/h) | `verifyResetOtp` |
| POST | `/send-otp` | otp (3/10min) | `sendOtp` — phone OTP, frontend integration pending |
| POST | `/verify-otp` | auth | `verifyOtp` — phone OTP, frontend integration pending |
| POST | `/reset-password` | resetPassword (5/h) | `resetPassword` |
| POST | `/logout` | auth | `logout` |
| GET | `/me` | auth | `getMe` |
| PATCH | `/me` | auth | `updateMe` |
| POST | `/google-sync` | auth | `syncGoogleUser` |

### `/api/schools`

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/` | Public | `getSchools` — filters: city, board, schoolType, medium, search, status; always includes `isVisible: true` for public calls |
| GET | `/search` | Public | `searchSchools` — no frontend caller yet, kept for future search feature |
| GET | `/cities` | Public | `getCities` — distinct approved **and visible** cities; accepts optional `?state=` (cached, cache key varies by state) |
| GET | `/my-school` | SCHOOL_ADMIN | `getMySchool` — includes all related models |
| POST | `/my-school/images` | SCHOOL_ADMIN | `addSchoolImage` — JSON `{ url, caption?, category? }` |
| DELETE | `/images/:id` | SCHOOL_ADMIN | `deleteSchoolImage` |
| GET | `/:slug` | Public | `getSchool` — cached detail; only serves schools where `isVisible: true` |
| POST | `/` | SCHOOL_ADMIN | `createSchool` — **superseded by register-school** |
| PATCH | `/:id` | auth | `updateSchool` — owner or ADMIN; runs in Prisma transaction |
| DELETE | `/:id` | ADMIN | `deleteSchool` |

### `/api/admin` (all routes: ADMIN + `requireAdminLevel` per route)

| Method | Path | Min Level | Handler |
|--------|------|-----------|---------|
| GET | `/stats` | READ_ONLY | `getStats` |
| GET | `/schools` | READ_ONLY | `getAdminSchools` — paginated; query: `page`, `limit`, `status`, `search`, `state`, `city`; returns all schools regardless of `isVisible` |
| GET | `/check-owner` | READ_ONLY | `checkOwnerEmail` — query: `email`, optional `role` (e.g. `?role=PARENT`) |
| GET | `/users` | READ_ONLY | `getAdminUsers` — paginated; query: `role` (required: PARENT \| SCHOOL_ADMIN \| ADMIN), `search`, `page`, `limit` |
| GET | `/inquiries` | READ_ONLY | `getAdminInquiries` — paginated; optional `?schoolId=` to filter per school |
| PATCH | `/schools/:id/approve` | READ_WRITE | `approveSchoolById` |
| PATCH | `/schools/:id/reject` | READ_WRITE | `rejectSchoolById` |
| PATCH | `/schools/:id/visibility` | READ_WRITE | `toggleSchoolVisibility` — flips `isVisible`, invalidates cache, writes audit log |
| POST | `/approve` | READ_WRITE | `approveSchool` — **legacy**, delegates to PATCH |
| POST | `/reject` | READ_WRITE | `rejectSchool` — **legacy**, delegates to PATCH |
| POST | `/add-school` | READ_WRITE | `addSchoolDirect` — creates APPROVED school |
| POST | `/add-parent` | READ_WRITE | `addParentDirect` — creates PARENT user directly |
| POST | `/add-admin` | FULL_ACCESS | `addAdminDirect` — creates ADMIN user with chosen `adminAccessLevel`; `isSuperAdmin` field stripped/rejected |
| PATCH | `/schools/:id` | FULL_ACCESS | proxied via frontend BFF; handled by `updateSchool` in `schools.controller.ts` |
| DELETE | `/schools/:id` | FULL_ACCESS | proxied via frontend BFF; handled by `deleteSchool` in `schools.controller.ts` |
| DELETE | `/users/:id` | FULL_ACCESS | `deleteUserDirect` — blocks super admin target; cascades School for SCHOOL_ADMIN; writes audit log |
| PATCH | `/users/:id/role` | FULL_ACCESS | `updateUserRole` — both SCHOOL_ADMIN↔PARENT transitions blocked; super admin target blocked |
| PATCH | `/users/:id/status` | FULL_ACCESS | `updateUserStatus` — super admin target blocked |

### `/api/inquiries`

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| POST | `/` | PARENT | `createInquiry` |
| GET | `/my` | PARENT | `getMyInquiries` |
| GET | `/school/:schoolId` | SCHOOL_ADMIN, ADMIN | `getSchoolInquiries` |
| PATCH | `/:id/status` | SCHOOL_ADMIN, ADMIN | `updateInquiryStatus` |

### `/api/parent` (preferred)

Router-level: `auth` + `requireRole(PARENT)`.

| Method | Path | Handler |
|--------|------|---------|
| GET | `/profile` | `getParentProfile` |
| PATCH | `/profile` | `updateParentProfile` |
| GET | `/favourites` | `getParentFavourites` |
| POST | `/favourites` | `addParentFavourite` |
| DELETE | `/favourites` | `removeParentFavourite` |
| GET | `/inquiries` | `getParentInquiries` — **frontend uses `/api/inquiries/my` instead** |

### `/api/favourites` (legacy)

Router-level: `auth` + `requireRole(PARENT)`. Sets `Deprecation: Use /api/parent/favourites instead` header.

| Method | Path | Handler |
|--------|------|---------|
| GET | `/` | `getFavourites` |
| POST | `/` | `addFavourite` |
| DELETE | `/` | `removeFavourite` |

---

## 7. Controllers

| Controller | Handlers | Responsibility |
|------------|----------|----------------|
| `auth.controller.ts` | 12 | Registration, login (includes `adminAccessLevel` + `isSuperAdmin` in JWT for ADMIN), OTP reset, phone OTP, logout, profile, Google sync |
| `schools.controller.ts` | 10 | Public list/search/detail (filtered by `isVisible`), school admin CRUD, image URLs, admin delete/edit |
| `admin.controller.ts` | 17 | Stats, moderation, user management, direct add-school/parent/admin, owner check, school/inquiry filtering, `deleteUserDirect`, `toggleSchoolVisibility` |
| `inquiry.controller.ts` | 4 | Create, list (parent/school), status updates |
| `parent.controller.ts` | 6 | Profile, favourites (rich shape), inquiries |
| `favourite.controller.ts` | 3 | Legacy favourites with deprecation header |

No separate repository layer — controllers call Prisma directly via `lib/queries/schools.ts` for complex selects.

### `schools.controller.ts` — Sync Helper Pattern

`updateSchool` runs inside a **`prisma.$transaction`** and delegates related-model writes to private sync helpers. Each helper performs a delete-not-in-list + upsert:

| Helper | Models touched | Keyed by |
|--------|---------------|----------|
| `syncBoardResults` | `BoardResult` | `id` (optional on create) |
| `syncScholarships` | `Scholarship` | `id` |
| `syncFAQs` | `SchoolFAQ` | `id` |
| `syncDownloads` | `SchoolDownload` | `id` |
| `syncGalleryImages` | `SchoolImage` | `id` |
| `syncCustomFields` | `SchoolCustomField` | `id`; optional `section` filter |

Each array is only synced if present in the request body (`!== undefined`), allowing partial section updates without wiping other relations.

`extractScalarFields()` strips relation arrays before passing data to `school.update()` to avoid Prisma type errors.

### `admin.controller.ts` — Key Handler Notes

| Handler | Notes |
|---------|-------|
| `getAdminSchools` | Accepts `state` + `city` query params; returns schools regardless of `isVisible` (admin sees all) |
| `getAdminUsers` | Requires `role` query param (PARENT \| SCHOOL_ADMIN \| ADMIN); returns paginated list per tab |
| `getAdminInquiries` | Accepts optional `?schoolId=` query param |
| `addParentDirect` | Creates `User` with role `PARENT` and hashed password; validates email uniqueness |
| `addAdminDirect` | Creates `User` with role `ADMIN` + chosen `adminAccessLevel`; strips `isSuperAdmin` from body |
| `updateUserRole` | Both `SCHOOL_ADMIN→PARENT` and `PARENT→SCHOOL_ADMIN` transitions blocked; `blockIfSuperAdminTarget` called first |
| `updateUserStatus` | `blockIfSuperAdminTarget` called first |
| `deleteUserDirect` | Calls `blockIfSuperAdminTarget`; if `SCHOOL_ADMIN`: `prisma.$transaction` — delete owned `School` then `User`; if `PARENT`/`ADMIN`: delete `User` directly; writes `AdminAuditLog` entry |
| `toggleSchoolVisibility` | Flips `School.isVisible`; calls `invalidateSchoolCache()`; writes `AdminAuditLog` entry |
| `checkOwnerEmail` | Accepts optional `?role=PARENT` param |

---

## 8. Middleware

| Middleware | File | Purpose |
|------------|------|---------|
| `applySecurityMiddleware` | `security.ts` | Helmet CSP, CORS (`FRONTEND_URL`), method guard |
| `generalRateLimiter` | `security.ts` | 100 req / 15 min / IP |
| `authRateLimiter` | `security.ts` | 10 req / 15 min |
| `forgotPasswordRateLimiter` | `security.ts` | 3 / hour |
| `resetPasswordRateLimiter` | `security.ts` | 5 / hour |
| `otpRateLimiter` | `security.ts` | 3 / 10 min |
| `auth` | `auth.ts` | JWT verify, issuer check, jti blacklist |
| `requireRole` | `roleCheck.ts` | Role gate after auth |
| `requireAdminLevel` | `roleCheck.ts` | Admin permission tier gate — READ_ONLY \| READ_WRITE \| FULL_ACCESS; applied after `requireRole(ADMIN)` on admin routes |
| `blockIfSuperAdminTarget` | `roleCheck.ts` | 403 if target user has `isSuperAdmin = true`; re-checks DB, never trusts JWT |
| `validate` | `validate.ts` | Zod schema + body sanitize |
| `bruteForceGuard` | `bruteForce.ts` | 5 failures / 15 min per IP+email |
| `errorHandler` | `errorHandler.ts` | Standardized error responses |
| `notFoundHandler` | `errorHandler.ts` | 404 with `NOT_FOUND` code |
| `asyncHandler` | `asyncHandler.ts` | Wraps async route handlers |

### `requireAdminLevel` Pattern

```typescript
// middleware/roleCheck.ts
export const requireAdminLevel = (...levels: AdminAccessLevel[]) =>
  asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
      throw AppError.forbidden('Admin access required');
    }
    if (!levels.includes(req.user.adminAccessLevel)) {
      throw AppError.forbidden('Insufficient admin permission level');
    }
    next();
  });
```

### `blockIfSuperAdminTarget` Pattern

```typescript
// middleware/roleCheck.ts
export const blockIfSuperAdminTarget = (targetUserId: string) =>
  asyncHandler(async (req, res, next) => {
    const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { isSuperAdmin: true } });
    if (target?.isSuperAdmin) {
      throw AppError.forbidden('Cannot modify the super admin account');
    }
    next();
  });
```

Usage in `admin.routes.ts`:
```typescript
router.delete('/users/:id', requireAdminLevel('FULL_ACCESS'), deleteUserDirect);
router.patch('/users/:id/role', requireAdminLevel('FULL_ACCESS'), validate(updateUserRoleSchema), updateUserRole);
router.patch('/users/:id/status', requireAdminLevel('FULL_ACCESS'), validate(updateUserStatusSchema), updateUserStatus);
router.patch('/schools/:id/visibility', requireAdminLevel('READ_WRITE', 'FULL_ACCESS'), toggleSchoolVisibility);
```

---

## 9. Validation Layer

Validation uses **Zod schemas** in `src/validators/` applied via `validate()` middleware.

| Validator | Schemas |
|-----------|---------|
| `auth.validator.ts` | registerParent, registerSchool, login, forgotPassword, verifyResetOtp, resetPassword, sendOtp, verifyOtp, addParentSchema, addAdminSchema (strips `isSuperAdmin`); role transition guard blocks both `SCHOOL_ADMIN→PARENT` and `PARENT→SCHOOL_ADMIN` in updateUserRole schema |
| `school.validator.ts` | createSchool, updateSchool (see field inventory below) |

### `school.validator.ts` — Field Inventory

#### Nested schemas (exported types used by controller)

| Schema | Type export | Used in |
|--------|-------------|---------|
| `boardResultSchema` | `BoardResultInput` | `syncBoardResults` |
| `scholarshipSchema` | `ScholarshipInput` | `syncScholarships` |
| `faqSchema` | `FAQInput` | `syncFAQs` |
| `downloadSchema` | `DownloadInput` | `syncDownloads` |
| `galleryImageSchema` | `GalleryImageInput` | `syncGalleryImages` |
| `customFieldSchema` | `CustomFieldInput` | `syncCustomFields` |

#### Scalar field coverage in `updateSchoolBodySchema`

| Section | Fields |
|---------|--------|
| Core identity | `name`, `city`, `state`, `address`, `pincode`, `board`, `schoolType`, `medium`, `classesFrom`, `classesTo`, `phone`, `email`, `website`, `logoUrl`, `coverImageUrl`, `description` |
| Legacy fees | `admissionFee`, `tuitionFeeMonthly`, `totalAnnualFee`, `transportFee`, `hostelFee`, `totalStudents` |
| Basic Info extras | `tagline`, `establishedYear`, `managementType`, `schoolCategory`, `schoolFormat`, `affiliationNumber`, `startTime`, `endTime`, `workingDays` |
| About | `vision`, `mission`, `principalMessage` |
| Academics | `classesOffered[]`, `streamsOffered[]`, `studentTeacherRatio` |
| Admissions | `admissionOpen`, `admissionStartDate`, `admissionEndDate`, `ageCriteria`, `requiredDocuments`, `admissionProcess` |
| Fee structure | `averageAnnualFee`, `prePrimaryFee`, `class1to5Fee`, `class6to8Fee`, `class9to10Fee`, `class11to12Fee` |
| Facilities & Sports | `facilitiesList[]`, `sportsList[]` |
| Infrastructure | `campusArea`, `totalClassrooms`, `totalLabs`, `libraryBooks`, `hostelCapacity`, `totalBuses` |
| Faculty | `totalTeachers`, `qualifiedTeachers`, `trainingPrograms` |
| Programs | `programsList[]` |
| Student Life | `clubsActivities`, `culturalActivities`, `annualEvents`, `educationalTours` |
| Achievements | `academicAchievements`, `sportsAchievements`, `awardsRecognitions` |
| Hostel | `hostelAvailable`, `hostelBoys`, `hostelGirls`, `hostelMess` |
| Transport | `transportAvailable`, `transportAreas`, `gpsTracking`, `totalVehicles` |
| Safety | `hasCCTV`, `hasGuards`, `hasMedicalRoom`, `hasFireSafety`, `hasVisitorMgmt` |
| Contact extras | `whatsapp`, `mapUrl`, `facebook`, `instagram`, `youtube`, `linkedin`, `admissionCoordinatorName`, `admissionPhone`, `admissionEmail` |
| Related arrays | `boardResults[]`, `scholarships[]`, `faqs[]`, `downloads[]`, `images[]`, `customFields[]` |

**Sanitization:** `lib/sanitize.ts` strips HTML from string inputs before validation.

**Error format:**
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": { "email": ["Invalid email"] }
}
```

---

## 10. Database Schema

**File:** `prisma/schema.prisma`  
**Client:** `generated/prisma` via `@prisma/adapter-pg`

### Enums

| Enum | Values |
|------|--------|
| `Role` | PARENT, SCHOOL_ADMIN, ADMIN |
| `AdminAccessLevel` | READ_ONLY, READ_WRITE, FULL_ACCESS |
| `SchoolStatus` | DRAFT, PENDING, APPROVED, REJECTED |
| `BoardType` | CBSE, ICSE, UP_BOARD, OTHER |
| `SchoolType` | BOYS, GIRLS, CO_ED |
| `MediumType` | HINDI, ENGLISH, BOTH |
| `InquiryStatus` | NEW, CONTACTED, CLOSED |

> **Migration note:** `AdminAccessLevel` enum was added in migration `add_admin_access_level`. After running, existing ADMIN rows must be backfilled:
> ```sql
> UPDATE "User" SET "adminAccessLevel" = 'FULL_ACCESS' WHERE role = 'ADMIN';
> ```

### Models

| Model | Purpose | Notes |
|-------|---------|-------|
| `User` | Auth, profile, OTP fields | `otpCode`, `otpExpiry`, `otpVerified`; `adminAccessLevel AdminAccessLevel?` (null for PARENT/SCHOOL_ADMIN); `isSuperAdmin Boolean @default(false)` — partial unique index ensures only one true row; legacy `resetToken*` unused |
| `School` | Listing — scalar fields for all 22 profile sections | `isVisible Boolean @default(true)` added; see field inventory below |
| `SchoolImage` | Gallery URLs | `category` field added; cascade delete with school |
| `BoardResult` | Per-year board exam results | Section 13; cascade delete |
| `Scholarship` | Scholarship listings | Section 14; cascade delete |
| `SchoolFAQ` | FAQ pairs | Section 22; Prisma accessor: `schoolFAQ`; cascade delete |
| `SchoolDownload` | Downloadable files | Section 19; cascade delete |
| `SchoolCustomField` | School-defined extra fields for any section | `section` field identifies origin; cascade delete |
| `Facility` / `SchoolFacility` | M:N facilities | **Read-only** — no write API |
| `Inquiry` | Parent → school messages | Status workflow |
| `Favourite` | Parent saved schools | Unique `[parentId, schoolId]` |
| `AdminAuditLog` | Immutable action log | `id, actorId, actorEmail, action, targetType, targetId, metadata, createdAt` — written on: admin create, user delete, role change, status change, school delete, access-level change, visibility toggle |
| `Account`, `Session`, `VerificationToken` | NextAuth-shaped | **Not used by backend routes** |

### School Model — Scalar Field Inventory

| Group | Fields |
|-------|--------|
| Core (required) | `name`, `slug`, `address`, `city`, `state`, `board`, `schoolType`, `medium`, `classesFrom`, `classesTo`, `phone`, `status`, `ownerId` |
| Core (optional) | `description`, `pincode`, `email`, `website`, `logoUrl`, `coverImageUrl`, `totalStudents`, `rejectionReason` |
| Visibility | `isVisible Boolean @default(true)` — toggled by admin; public queries always filter `isVisible: true` |
| Legacy fees | `admissionFee`, `tuitionFeeMonthly`, `totalAnnualFee`, `transportFee`, `hostelFee` |
| Basic Info extras | `tagline`, `establishedYear`, `managementType`, `schoolCategory`, `schoolFormat`, `affiliationNumber`, `startTime`, `endTime`, `workingDays` |
| About | `vision`, `mission`, `principalMessage` |
| Academics | `classesOffered String[]`, `streamsOffered String[]`, `studentTeacherRatio` |
| Admissions | `admissionOpen Boolean`, `admissionStartDate`, `admissionEndDate`, `ageCriteria`, `requiredDocuments`, `admissionProcess` |
| Fee structure | `averageAnnualFee`, `prePrimaryFee`, `class1to5Fee`, `class6to8Fee`, `class9to10Fee`, `class11to12Fee` |
| Facilities & Sports | `facilitiesList String[]`, `sportsList String[]` |
| Infrastructure | `campusArea`, `totalClassrooms`, `totalLabs`, `libraryBooks`, `hostelCapacity`, `totalBuses` |
| Faculty | `totalTeachers`, `qualifiedTeachers`, `trainingPrograms` |
| Programs | `programsList String[]` |
| Student Life | `clubsActivities`, `culturalActivities`, `annualEvents`, `educationalTours` |
| Achievements | `academicAchievements`, `sportsAchievements`, `awardsRecognitions` |
| Hostel | `hostelAvailable Boolean`, `hostelBoys Boolean`, `hostelGirls Boolean`, `hostelMess Boolean` |
| Transport | `transportAvailable Boolean`, `transportAreas`, `gpsTracking Boolean`, `totalVehicles` |
| Safety | `hasCCTV Boolean`, `hasGuards Boolean`, `hasMedicalRoom Boolean`, `hasFireSafety Boolean`, `hasVisitorMgmt Boolean` |
| Contact extras | `whatsapp`, `mapUrl`, `facebook`, `instagram`, `youtube`, `linkedin`, `admissionCoordinatorName`, `admissionPhone`, `admissionEmail` |

### Related Models — Field Detail

**`AdminAuditLog`** (new)
```
id, actorId, actorEmail, action (string e.g. "USER_DELETE"), targetType ("USER"|"SCHOOL"),
targetId, metadata (Json?), createdAt
@@index([actorId])
@@index([targetId])
@@index([createdAt])
```

**`SchoolCustomField`**
```
id, schoolId, section (e.g. "basicInfo"), label, value, fieldType ("text"|"number"|"date"|"url"|"richtext")
@@index([schoolId, section])
```

**`BoardResult`**
```
id, schoolId, year, class10Pass?, class12Pass?, topperName?, topperScore?
@@index([schoolId])
```

**`Scholarship`**
```
id, schoolId, name, eligibility?, benefits?
@@index([schoolId])
```

**`SchoolFAQ`** (Prisma accessor: `schoolFAQ`)
```
id, schoolId, question, answer
@@index([schoolId])
```

**`SchoolDownload`**
```
id, schoolId, label, url
@@index([schoolId])
```

**`SchoolImage`** (updated)
```
id, schoolId, url, caption?, category?    ← category is new
```

### Indexes

- **School:** `[status, createdAt]`, `[city, status]`, `[board, status]`, `[ownerId]`, `[isVisible, status]` ← added for public visibility filter
- **User:** `[role]`, `[adminAccessLevel]`; partial unique index `WHERE "isSuperAdmin" = true`
- **Inquiry:** `[schoolId, status]`, `[schoolId, createdAt]`, `[parentId]`
- **Favourite:** `[parentId]`, unique `[parentId, schoolId]`
- **SchoolCustomField:** `[schoolId, section]`
- **BoardResult, Scholarship, SchoolFAQ, SchoolDownload:** `[schoolId]`
- **AdminAuditLog:** `[actorId]`, `[targetId]`, `[createdAt]`

### Migrations

```bash
# Run from backend/
npx prisma migrate dev --name add_super_admin_visibility_audit
npx prisma generate

# Post-migration backfill
UPDATE "User" SET "adminAccessLevel" = 'FULL_ACCESS' WHERE role = 'ADMIN';

# Partial unique index for super admin (raw SQL migration)
CREATE UNIQUE INDEX "User_isSuperAdmin_unique" ON "User" ("isSuperAdmin") WHERE "isSuperAdmin" = true;

# Seed super admin (one-time)
npm run seed:super-admin
```

### Partial Implementation Notes

- **`DRAFT` status:** Exists in schema and frontend checks; backend never assigns it in application code
- **`resetToken`/`resetTokenExpiry`:** Schema fields exist but are never set; only cleared in reset flow
- **`Facility` model:** Readable via relations but no API to manage facilities
- **Reviews (Section 21):** Read-only on frontend, no backend model — system generated from `Inquiry` data or future review model
- **`adminAccessLevel`:** `null` for PARENT and SCHOOL_ADMIN users; only populated for ADMIN role
- **`isSuperAdmin`:** `false` for all users except the single super admin row; never set via API

---

## 11. Lib Modules

| Module | Role |
|--------|------|
| `prisma.ts` | DB client + SSL connection pool |
| `cache.ts` | In-memory TTL cache with invalidation |
| `mailer.ts` | Brevo OTP email via raw `https` module |
| `otp.ts` | Generate/verify OTP hash; Fast2SMS send |
| `tokenBlacklist.ts` | In-memory jti blacklist (max 10k, 10-min cleanup interval) |
| `favourites.ts` | Shared add/remove/list for both favourite APIs |
| `pagination.ts` | Page/limit parsing and response helpers |
| `queries/schools.ts` | Select shapes, filters, cursor pagination; `isVisible: true` added to public filter builder; accepts `state`/`city` params |
| `sanitize.ts` | HTML stripping from request bodies |
| `account-status.ts` | Disabled account detection (`phone = "__DISABLED__"`) |

---

## 12. Caching

**Implementation:** In-memory `Map` with TTL in `lib/cache.ts`.

| Namespace | TTL | Invalidated On |
|-----------|-----|----------------|
| School list/search | 60s | School mutations |
| School cities | 60s | School mutations + visibility toggle; cache key varies by `state` param (`sf:schools:cities:<state>\|all`) |
| School detail | 300s | School update/delete/visibility change |
| Admin stats | 30s | School approve/reject/create |

**Pattern:** `withCache(key, ttl, fetchFn)` + `buildCacheKey(namespace, parts)`

**Invalidation:** `invalidateSchoolCache()` clears `sf:schools:*`, `sf:admin:stats*`, legacy `schools:cities`

**Note:** `updateSchool` and `toggleSchoolVisibility` both call `invalidateSchoolCache()` after commit.

**Not cached:** Auth, inquiries, favourites, user lists, audit logs.

---

## 13. Error Handling

Standard error envelope:

```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Resource not found"
}
```

**Error types** (`utils/AppError.ts`): NotFound, Unauthorized, Forbidden, Conflict, BadRequest, RoleConflict, AccountDisabled, InvalidToken, RateLimited.

**Handled by `errorHandler`:**
- `AppError` — mapped status codes
- Zod validation errors — 400 with field details
- Prisma errors — P2002 (conflict), P2025 (not found), P2003 (foreign key)
- JWT errors — 401
- Malformed JSON — 400

---

## 14. Logging

**No structured logger** — uses `console.log/info/warn/error` throughout.

| Event | Level |
|-------|-------|
| Server start | info |
| OTP generation | log (always printed to terminal, dev and prod) |
| Brevo email send | log/error |
| AppError | warn |
| Unhandled errors | error (+ stack in dev) |
| Config warnings | warn |
| Process hooks | unhandledRejection, uncaughtException (exit in prod) |

> Admin actions (user delete, role/status change, visibility toggle, school delete) are recorded in `AdminAuditLog` DB table — not just console logs.

---

## 15. Background Jobs

**None.** No cron, queue, or worker processes.

Only periodic task: `tokenBlacklist` cleanup via `setInterval` every 10 minutes.

---

## 16. File Storage

**No backend file upload.** Images are URL strings in JSON body.

- Frontend uploads to Cloudinary via `POST /api/upload`
- Backend stores URLs in `School.logoUrl`, `School.coverImageUrl`, and `SchoolImage.url`
- `addSchoolImage` expects `{ url, caption?, category? }` in request body
- `updateSchool` accepts `images[]` array in payload; synced via `syncGalleryImages` in transaction
- Cloudinary credentials live entirely on the frontend — the backend has no Cloudinary env vars

---

## 17. Environment Variables

From `backend/.env.example`. Validated by `validateStartupEnv()` in `config/production.ts`.

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Recommended | `development` / `production` |
| `PORT` | No (local) | Default `4000`; injected on Render |
| `DATABASE_URL` | Yes | Neon PostgreSQL, `sslmode=require` |
| `JWT_SECRET` | Yes | Must match frontend |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `FRONTEND_URL` | Yes in production | CORS; comma-separated OK |
| `BREVO_API_KEY` | Yes in production | Used by mailer for OTP emails |
| `EMAIL_FROM` | Yes in production | Verified Brevo sender |
| `FAST2SMS_API_KEY` | Optional | SMS OTP; dev logs OTP if unset |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeder only | `npm run seed:admin` |
| `SUPER_ADMIN_EMAIL` | Seeder only | `npm run seed:super-admin` |
| `BCRYPT_ROUNDS` | No | Default `12` |
| `TRUST_PROXY` | No | Auto-enabled when `NODE_ENV=production` |

**Removed (June 2026 cleanup):** `RESEND_API_KEY` and `CLOUDINARY_*`.

---

## 18. Deployment

### Scripts

| Script | Command |
|--------|---------|
| `dev` | `nodemon --exec ts-node src/server.ts` |
| `build` | `tsc` |
| `start` | `node dist/server.js` |
| `db:generate` | `prisma generate` |
| `migrate:deploy` | `prisma migrate deploy` |
| `migrate:dev` | `prisma migrate dev` |
| `seed:admin` | `ts-node src/scripts/seed-admin.ts` |
| `seed:super-admin` | `ts-node src/scripts/seed-super-admin.ts` |

### Render (`render.yaml`)

```yaml
buildCommand: npm ci && npx prisma generate && npm run build
preDeployCommand: npx prisma migrate deploy
startCommand: npm start
healthCheckPath: /health
```

Set manually in dashboard: `BREVO_API_KEY`, `EMAIL_FROM`, `FAST2SMS_API_KEY`, `FRONTEND_URL`, `DATABASE_URL`.

### Local Development

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, FRONTEND_URL, BREVO_API_KEY, etc.
npm install
npx prisma generate
npm run migrate:dev
npm run dev
```

API: [http://localhost:4000](http://localhost:4000)  
Health: `GET http://localhost:4000/health`

---

**SchoolFinder API** — Express REST backend for school discovery across India.