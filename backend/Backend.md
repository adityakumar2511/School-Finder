  # SchoolFinder — Backend Documentation

  > Last updated: June 9, 2026

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
  | Resend | Password reset OTP email (`sendOtpEmail` in `mailer.ts`) |
  | Fast2SMS | Phone OTP SMS (`POST /api/auth/send-otp`) |
  | Helmet + express-rate-limit | Security |
  
  **Unused dependency:** `nodemailer` is in `package.json` but not imported in `src/`.

  ---

  ## 3. Folder Structure

  ```
  ./backend
  ./backend/.env
  ./backend/.env.example
  ./backend/.gitignore
  ./backend/Backend.md
  ./backend/dist
  ./backend/dist/config
  ./backend/dist/config/production.js
  ./backend/dist/controllers
  ./backend/dist/controllers/admin.controller.js
  ./backend/dist/controllers/auth.controller.js
  ./backend/dist/controllers/favourite.controller.js
  ./backend/dist/controllers/inquiry.controller.js
  ./backend/dist/controllers/parent.controller.js
  ./backend/dist/controllers/schools.controller.js
  ./backend/dist/lib
  ./backend/dist/lib/account-status.js
  ./backend/dist/lib/cache.js
  ./backend/dist/lib/cloudinary.js
  ./backend/dist/lib/favourites.js
  ./backend/dist/lib/mailer.js
  ./backend/dist/lib/otp.js
  ./backend/dist/lib/pagination.js
  ./backend/dist/lib/prisma.js
  ./backend/dist/lib/queries
  ./backend/dist/lib/queries/schools.js
  ./backend/dist/lib/sanitize.js
  ./backend/dist/lib/tokenBlacklist.js
  ./backend/dist/middleware
  ./backend/dist/middleware/auth.js
  ./backend/dist/middleware/bruteForce.js
  ./backend/dist/middleware/errorHandler.js
  ./backend/dist/middleware/roleCheck.js
  ./backend/dist/middleware/security.js
  ./backend/dist/middleware/upload.js
  ./backend/dist/middleware/validate.js
  ./backend/dist/routes
  ./backend/dist/routes/admin.routes.js
  ./backend/dist/routes/auth.routes.js
  ./backend/dist/routes/favourite.routes.js
  ./backend/dist/routes/inquiry.routes.js
  ./backend/dist/routes/parent.routes.js
  ./backend/dist/routes/schools.routes.js
  ./backend/dist/scripts
  ./backend/dist/scripts/seed-admin.js
  ./backend/dist/server.js
  ./backend/dist/utils
  ./backend/dist/utils/AppError.js
  ./backend/dist/utils/asyncHandler.js
  ./backend/dist/validators
  ./backend/dist/validators/auth.validator.js
  ./backend/dist/validators/school.validator.js
  ./backend/package.json
  ./backend/package-lock.json
  ./backend/prisma
  ./backend/prisma.config.ts
  ./backend/prisma/migrations
  ./backend/prisma/migrations/20250602120000_restructure_schema_add_indexes_reset_token
  ./backend/prisma/migrations/20250602120000_restructure_schema_add_indexes_reset_token/migration.sql
  ./backend/prisma/migrations/20260608172242_add_draft_status
  ./backend/prisma/migrations/20260608172242_add_draft_status/migration.sql
  ./backend/prisma/migrations/migration_lock.toml
  ./backend/prisma/schema.prisma
  ./backend/render.yaml
  ./backend/scripts
  ./backend/src
  ./backend/src/config
  ./backend/src/config/production.ts
  ./backend/src/controllers
  ./backend/src/controllers/admin.controller.ts
  ./backend/src/controllers/auth.controller.ts
  ./backend/src/controllers/favourite.controller.ts
  ./backend/src/controllers/inquiry.controller.ts
  ./backend/src/controllers/parent.controller.ts
  ./backend/src/controllers/schools.controller.ts
  ./backend/src/lib
  ./backend/src/lib/account-status.ts
  ./backend/src/lib/cache.ts
  ./backend/src/lib/favourites.ts
  ./backend/src/lib/mailer.ts
  ./backend/src/lib/otp.ts
  ./backend/src/lib/pagination.ts
  ./backend/src/lib/prisma.ts
  ./backend/src/lib/queries
  ./backend/src/lib/queries/schools.ts
  ./backend/src/lib/sanitize.ts
  ./backend/src/lib/tokenBlacklist.ts
  ./backend/src/middleware
  ./backend/src/middleware/auth.ts
  ./backend/src/middleware/bruteForce.ts
  ./backend/src/middleware/errorHandler.ts
  ./backend/src/middleware/roleCheck.ts
  ./backend/src/middleware/security.ts
  ./backend/src/middleware/validate.ts
  ./backend/src/routes
  ./backend/src/routes/admin.routes.ts
  ./backend/src/routes/auth.routes.ts
  ./backend/src/routes/favourite.routes.ts
  ./backend/src/routes/inquiry.routes.ts
  ./backend/src/routes/parent.routes.ts
  ./backend/src/routes/schools.routes.ts
  ./backend/src/scripts
  ./backend/src/scripts/seed-admin.ts
  ./backend/src/server.ts
  ./backend/src/utils
  ./backend/src/utils/AppError.ts
  ./backend/src/utils/asyncHandler.ts
  ./backend/src/validators
  ./backend/src/validators/auth.validator.ts
  ./backend/src/validators/school.validator.ts
  ./backend/tsconfig.json
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
  | Register school | `POST /api/auth/register-school` | User + `PENDING` school, returns JWT; role-specific duplicate email error; school name uniqueness check inside Prisma transaction |
  | Login | `POST /api/auth/login` | Optional `expectedRole`; brute-force guard |
  | Logout | `POST /api/auth/logout` | Blacklists `jti` |
  | Forgot password | `POST /api/auth/forgot-password` | Email + optional `expectedRole`; 6-digit OTP via `sendOtpEmail` (Resend); generic 200 if no match / role mismatch |
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
  | POST | `/forgot-password` | forgotPassword (3/h) | `forgotPassword` — email OTP via Resend (`sendOtpEmail`) |
  | POST | `/verify-reset-otp` | resetPassword (5/h) | `verifyResetOtp` |
  | POST | `/send-otp` | otp (3/10min) | `sendOtp` |
  | POST | `/verify-otp` | auth | `verifyOtp` |
  | POST | `/reset-password` | resetPassword (5/h) | `resetPassword` — requires prior OTP verification |
  | POST | `/logout` | auth middleware | `logout` |
  | GET | `/me` | auth | `getMe` |
  | PATCH | `/me` | auth | `updateMe` |
  | POST | `/google-sync` | auth | `syncGoogleUser` |

  **`POST /register-school`** — Public school self-registration (validated by `registerSchoolSchema`).

  - Creates `SCHOOL_ADMIN` user + school with `status: PENDING`.
  - **Duplicate email:** role-specific conflict message (`SCHOOL_ADMIN` → sign in instead; other roles → use different email).
  - **Duplicate school name:** case-insensitive uniqueness check inside Prisma `$transaction`.
  - **Fields:** `establishedYear`, `totalStudents`, `transportFee`, `hostelFee` (plus existing fee and profile fields).
  - Returns JWT for immediate frontend sign-in.

  ### `/api/schools`

  | Method | Path | Auth | Handler |
  |--------|------|------|---------|
  | GET | `/` | Public | `getSchools` — filters: `city`, `board` (multi-value), `schoolType`, `medium`, `search`, `status` |
  | GET | `/search` | Public | `searchSchools` |
  | GET | `/cities` | Public | `getCities` — distinct approved cities (cached) |
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
  | GET | `/schools` | `getAdminSchools` — paginated list; query: `page`, `limit`, `status`, `search` |
  | GET | `/check-owner` | `checkOwnerEmail` — query: `email` |
  | GET | `/users` | `getAdminUsers` |
  | GET | `/inquiries` | `getAdminInquiries` |
  | PATCH | `/schools/:id/approve` | `approveSchoolById` |
  | PATCH | `/schools/:id/reject` | `rejectSchoolById` |
  | POST | `/approve` | `approveSchool` (legacy body) |
  | POST | `/reject` | `rejectSchool` (legacy body) |
  | POST | `/add-school` | `addSchoolDirect` |
  | PATCH | `/users/:id/role` | `updateUserRole` |
  | PATCH | `/users/:id/status` | `updateUserStatus` |

  **Admin add-school support endpoints**

  - **`GET /schools`** — `search` filters with case-insensitive `contains` on school `name`, `city`, and owner `email`. Used by the frontend add-school wizard (via BFF) to detect duplicate names; the client applies an exact case-insensitive name match on the returned rows.
  - **`GET /check-owner?email=`** — Returns `{ exists: false }` or `{ exists: true, role, name?, hasSchool?, school? }`. Blocks wizard advance when the email is already a `SCHOOL_ADMIN` with an existing school.
  - **`POST /add-school`** — Creates or reuses owner by `ownerEmail`; optional `ownerPassword` for new accounts (random password if omitted). Creates school with `status: APPROVED` immediately. Required body fields include `ownerEmail`, `name`, `city`, `state`, `address`, `board`, `schoolType`, `medium`, `classesFrom`, `classesTo`, `phone`; fees and other fields optional.

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
  | `SchoolStatus` | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED` |
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
  | `mailer.ts` | Resend password reset OTP via `sendOtpEmail` |
  | `tokenBlacklist.ts` | In-memory jti blacklist (max 10k) |
  | `favourites.ts` | Shared add/remove/list for both favourite APIs |
  | `cache.ts` | In-memory TTL (list 60s, detail 300s, stats 30s) |
  | `pagination.ts` | Page/limit helpers |
  | `queries/schools.ts` | Selects, filters, cursor pagination |
  | `sanitize.ts` | Input sanitization |
  | `account-status.ts` | Disabled account sentinel |

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

  ---

  **SchoolFinder API** — Express REST backend for school discovery across India.
