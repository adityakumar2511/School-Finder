  # SchoolFinder — Backend Documentation

  > Last updated: June 3, 2026 — verified against codebase

  > **Stack:** Express.js 5 · TypeScript · Prisma 5 · PostgreSQL (Neon) · JWT · Resend · Fast2SMS · Cloudinary  
  > **Default port:** `4000` · **Repository path:** `backend/`  
  > **Schema owner:** `backend/prisma/schema.prisma`

  ---

  ## Table of Contents

  1. [Project Overview](#1-project-overview)
  2. [Tech Stack](#2-tech-stack)
  3. [Folder Structure](#3-folder-structure)
  4. [Authentication](#4-authentication)
  5. [API Endpoints](#5-api-endpoints)
  6. [Middleware](#6-middleware)
  7. [Database Schema](#7-database-schema)
  8. [Environment Variables](#8-environment-variables)
  9. [Lib Modules](#9-lib-modules)
  10. [Error Handling](#10-error-handling)
  11. [Deployment](#11-deployment)
  12. [Known Limitations & Stubs](#12-known-limitations--stubs)

  ---

  ## 1. Project Overview

  The SchoolFinder backend is a **stateless REST API** and the **single source of truth** for all database operations.

  | Responsibility | Detail |
  |----------------|--------|
  | Public discovery | School list, search, detail by slug |
  | Auth | JWT (HS256), role-separated login, password reset, phone OTP (SMS) |
  | Parent | Profile, favourites, inquiries |
  | School admin | Own school CRUD, gallery URLs, inquiry status |
  | Platform admin | Moderation, users, stats |

  The Next.js frontend handles UI, NextAuth sessions, and image uploads to Cloudinary. The backend stores image **URLs** (JSON body), not multipart uploads.

  **Entry point:** `src/server.ts`

  ---

  ## 2. Tech Stack

  | Technology | Version / usage |
  |------------|-----------------|
  | Express.js | 5.x |
  | TypeScript | 6.x |
  | Prisma | 5.x → client in `generated/prisma` |
  | PostgreSQL | Neon via `@prisma/adapter-pg` + `pg` |
  | JWT | `jsonwebtoken`, HS256, issuer `schoolfinder-api` |
  | Zod | 4.x request validation |
  | bcryptjs | Password hashing |
  | Resend | Existing reset flow, partially retained |
  | Brevo | Planned for OTP emails — **not yet active** |
  | Fast2SMS | Phone OTP SMS (`POST /api/auth/send-otp`) |
  | Helmet + express-rate-limit | Security |
  | Cloudinary SDK | **(stub)** — lib only, no upload route |

  **Unused dependency:** `nodemailer` is in `package.json` but not imported in `src/`.

  ---

  ## 3. Folder Structure

  ```
  backend/
  ├── prisma/
  │   ├── schema.prisma
  │   └── migrations/
  │       └── 20250602120000_restructure_schema_add_indexes_reset_token/
  ├── generated/prisma/          # Prisma client output
  ├── render.yaml
  ├── .env.example
  └── src/
      ├── server.ts
      ├── config/
      │   └── production.ts      # validateStartupEnv()
      ├── controllers/
      │   ├── admin.controller.ts
      │   ├── auth.controller.ts
      │   ├── favourite.controller.ts   # legacy /api/favourites
      │   ├── inquiry.controller.ts
      │   ├── parent.controller.ts      # preferred /api/parent/*
      │   └── schools.controller.ts
      ├── routes/
      │   ├── admin.routes.ts
      │   ├── auth.routes.ts
      │   ├── favourite.routes.ts
      │   ├── inquiry.routes.ts
      │   ├── parent.routes.ts
      │   └── schools.routes.ts
      ├── middleware/
      │   ├── auth.ts            # JWT sign/verify, jti blacklist check
      │   ├── bruteForce.ts
      │   ├── errorHandler.ts
      │   ├── roleCheck.ts
      │   ├── security.ts        # Helmet, CORS, rate limiters
      │   ├── upload.ts          # (stub) Multer — not mounted on any route
      │   └── validate.ts
      ├── validators/
      │   ├── auth.validator.ts
      │   └── school.validator.ts
      ├── lib/
      │   ├── account-status.ts
      │   ├── cache.ts
      │   ├── cloudinary.ts      # (stub) not called from routes
      │   ├── favourites.ts      # shared favourite logic
      │   ├── mailer.ts          # Resend reset (existing); sendOtpEmail terminal-only (Brevo TODO)
      │   ├── otp.ts             # Fast2SMS + SHA-256 OTP
      │   ├── pagination.ts
      │   ├── prisma.ts
      │   ├── sanitize.ts
      │   ├── tokenBlacklist.ts
      │   └── queries/schools.ts
      ├── scripts/
      │   └── seed-admin.ts
      └── utils/
          ├── AppError.ts        # Errors.* factory
          └── asyncHandler.ts
  ```

  ---

  ## 4. Authentication

  ### JWT

  | Setting | Value |
  |---------|--------|
  | Algorithm | HS256 |
  | Issuer | `schoolfinder-api` |
  | Secret | `JWT_SECRET` |
  | Expiry | `JWT_EXPIRES_IN` (default `7d`) |
  | Payload | `id`, `role`, `email`, `jti` (UUID per token) |
  | Header | `Authorization: Bearer <token>` |
  | Logout | `jti` added to in-memory blacklist (`lib/tokenBlacklist.ts`) |

  ### Flows

  | Flow | Endpoint | Notes |
  |------|----------|-------|
  | Register parent | `POST /api/auth/register-parent` | Returns JWT |
  | Register school | `POST /api/auth/register-school` | User + `PENDING` school, returns JWT |
  | Login | `POST /api/auth/login` | Optional `expectedRole`; brute-force guard |
  | Logout | `POST /api/auth/logout` | Blacklists `jti` |
  | Forgot password | `POST /api/auth/forgot-password` | Email + optional `expectedRole`; 6-digit OTP (SHA-256, 10 min); terminal log only; generic 200 if no match / role mismatch |
  | Verify reset OTP | `POST /api/auth/verify-reset-otp` | Email + 6-digit OTP + optional `expectedRole`; sets `otpVerified` |
  | Reset password | `POST /api/auth/reset-password` | Email + passwords + optional `expectedRole`; requires `otpVerified` + valid `otpExpiry` |
  | Send OTP | `POST /api/auth/send-otp` | Phone `+91[6-9]#########`; Fast2SMS; always 200 generic |
  | Verify OTP | `POST /api/auth/verify-otp` | Phone + 6-digit OTP → JWT |
  | Google sync | `POST /api/auth/google-sync` | Upsert PARENT; no Zod validator |
  | Profile | `GET/PATCH /api/auth/me` | Bearer required |

  ### Account disable

  Disabled users have `phone = "__DISABLED__"` (`lib/account-status.ts`). Login returns 403.

  ### Roles

  `PARENT` · `SCHOOL_ADMIN` · `ADMIN` — enforced via `requireRole()` after `auth`.

  ---

  ## 5. API Endpoints

  Global prefix from `server.ts`. Rate limiters apply as listed.

  ### Health (no prefix)

  | Method | Path | Description |
  |--------|------|-------------|
  | GET | `/health` | DB ping, `blacklistSize`; 503 if DB down |
  | GET | `/ready` | `{ ready: true }` |

  ### `/api/auth`

  | Method | Path | Rate limit | Handler |
  |--------|------|------------|---------|
  | POST | `/register-parent` | auth + bruteForce | `registerParent` |
  | POST | `/register-school` | auth + bruteForce | `registerSchool` |
  | POST | `/login` | auth + bruteForce | `login` |
  | POST | `/forgot-password` | forgotPassword (3/h) | `forgotPassword` — email OTP (terminal log; Brevo planned) |
  | POST | `/verify-reset-otp` | resetPassword (5/h) | `verifyResetOtp` |
  | POST | `/send-otp` | otp (3/10min) | `sendOtp` |
  | POST | `/verify-otp` | auth | `verifyOtp` |
  | POST | `/reset-password` | resetPassword (5/h) | `resetPassword` — requires prior OTP verification |
  | POST | `/logout` | auth middleware | `logout` |
  | GET | `/me` | auth | `getMe` |
  | PATCH | `/me` | auth | `updateMe` |
  | POST | `/google-sync` | auth | `syncGoogleUser` |

  ### `/api/schools`

  | Method | Path | Auth | Handler |
  |--------|------|------|---------|
  | GET | `/` | Public | `getSchools` |
  | GET | `/search` | Public | `searchSchools` |
  | GET | `/my-school` | SCHOOL_ADMIN | `getMySchool` |
  | POST | `/my-school/images` | SCHOOL_ADMIN | `addSchoolImage` (JSON `{ url }`) |
  | DELETE | `/images/:id` | SCHOOL_ADMIN | `deleteSchoolImage` |
  | GET | `/:slug` | Public | `getSchool` |
  | POST | `/` | SCHOOL_ADMIN | `createSchool` |
  | PATCH | `/:id` | auth (owner/ADMIN in controller) | `updateSchool` |
  | DELETE | `/:id` | ADMIN | `deleteSchool` |

  ### `/api/admin` (all routes: ADMIN)

  | Method | Path | Handler |
  |--------|------|---------|
  | GET | `/stats` | `getStats` |
  | GET | `/schools` | `getAdminSchools` |
  | GET | `/users` | `getAdminUsers` |
  | GET | `/inquiries` | `getAdminInquiries` |
  | PATCH | `/schools/:id/approve` | `approveSchoolById` |
  | PATCH | `/schools/:id/reject` | `rejectSchoolById` |
  | POST | `/approve` | `approveSchool` (legacy body) |
  | POST | `/reject` | `rejectSchool` (legacy body) |
  | POST | `/add-school` | `addSchoolDirect` |
  | PATCH | `/users/:id/role` | `updateUserRole` |
  | PATCH | `/users/:id/status` | `updateUserStatus` |

  ### `/api/inquiries`

  | Method | Path | Auth | Handler |
  |--------|------|------|---------|
  | POST | `/` | PARENT | `createInquiry` |
  | GET | `/my` | PARENT | `getMyInquiries` |
  | GET | `/school/:schoolId` | SCHOOL_ADMIN, ADMIN | `getSchoolInquiries` |
  | PATCH | `/:id/status` | SCHOOL_ADMIN, ADMIN | `updateInquiryStatus` |

  ### `/api/favourites` (legacy — `Deprecation` header on responses)

  Router: `auth` + `PARENT`. Uses shared logic from `lib/favourites.ts`.

  | Method | Path | Handler |
  |--------|------|---------|
  | GET | `/` | `getFavourites` |
  | POST | `/` | `addFavourite` |
  | DELETE | `/` | `removeFavourite` (`?schoolId=`) |

  ### `/api/parent` (preferred)

  Router: `auth` + `PARENT`.

  | Method | Path | Handler |
  |--------|------|---------|
  | GET | `/profile` | `getParentProfile` |
  | PATCH | `/profile` | `updateParentProfile` |
  | GET | `/favourites` | `getParentFavourites` |
  | POST | `/favourites` | `addParentFavourite` |
  | DELETE | `/favourites` | `removeParentFavourite` |
  | GET | `/inquiries` | `getParentInquiries` |

  ---

  ## 6. Middleware

  | Middleware | Purpose |
  |------------|---------|
  | `applySecurityMiddleware` | Helmet, CORS (`FRONTEND_URL`), method guard |
  | `generalRateLimiter` | 100 / 15 min / IP |
  | `authRateLimiter` | 10 / 15 min |
  | `forgotPasswordRateLimiter` | 3 / hour |
  | `resetPasswordRateLimiter` | 5 / hour |
  | `otpRateLimiter` | 3 / 10 min |
  | `auth` | JWT verify + jti blacklist |
  | `requireRole` | Role gate |
  | `validate` | Zod + body sanitize |
  | `bruteForceGuard` | 5 failures / 15 min per IP+email |
  | `errorHandler` | AppError, Zod, Prisma, JWT, JSON errors |
  | `notFoundHandler` | 404 with `NOT_FOUND` code |

  ---

  ## 7. Database Schema

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
  | `User` | Auth, profile, OTP fields, reset token fields |
  | `School` | Listing with fees, status, owner |
  | `SchoolImage` | Gallery URLs |
  | `Facility` / `SchoolFacility` | Many-to-many |
  | `Inquiry` | Parent → school messages |
  | `Favourite` | Parent saved schools |
  | `Account`, `Session`, `VerificationToken` | NextAuth-shaped tables (not used by backend routes) |

  ### User OTP / reset fields

  - `otpCode` — SHA-256 hash of 6-digit OTP  
  - `otpExpiry` — 10-minute window  
  - `otpVerified` — boolean  
  - `resetToken` — SHA-256 hash of reset token  
  - `resetTokenExpiry` — 1-hour window  

  ### Indexes

  **School:** `[status, createdAt]`, `[city, status]`, `[board, status]`, `[ownerId]`  
  **Inquiry:** `[schoolId, status]`, `[parentId]`  
  **Favourite:** `[parentId]`, unique `[parentId, schoolId]`

  ---

  ## 8. Environment Variables

  From `backend/.env.example`. Startup validation in `config/production.ts`.

  | Variable | Required | Notes |
  |----------|----------|-------|
  | `NODE_ENV` | Recommended | `development` / `production` |
  | `PORT` | No (local) | Default `4000`; injected on Render |
  | `DATABASE_URL` | Yes | Neon PostgreSQL, `sslmode=require` |
  | `JWT_SECRET` | Yes | Must match frontend `JWT_SECRET` |
  | `JWT_EXPIRES_IN` | No | Default `7d` |
  | `FRONTEND_URL` | Yes in production | CORS + reset links; comma-separated OK |
  | `CLOUDINARY_CLOUD_NAME` | Yes (startup) | Required by validator; upload API not exposed |
  | `CLOUDINARY_API_KEY` | Yes (startup) | |
  | `CLOUDINARY_API_SECRET` | Yes (startup) | |
  | `RESEND_API_KEY` | Warn if missing | Password reset email (existing Resend flow) |
  | `EMAIL_FROM` | Warn if missing | Verified Resend sender |
  | `BREVO_API_KEY` | Optional (planned) | OTP email via Brevo — **not active yet** (`sendOtpEmail` commented out) |
  | `FAST2SMS_API_KEY` | Optional | SMS OTP; dev logs OTP to console if unset |
  | `ADMIN_EMAIL` | Seeder only | `npm run seed:admin` |
  | `ADMIN_PASSWORD` | Seeder only | |
  | `BCRYPT_ROUNDS` | No | Default `12` |
  | `TRUST_PROXY` | No | `true` behind reverse proxy |

  **No SMTP variables.** Email is Resend only.

  ---

  ## 9. Lib Modules

  | Module | Role |
  |--------|------|
  | `prisma.ts` | DB client + SSL pool |
  | `otp.ts` | Generate/verify OTP hash; Fast2SMS send |
  | `mailer.ts` | Resend password reset (existing). `sendOtpEmail` added: currently terminal-only; Brevo integration commented out (TODO) |
  | `tokenBlacklist.ts` | In-memory jti blacklist (max 10k) |
  | `favourites.ts` | Shared add/remove/list for both favourite APIs |
  | `cache.ts` | In-memory TTL (list 60s, detail 300s, stats 30s) |
  | `pagination.ts` | Page/limit helpers |
  | `queries/schools.ts` | Selects, filters, cursor pagination |
  | `sanitize.ts` | Input sanitization |
  | `account-status.ts` | Disabled account sentinel |
  | `cloudinary.ts` | **(stub)** Upload helpers — no route uses them |

  ---

  ## 10. Error Handling

  Standard error envelope:

  ```json
  {
    "success": false,
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": { "email": ["Invalid email"] }
  }
  ```

  `utils/AppError.ts` exports `Errors.NotFound`, `Unauthorized`, `Forbidden`, `Conflict`, `BadRequest`, `RoleConflict`, `AccountDisabled`, `InvalidToken`, `RateLimited`.

  ---

  ## 11. Deployment

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

  ### `render.yaml`

  - **buildCommand:** `npm ci && npx prisma generate && npm run build`
  - **preDeployCommand:** `npx prisma migrate deploy`
  - **startCommand:** `npm start`
  - **healthCheckPath:** `/health`

  **Not in render.yaml:** `RESEND_API_KEY`, `EMAIL_FROM`, `FAST2SMS_API_KEY` — set manually in dashboard.

  ---

  ## 12. Known Limitations & Stubs

  | Item | Status |
  |------|--------|
  | Backend multipart upload route | **Not implemented** — `middleware/upload.ts` unused |
  | `lib/cloudinary.ts` | **Stub** — no controller imports |
  | School gallery | Client uploads to frontend Cloudinary; backend stores URL only |
  | JWT blacklist | In-memory; resets on restart |
  | Cache | In-memory; not Redis |
  | `/api/favourites` | Legacy; returns `Deprecation` header |
  | `mailer.sendOtpEmail` | **Terminal-only** — forgot-password OTP logged to console; Brevo integration prepared but commented out (TODO) |
  | `nodemailer` package | **Unused** |
  | Phone OTP login | Backend API only — **no frontend UI** for `/send-otp` |
  | NextAuth DB tables | In schema; frontend uses JWT-only NextAuth |

  ---

  **SchoolFinder API** — Express REST backend for school discovery across India.
