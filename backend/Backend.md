# Lakshya One — Backend Documentation

  > Last updated: June 30, 2026
  > Stack: Express.js 5 · TypeScript · Prisma 5 · PostgreSQL/Neon · JWT · Brevo · Fast2SMS · Sentry
  > Default port: `4000`
  > Repository path: `backend/`
  > Schema owner: `backend/prisma/schema.prisma`

  The backend is a stateless REST API and the single source of truth for authentication, authorization, school data, advanced 22-section school profile data, inquiries/leads, contact submissions, featured listing control, nearby-school discovery, homepage browse filter data, admin moderation, admin user-account editing with session invalidation, and operational error monitoring.

  Future-only modules such as Blog CMS, Razorpay payment verification, direct WhatsApp routing, reviews, and real AI recommendations are documented separately in `Future-Features.md`.

  ### Recent documentation update — June 30, 2026

  This documentation now includes the latest homepage browse/API sync notes:

  - The public school list response must expose `managementType` for the homepage Management Type dropdown.
  - The public school list filter layer supports the `managementType` query parameter when routed from frontend filters.
  - `mapSchoolListItem` returns `managementType` along with board, state, city, medium, fee, location, featured, and facilities-count data.
  - Controller cache keys should include `managementType` when public list filtering is used, so filtered results are cached separately.
  - The About page is frontend-only static content and does not require any backend route, model, controller, or API changes.

  ### Recent documentation update — Admin Edit User Account feature

  - FULL_ACCESS admins can now edit a School Admin's or Parent's account credentials (name, email, phone, password) from `/admin/users` via a new "Edit" button → modal.
  - Changing email or password force-invalidates all of that user's existing sessions across every device, via a new `User.tokenVersion` mechanism.
  - New endpoint: `PATCH /api/admin/users/:id/account` (min level `FULL_ACCESS`).
  - Every authenticated request now does one extra indexed PK lookup (`tokenVersion` check) inside the `auth` middleware.


  ---

  ## Table of Contents

  1. [Architecture Overview](#1-architecture-overview)
  2. [Tech Stack](#2-tech-stack)
  3. [Folder Structure](#3-folder-structure)
  4. [Request Lifecycle](#4-request-lifecycle)
  5. [Authentication and Authorization](#5-authentication-and-authorization)
  6. [API Endpoints](#6-api-endpoints)
  7. [Controllers](#7-controllers)
  8. [Middleware](#8-middleware)
  9. [Validation Layer](#9-validation-layer)
  10. [Database Schema](#10-database-schema)
  11. [School Query Layer](#11-school-query-layer)
  12. [Inquiry and Lead System](#12-inquiry-and-lead-system)
  13. [Spam Protection](#13-spam-protection)
  14. [Featured Listings](#14-featured-listings)
  15. [Nearby Schools](#15-nearby-schools)
  16. [Contact Submissions](#16-contact-submissions)
  17. [Caching](#17-caching)
  18. [Error Handling and Sentry](#18-error-handling-and-sentry)
  19. [File Storage](#19-file-storage)
  20. [Environment Variables](#20-environment-variables)
  21. [Deployment](#21-deployment)
  22. [Current Backend Features](#22-current-backend-features)
  23. [Admin Edit User Account (Name, Email, Phone, Password)](#23-admin-edit-user-account-name-email-phone-password)

  ---

  ## 1. Architecture Overview

  ```txt
  Client / Next.js frontend
      │
      │ HTTPS + Bearer JWT / admin cookie proxy
      ▼
  Express API
      ├── Security middleware
      ├── Rate limiters
      ├── JWT auth middleware (now also checks User.tokenVersion)
      ├── Role + admin access guards
      ├── Zod validation + sanitization
      ├── Controllers
      ├── Prisma query layer
      ├── Cache helpers
      ├── Sentry error capture
      └── PostgreSQL/Neon
  ```

  ### Backend responsibilities

  | Area | Responsibility |
  |---|---|
  | Auth | Parent, school admin, platform admin login/register/reset/OTP |
  | Authorization | Role checks, admin access levels, super admin protection |
  | Schools | Public listing, detail, filters including `managementType`, coordinates, nearby, featured ordering, homepage browse data, and full 22-section profile persistence |
  | School admin | Own school profile CRUD, custom profile sections, gallery URLs, inquiry status updates |
  | Parents | Profile, favourites, sent inquiries |
  | Admin | Stats, moderation, users, add school/parent/admin, visibility, featured, user account credential editing with forced session invalidation |
  | Contact | Contact page submissions saved to DB |
  | Monitoring | Sentry capture for unexpected errors/crashes |

  ---

  ## 2. Tech Stack

  | Technology | Purpose |
  |---|---|
  | Express.js 5 | HTTP API |
  | TypeScript | Type safety |
  | Prisma 5 | ORM and migrations |
  | PostgreSQL / Neon | Database |
  | JWT | API authentication |
  | bcryptjs | Password hashing |
  | Zod | Request validation |
  | Helmet | Security headers |
  | express-rate-limit | Rate limiting |
  | compression | Response compression |
  | Brevo | Password reset OTP email |
  | Fast2SMS | Phone OTP SMS |
  | Sentry Node SDK | Error monitoring |

  ---

  ## 3. Folder Structure

  ```txt
  backend/
  ├── .env
  ├── .env.example
  ├── .gitignore
  ├── Backend.md
  ├── package-lock.json
  ├── package.json
  ├── render.yaml
  ├── tsconfig.json
  ├── prisma/
  │   ├── schema.prisma                 # Single source of truth for DB schema
  │   └── migrations/
  │       ├── ...                       # Existing migration folders
  │       ├── add_admin_access_level/
  │       ├── add_super_admin_visibility_audit/
  │       ├── add_contact_submission/
  │       ├── add_featured_fields/
  │       ├── add_inquiry_lead_statuses/
  │       ├── add_school_coordinates/
  │       ├── sync_school_profile_manual_columns/       # Languages, recognition, uniform, canteen, custom groups
  │       ├── add_contact_json_fields/                  # admissionCoordinators + additionalPhones
  │       ├── add_medium_board_fee_social_fields/       # mediumOther, stateBoardName, earlyChildhoodFee, socialLinks
  │       └── add_user_token_version/                   # User.tokenVersion for admin-forced session invalidation
  ├── generated/
  │   └── prisma/                       # Generated Prisma client, gitignored
  └── src/
      ├── server.ts                     # Entry point, Sentry init, route mounts, health checks
      ├── config/
      │   └── production.ts             # Startup env validation
      ├── routes/
      │   ├── auth.routes.ts            # Auth/register/login/reset/OTP routes
      │   ├── schools.routes.ts         # Public school APIs + nearby endpoint
      │   ├── admin.routes.ts           # Admin moderation/users/featured/visibility/account routes
      │   ├── inquiry.routes.ts         # Parent inquiry + lead status routes
      │   ├── favourite.routes.ts       # Legacy favourites API with deprecation header
      │   ├── parent.routes.ts          # Preferred parent profile/favourite/inquiry routes
      │   └── contact.routes.ts         # Contact form submission route
      ├── controllers/
      │   ├── auth.controller.ts        # Register/login/logout/reset/OTP/me/google-sync
      │   ├── schools.controller.ts     # Listing/detail/update/gallery/nearby logic
      │   ├── admin.controller.ts       # Stats/moderation/users/visibility/featured/direct create/account edit
      │   ├── inquiry.controller.ts     # Inquiry create/list/status/monthly lead stats
      │   ├── favourite.controller.ts   # Legacy favourite handlers
      │   ├── parent.controller.ts      # Parent profile/favourites/inquiries
      │   └── contact.controller.ts     # ContactSubmission DB save
      ├── middleware/
      │   ├── auth.ts                   # JWT verification + blacklist guard + tokenVersion check
      │   ├── roleCheck.ts              # requireRole, requireAdminLevel, super admin block
      │   ├── security.ts               # Helmet, CORS, global/auth/contact/inquiry rate limits
      │   ├── validate.ts               # Zod validation + sanitize
      │   ├── bruteForce.ts             # Login throttling
      │   └── errorHandler.ts           # Standard errors + Sentry capture
      ├── validators/
      │   ├── auth.validator.ts         # Auth/admin/user validation, role transition guard, adminUpdateUserSchema
      │   ├── school.validator.ts       # 22-section school profile + custom groups/contact JSON + featured/coordinates validation + mediumOther
      │   ├── inquiry.validator.ts      # Inquiry create/status validation + spam fields
      │   └── contact.validator.ts      # Contact form validation: name/email/phone/message
      ├── lib/
      │   ├── prisma.ts                 # DB client + SSL pool
      │   ├── cache.ts                  # In-memory TTL cache + invalidation
      │   ├── mailer.ts                 # Brevo OTP email via raw https
      │   ├── otp.ts                    # OTP generate/verify + Fast2SMS
      │   ├── tokenBlacklist.ts         # JWT jti blacklist + cleanup interval
      │   ├── favourites.ts             # Shared favourite logic
      │   ├── pagination.ts             # Page/limit helpers
      │   ├── sanitize.ts               # HTML stripping from request bodies
      │   ├── account-status.ts         # Disabled account sentinel helpers
      │   ├── auditLog.ts               # writeAuditLog helper used by admin controller
      │   ├── auth-helpers.ts           # getUserTokenVersion(userId) — isolated DB lookup for session invalidation checks
      │   └── queries/
      │       └── schools.ts            # Public/admin selects, filters, mappers, profile JSON fields, featured/coordinate fields
      ├── utils/
      │   ├── AppError.ts               # Typed error factory
      │   └── asyncHandler.ts           # Async route wrapper
      └── scripts/
          ├── seed-admin.ts             # Initial admin seeder
          └── seed-super-admin.ts       # One-time super admin flag setter
  ```

  ### Folder Responsibility Map

  | Folder / File | Responsibility |
  |---|---|
  | `src/server.ts` | Express app setup, Sentry setup, health/ready routes, route mounting, process error hooks |
  | `src/routes/` | HTTP route definitions only; business logic stays in controllers |
  | `src/controllers/` | Business logic, Prisma writes, audit logs, cache invalidation |
  | `src/middleware/` | Security, auth, role/admin-level gates, validation wrapper, error pipeline |
  | `src/validators/` | Zod schemas for body/query validation |
  | `src/lib/queries/schools.ts` | Central school select/filter/mapper layer for public/admin/profile/featured/nearby data |
  | `src/lib/cache.ts` | In-memory cache for public school data, city/state/board lists, admin stats |
  | `src/lib/prisma.ts` | Prisma client and Neon/Postgres connection configuration |
  | `src/lib/auth-helpers.ts` | Isolated `getUserTokenVersion(userId)` lookup, used by `auth` middleware to detect admin-forced session invalidation |
  | `prisma/schema.prisma` | Database models/enums: User, School, Inquiry, Favourite, ContactSubmission, AdminAuditLog, etc. |
  | `prisma/migrations/` | Versioned database changes for access levels, contact, featured, inquiry status, coordinates, token version |

  ---

  ## 4. Request Lifecycle

  ```txt
  HTTP Request
      │
      ▼
  Security middleware + CORS + Helmet
      │
      ▼
  JSON parser + compression
      │
      ▼
  Global and route-specific rate limiters
      │
      ▼
  Auth / role / admin-level guards if protected
      │
      ▼
  Zod validation + sanitization
      │
      ▼
  Controller
      │
      ├── Prisma / query helpers
      ├── Cache helper
      ├── Audit log where required
      └── Response
  ```

  Error flow:

  ```txt
  Controller error → asyncHandler → errorHandler → Sentry if unhandled → clean JSON response
  ```

  ---

  ## 5. Authentication and Authorization

  ### Roles

  ```txt
  PARENT
  SCHOOL_ADMIN
  ADMIN
  ```

  ### Admin access levels

  ```txt
  READ_ONLY
  READ_WRITE
  FULL_ACCESS
  ```

  ### JWT payload

  ```txt
  id
  role
  email
  jti
  tokenVersion      // all roles — used for admin-forced session invalidation
  adminAccessLevel  // ADMIN only
  isSuperAdmin      // ADMIN only
  ```

  ### Super admin rules

  - Only one super admin can exist.
  - Super admin is created through seed script / DB path only.
  - Add-admin API cannot create super admin.
  - Super admin cannot be deleted.
  - Super admin role/status/access cannot be modified through APIs.
  - Backend always re-checks DB; frontend session is only UX gating.

  ### Admin permission map

  | Level | Can do |
  |---|---|
  | READ_ONLY | View stats, schools, users, inquiries |
  | READ_WRITE | READ_ONLY + approve/reject, add school/parent, list/unlist, featured toggle |
  | FULL_ACCESS | Everything + delete, role/status changes, add admin, edit user account credentials |

  ### Session invalidation via `tokenVersion`

  - `User.tokenVersion` (`Int @default(0)`) is the source of truth for session validity.
  - `signAccessToken()` embeds the user's current `tokenVersion` into every issued JWT.
  - The `auth` middleware, after verifying the JWT signature, does a DB lookup via `getUserTokenVersion()` (`src/lib/auth-helpers.ts`) and compares it against the token's embedded `tokenVersion`.
  - A mismatch returns `401` (`Errors.InvalidToken()`) — the session is treated as invalidated, regardless of device.
  - `tokenVersion` is incremented by `1` whenever a FULL_ACCESS admin changes a user's email or password via `PATCH /api/admin/users/:id/account`. This immediately invalidates every previously issued JWT for that user, forcing re-login everywhere.
  - Trade-off accepted: one extra indexed PK DB read per authenticated request. Caching was intentionally skipped for now (low traffic / early stage); can be added later via `lib/cache.ts`'s `withCache()` without touching the middleware contract.

  ---

  ## 6. API Endpoints

  ### Health

  | Method | Path | Purpose |
  |---|---|---|
  | GET | `/health` | DB health check |
  | GET | `/ready` | Readiness check |

  ### Auth — `/api/auth`

  | Method | Path | Purpose |
  |---|---|---|
  | POST | `/register-parent` | Register parent |
  | POST | `/register-school` | Register school admin + pending school |
  | POST | `/login` | Role-aware login |
  | POST | `/logout` | Blacklist JWT jti |
  | GET | `/me` | Current user |
  | PATCH | `/me` | Update current user |
  | POST | `/forgot-password` | Send email OTP |
  | POST | `/verify-reset-otp` | Verify reset OTP |
  | POST | `/reset-password` | Reset password |
  | POST | `/send-otp` | Send phone OTP |
  | POST | `/verify-otp` | Verify phone OTP |
  | POST | `/google-sync` | Sync Google parent user |

  ### Schools — `/api/schools`

  | Method | Path | Purpose |
  |---|---|---|
  | GET | `/` | Public school list with filters, `managementType`, and featured ordering |
  | GET | `/search` | Public search endpoint |
  | GET | `/cities` | Approved + visible distinct cities, optional state filter |
  | GET | `/nearby` | Nearby schools by coordinates |
  | GET | `/my-school` | School admin own school |
  | POST | `/my-school/images` | Add gallery image URL |
  | DELETE | `/images/:id` | Delete gallery image |
  | GET | `/:slug` | Public school detail |
  | POST | `/` | Create school |
  | PATCH | `/:id` | Update school |
  | DELETE | `/:id` | Delete school |

  ### Admin — `/api/admin`

  | Method | Path | Min Level | Purpose |
  |---|---|---|---|
  | GET | `/stats` | READ_ONLY | Dashboard stats |
  | GET | `/schools` | READ_ONLY | Paginated school list |
  | GET | `/schools/states` | READ_ONLY | Distinct states for admin filter |
  | GET | `/schools/cities` | READ_ONLY | Distinct cities for admin filter |
  | GET | `/users` | READ_ONLY | Paginated users by role |
  | GET | `/inquiries` | READ_ONLY | Cross-school inquiries |
  | GET | `/check-owner` | READ_ONLY | Email/owner duplicate check |
  | PATCH | `/schools/:id/approve` | READ_WRITE | Approve school |
  | PATCH | `/schools/:id/reject` | READ_WRITE | Reject school |
  | PATCH | `/schools/:id/visibility` | READ_WRITE | Toggle public visibility |
  | PATCH | `/schools/:id/featured` | READ_WRITE | Mark/unmark featured |
  | POST | `/add-school` | READ_WRITE | Add approved school |
  | POST | `/add-parent` | READ_WRITE | Add parent |
  | POST | `/add-admin` | FULL_ACCESS | Add admin |
  | PATCH | `/schools/:id` | FULL_ACCESS | Edit school |
  | DELETE | `/schools/:id` | FULL_ACCESS | Delete school |
  | DELETE | `/users/:id` | FULL_ACCESS | Delete user |
  | PATCH | `/users/:id/role` | FULL_ACCESS | Update user role |
  | PATCH | `/users/:id/status` | FULL_ACCESS | Enable/disable user |
  | PATCH | `/users/:id/account` | FULL_ACCESS | Edit user's name/email/phone/password; force-invalidates sessions on email/password change |

  ### Inquiries — `/api/inquiries`

  | Method | Path | Auth | Purpose |
  |---|---|---|---|
  | POST | `/` | PARENT | Create inquiry with spam protection |
  | GET | `/my` | PARENT | Parent sent inquiries |
  | GET | `/school/:schoolId` | SCHOOL_ADMIN/ADMIN | School inquiries |
  | PATCH | `/:id/status` | SCHOOL_ADMIN/ADMIN | Update lead status |

  ### Parent — `/api/parent`

  | Method | Path | Purpose |
  |---|---|---|
  | GET | `/profile` | Parent profile |
  | PATCH | `/profile` | Update parent profile |
  | GET | `/favourites` | Saved schools |
  | POST | `/favourites` | Add favourite |
  | DELETE | `/favourites` | Remove favourite |
  | GET | `/inquiries` | Parent inquiries |

  ### Contact — `/api/contact`

  | Method | Path | Purpose |
  |---|---|---|
  | POST | `/` | Save contact form submission |

  ---

  ## 7. Controllers

  | Controller | Responsibility |
  |---|---|
  | `auth.controller.ts` | Register, login, logout, OTP, password reset, Google sync, profile |
  | `schools.controller.ts` | Public list/detail/search/cities/nearby, school CRUD, gallery URLs |
  | `admin.controller.ts` | Stats, moderation, users, direct add flows, visibility, featured, audit logs, `updateUserAccount` (name/email/phone/password edit + tokenVersion bump) |
  | `inquiry.controller.ts` | Inquiry creation, lead status, parent/school/admin inquiry lists |
  | `parent.controller.ts` | Parent profile, favourites, inquiries |
  | `favourite.controller.ts` | Legacy favourite route support |
  | `contact.controller.ts` | Contact form DB save |

  ### `admin.controller.ts` — `updateUserAccount(req, res)`

  - Fetches the target user; returns 404 if not found.
  - Blocks the request if `target.isSuperAdmin` (defense-in-depth; the `blockIfSuperAdminTarget` middleware also blocks this).
  - Checks for an email duplicate via `findUnique` by email → 409 if taken by another user.
  - Phone duplicate check is **intentionally skipped** — `phone` has no `@unique` constraint in the schema and is deliberately kept as a soft field.
  - Builds a dynamic `data` object so only fields actually sent in the request are updated.
  - Hashes any sent password with bcrypt (`BCRYPT_ROUNDS` env var, default `12`).
  - If email or password changed, sets `data.tokenVersion = { increment: 1 }`, forcing re-login on every device.
  - Writes an audit log entry via `writeAuditLog` (`../lib/auditLog`): action `USER_ACCOUNT_UPDATED`, with a `changedFields` array (password is logged only as `"password changed"`, never the value or hash).
  - Responds with the updated user object; password is excluded (never selected), and the response includes `accountStatus` via the existing `isAccountDisabled()` check.

  ---

  ## 8. Middleware

  | Middleware | Purpose |
  |---|---|
  | `applySecurityMiddleware` | Helmet, CORS, method guard |
  | `generalRateLimiter` | Global request limit |
  | `authRateLimiter` | Auth endpoint limit |
  | `forgotPasswordRateLimiter` | Forgot password limit |
  | `resetPasswordRateLimiter` | Reset password limit |
  | `otpRateLimiter` | OTP limit |
  | `inquiryRateLimiter` | Inquiry spam protection |
  | `auth` | JWT verification + `tokenVersion` DB check for forced session invalidation |
  | `requireRole` | Role guard |
  | `requireAdminLevel` | Admin permission guard |
  | `blockIfSuperAdminTarget` | Protect super admin account |
  | `validate` | Zod validation |
  | `bruteForceGuard` | Login brute-force protection |
  | `errorHandler` | Standard error response + Sentry capture |
  | `notFoundHandler` | 404 handler |

  ---

  ## 9. Validation Layer

  Validators:

  ```txt
  backend/src/validators/auth.validator.ts
  backend/src/validators/school.validator.ts
  backend/src/validators/inquiry.validator.ts
  backend/src/validators/contact.validator.ts
  ```

  Important validation:

  - Email format.
  - Password strength.
  - Admin access level.
  - Role transition rules.
  - `adminUpdateUserSchema` (in `auth.validator.ts`): `name`, `email`, `phone`, `password` all optional, `.strict()`, with a `.refine()` requiring at least one field to be present. Exported as `AdminUpdateUserInput` type.
  - School profile 22-section fields.
  - Indian school categories, classes offered, languages offered, timings, recognition, affiliation, uniform, canteen, and profile metadata.
  - Facilities/sports custom group maps for reload-safe custom checkbox placement.
  - Admission coordinator JSON array and additional phone JSON array.
  - Board result model using `classLevel` + `passPercent`.
  - `mediumOther` string field — saved when `medium === "OTHER"`, cleared otherwise (handled in `buildManualSchoolFields` in controller).
  - `stateBoardName` string field — saved when `board === "STATE_BOARD"`, cleared otherwise.
  - `socialLinks` JSON array — array of `{ platform, url }` objects.
  - `earlyChildhoodFee` integer field — fee for Daycare/Toddler/Play Group/Pre-Nursery group.
  - Latitude range: `-90` to `90`.
  - Longitude range: `-180` to `180`.
  - Inquiry honeypot/spam fields.
  - Contact form fields.

  ### Key validator notes

  `mediumOther` is NOT in the Zod `schoolBodyFields` object — it is intentionally bypassed via `buildManualSchoolFields` in `schools.controller.ts` which reads it directly from `rawBody`. This avoids Zod stripping the field since `MediumType` enum only accepts known values.

  `auth.validator.ts` — `registerSchoolSchema` medium enum includes `"OTHER"` to match the full `MediumType` enum in schema.

  `auth.validator.ts` — `adminUpdateUserSchema` is `.strict()` so unexpected keys are rejected, and uses `.refine()` to ensure the request body isn't empty (at least one of `name`/`email`/`phone`/`password` must be present).

  Validation error response:

  ```json
  {
    "success": false,
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "email": ["Invalid email"]
    }
  }
  ```

  ---

  ## 10. Database Schema

  ### Enums

  | Enum | Values |
  |---|---|
  | `Role` | PARENT, SCHOOL_ADMIN, ADMIN |
  | `AdminAccessLevel` | READ_ONLY, READ_WRITE, FULL_ACCESS |
  | `SchoolStatus` | DRAFT, PENDING, APPROVED, REJECTED |
  | `BoardType` | CBSE, ICSE, IB, IGCSE, NIOS, STATE_BOARD, OTHER |
  | `SchoolType` | BOYS, GIRLS, CO_ED |
  | `MediumType` | HINDI, ENGLISH, BOTH, OTHER |
  | `InquiryStatus` | NEW, CONTACTED, INTERESTED, CONVERTED, CLOSED |

  ### Main models

  | Model | Purpose |
  |---|---|
  | `User` | Auth users and role data, including `tokenVersion` for forced session invalidation |
  | `School` | School listing/profile data |
  | `SchoolImage` | Gallery image URLs |
  | `BoardResult` | Board results section |
  | `Scholarship` | Scholarships section |
  | `SchoolFAQ` | FAQ section |
  | `SchoolDownload` | Downloads section |
  | `SchoolCustomField` | Custom section fields |
  | `Inquiry` | Parent-to-school leads |
  | `Favourite` | Parent saved schools |
  | `ContactSubmission` | Contact page submissions |
  | `AdminAuditLog` | Admin action audit trail |

  ### `User` model — `tokenVersion` field

  ```txt
  User.tokenVersion Int @default(0)
  ```

  - Migration: `add_user_token_version`.
  - Source of truth for session invalidation. Incremented whenever an admin changes a user's email or password via `PATCH /api/admin/users/:id/account`; every previously issued JWT becomes invalid immediately (regardless of device/session).
  - Compared against the `tokenVersion` embedded in each JWT by the `auth` middleware on every authenticated request.

  ### Important `School` fields

  ```txt
  id
  name
  slug
  address
  city
  state
  pincode
  board
  stateBoardName        ← stores selected state board name when board = STATE_BOARD
  schoolType
  medium
  mediumOther           ← stores custom medium text when medium = OTHER
  classesFrom
  classesTo
  classesOffered
  schoolCategory
  managementType        ← used by homepage Management Type filter and public list payload
  schoolFormat
  phone
  email
  website
  logoUrl
  coverImageUrl
  description
  status
  isVisible
  isFeatured
  featuredUntil
  latitude
  longitude
  ownerId
  createdAt
  updatedAt
  ```

  ### School profile fields added / synced

  ```txt
  languagesOffered
  recognitionNumber
  affiliatedSince
  uniformPolicy
  canteenAvailable
  startTime
  endTime
  workingDays
  studentTeacherRatio
  totalStudents
  establishedYear
  managementType
  affiliationNumber
  mediumOther
  stateBoardName
  earlyChildhoodFee
  socialLinks
  ```

  ### Reload-safe custom group fields

  ```txt
  facilityCustomGroups Json?
  sportsCustomGroups Json?
  ```

  These fields preserve the exact subsection/group where custom Facilities and Sports items were added.

  Example:

  ```json
  {
    "facilityCustomGroups": {
      "Classrooms & Labs": ["AI Lab"],
      "Health & Safety": ["Emergency Exit Training"]
    },
    "sportsCustomGroups": {
      "Outdoor Sports": ["Pickleball"],
      "Indoor Sports": ["E-Sports"]
    }
  }
  ```

  ### Admission and contact JSON fields

  ```txt
  admissionCoordinators Json?
  additionalPhones Json?
  socialLinks Json?
  ```

  `admissionCoordinators` stores repeatable coordinator rows from the frontend. The first coordinator is also copied into the legacy single fields for backward compatibility:

  ```txt
  admissionCoordinatorName
  admissionPhone
  admissionEmail
  ```

  `additionalPhones` stores repeatable labelled phone numbers from the contact section.

  `socialLinks` stores dynamic social media links as `{ platform: string, url: string }[]`.

  ### Fee structure fields

  ```txt
  averageAnnualFee Int?       ← simple mode: one average fee
  earlyChildhoodFee Int?      ← Daycare / Toddler / Play Group / Pre-Nursery
  prePrimaryFee Int?          ← Nursery – UKG
  class1to5Fee Int?
  class6to8Fee Int?
  class9to10Fee Int?
  class11to12Fee Int?
  ```

  ### BoardResult fields

  ```txt
  id
  schoolId
  year
  classLevel        ← "CLASS_10" | "CLASS_12"
  passPercent
  topperName
  topperScore
  ```

  ### ContactSubmission fields

  ```txt
  id
  name
  email
  phone
  message
  createdAt
  ```

  ### Featured listing fields

  ```txt
  School.isFeatured Boolean @default(false)
  School.featuredUntil DateTime?
  ```

  ### Coordinate fields

  ```txt
  School.latitude Float?
  School.longitude Float?
  @@index([latitude, longitude])
  ```

  ### Inquiry status values

  ```txt
  NEW
  CONTACTED
  INTERESTED
  CONVERTED
  CLOSED
  ```

  ---

  ## 11. School Query Layer

  Main file:

  ```txt
  backend/src/lib/queries/schools.ts
  ```

  Supports:

  - Public school select — includes `stateBoardName`, `mediumOther`, and `managementType`.
  - Public detail select — all 22-section fields including `mediumOther`, `stateBoardName`, `earlyChildhoodFee`, `socialLinks`.
  - Admin school list select (`adminSchoolListSelect`) — includes `stateBoardName`, `mediumOther`, and `managementType`.
  - Full school profile fields for school/admin edit flows.
  - Facilities and sports custom group JSON fields.
  - Admission coordinator and additional phone JSON fields.
  - Social links JSON field.
  - Board result `classLevel/passPercent` fields.
  - Featured fields.
  - Coordinates.
  - `isVisible` public filter.
  - `APPROVED` public status filtering.
  - City/state/board filters — `UP_BOARD` normalised to `STATE_BOARD` in filter layer.
  - Management Type filter via `managementType` query param for homepage/listing integration.
  - Search filter.
  - Featured-only filter.
  - Mapper functions for list item output — `mapSchoolListItem` exposes `stateBoardName`, `mediumOther`, and `managementType`.

  Public listing ordering:

  ```txt
  featured active schools first → newest schools next
  ```

  ---

  ## 12. Inquiry and Lead System

  Inquiry is the platform lead object.

  ### Status flow

  ```txt
  NEW → CONTACTED → INTERESTED → CONVERTED → CLOSED
  ```

  ### Implemented behaviour

  - Parent creates inquiry.
  - School admin sees inquiries for own school.
  - Admin sees cross-school inquiries.
  - School/admin can update status.
  - Parent can see submitted inquiry status.
  - School dashboard can show monthly lead count.

  ---

  ## 13. Spam Protection

  Implemented on inquiry creation:

  - Duplicate inquiry protection by parent/email/phone + school.
  - Phone/email rate limiting.
  - IP rate limiting.
  - Honeypot hidden field protection.
  - Multi-school inquiries remain allowed.

  Business rule:

  ```txt
  Same parent → same school → repeated spam blocked/limited
  Same parent → different schools → allowed
  ```

  ---

  ## 14. Featured Listings

  ### Admin API

  ```txt
  PATCH /api/admin/schools/:id/featured
  ```

  ### Rules

  - Minimum admin level: `READ_WRITE`.
  - Only approved schools can be featured.
  - Pending/rejected schools cannot be featured.
  - Featured status can be manually removed.
  - Featured duration controlled by `featuredUntil`.
  - Audit log entry created.
  - School cache invalidated.

  ### Public behaviour

  - Featured schools appear first in public listing.
  - `featured=true` filter returns active featured schools only.
  - Expired featured schools are excluded from featured-only public output.

  ---

  ## 15. Nearby Schools

  ### API

  ```txt
  GET /api/schools/nearby?lat=&lng=&radius=&limit=&excludeId=
  ```

  ### Query params

  | Param | Rule |
  |---|---|
  | `lat` | Required, `-90` to `90` |
  | `lng` | Required, `-180` to `180` |
  | `radius` | Optional, default 10 km, min 1, max 100 |
  | `limit` | Optional, default 10, max 50 |
  | `excludeId` | Optional current school exclusion |

  ### Behaviour

  - Only approved schools.
  - Only visible schools.
  - Only schools with coordinates.
  - Uses bounding-box prefilter.
  - Calculates Haversine distance.
  - Returns `distanceKm`.
  - Sorts nearest first.

  ---

  ## 16. Contact Submissions

  ### API

  ```txt
  POST /api/contact
  ```

  ### Request body

  ```json
  {
    "name": "Parent Name",
    "email": "parent@example.com",
    "phone": "9876543210",
    "message": "I want to know more about schools."
  }
  ```

  ### Behaviour

  - Request is rate-limited.
  - Input is validated and sanitized.
  - Submission is saved in `ContactSubmission`.
  - Frontend handles EmailJS and Google Sheets webhook after/alongside DB save.

  ---

  ## 17. Caching

  Backend uses in-memory TTL cache.

  | Data | TTL | Invalidated on |
  |---|---:|---|
  | School list/search | 60s | School mutation, visibility, featured update |
  | Homepage browse list/filter data | 60s | School mutation, visibility, featured update |
  | School detail | 300s | School update/delete/visibility/featured update |
  | Cities | 60s | School mutation, visibility update |
  | Admin stats | 30s | School moderation/create |

  Public school list cache keys should include all active filters, including `managementType`, to avoid reusing stale or mismatched filtered results.

  Not cached:

  - Auth.
  - Contact submissions.
  - Inquiries.
  - Favourites.
  - User lists.

  ---

  ## 18. Error Handling and Sentry

  ### Standard error response

  ```json
  {
    "success": false,
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
  ```

  ### Handled error types

  - AppError.
  - Zod validation.
  - Prisma known errors.
  - JWT errors.
  - Malformed JSON.
  - Rate limit errors.
  - Duplicate/conflict errors.

  ### Sentry integration

  Implemented in:

  ```txt
  backend/src/server.ts
  backend/src/middleware/errorHandler.ts
  ```

  Captured:

  - Unknown controller errors.
  - Server startup errors.
  - Health check DB failures.
  - Unhandled promise rejections.
  - Uncaught exceptions.

  Sensitive data cleanup:

  ```txt
  authorization
  Authorization
  cookie
  Cookie
  ```

  Safe behaviour:

  - If `SENTRY_DSN` is blank, backend does not crash.
  - Known operational errors still return clean JSON and are not treated as unexpected crashes.

  ---

  ## 19. File Storage

  Backend does not upload files directly.

  Flow:

  ```txt
  Frontend /api/upload → Cloudinary → URL saved in backend
  ```

  Stored URL fields:

  ```txt
  School.logoUrl
  School.coverImageUrl
  SchoolImage.url
  SchoolDownload.url
  ```

  Backend receives URL strings only.

  ---

  ## 20. Environment Variables

  ```env
  NODE_ENV=
  PORT=
  DATABASE_URL=
  JWT_SECRET=
  JWT_EXPIRES_IN=
  FRONTEND_URL=
  BREVO_API_KEY=
  EMAIL_FROM=
  FAST2SMS_API_KEY=
  ADMIN_EMAIL=
  ADMIN_PASSWORD=
  SUPER_ADMIN_EMAIL=
  BCRYPT_ROUNDS=
  TRUST_PROXY=
  SENTRY_DSN=
  ```

  Important:

  - `JWT_SECRET` must match frontend.
  - `DATABASE_URL` must be Neon/PostgreSQL connection string.
  - `FRONTEND_URL` controls CORS.
  - `SENTRY_DSN` is optional locally.
  - `BCRYPT_ROUNDS` (default `12`) is also used when hashing a new password during admin user-account edits.

  ---

  ## 21. Deployment

  ### Local development

  ```bash
  cd backend
  npm install
  cp .env.example .env
  npx prisma generate
  npm run migrate:dev
  npm run dev
  ```

  API:

  ```txt
  http://localhost:4000
  ```

  Health:

  ```txt
  GET http://localhost:4000/health
  ```

  ### Build

  ```bash
  npm run build
  npm start
  ```

  ### Render

  Typical Render config:

  ```yaml
  buildCommand: npm ci && npx prisma generate && npm run build
  preDeployCommand: npx prisma migrate deploy
  startCommand: npm start
  healthCheckPath: /health
  ```

  > Reminder: `npx prisma migrate dev --name add_user_token_version` must have been run in `backend/` (or deployed via `prisma migrate deploy`) for the `tokenVersion` column to exist in the DB.

  ---

  ## 22. Current Backend Features

  ### Auth

  - Parent registration/login.
  - School admin registration/login.
  - Admin login.
  - Google parent sync.
  - Forgot/reset password by email OTP.
  - Phone OTP endpoints.
  - JWT logout blacklist.
  - Disabled account sentinel.
  - `tokenVersion`-based forced session invalidation across devices when an admin changes a user's email or password.

  ### Schools

  - Public listing/detail/search/cities.
  - Public school list exposes `managementType` for homepage browse filters.
  - City/state/board/managementType filters — UP_BOARD normalised to STATE_BOARD.
  - SEO-friendly data support.
  - Full school profile update.
  - School profile backend sync for languages, categories, classes, timings, recognition, affiliation, uniform policy, canteen, student-teacher ratio, total students, facilities, sports, programs, streams, board results, admissions, and contact data.
  - Reload-safe Facilities/Sports custom group persistence with JSON maps.
  - Multiple admission coordinators stored in `admissionCoordinators` JSON with legacy first-coordinator fallback.
  - Additional labelled phone numbers stored in `additionalPhones` JSON.
  - Dynamic social media links stored in `socialLinks` JSON as `{ platform, url }[]`.
  - Medium "Other" custom text stored in `mediumOther` — set when `medium = OTHER`, cleared otherwise.
  - State board name stored in `stateBoardName` — set when `board = STATE_BOARD`, cleared otherwise.
  - Management type stored in `managementType` and exposed in public/admin school list responses.
  - Grade-wise fee fields: `earlyChildhoodFee`, `prePrimaryFee`, `class1to5Fee`, `class6to8Fee`, `class9to10Fee`, `class11to12Fee`.
  - Gallery URL management.
  - Visibility toggle.
  - Featured listing support.
  - Coordinates and map data.
  - Nearby schools API.

  ### Inquiries/leads

  - Inquiry creation.
  - Duplicate/rate-limit/honeypot spam protection.
  - Status workflow: NEW → CONTACTED → INTERESTED → CONVERTED → CLOSED.
  - Parent inquiry history.
  - School inquiry management.
  - Admin inquiry monitoring.
  - Monthly lead stat support.

  ### Admin

  - Stats.
  - School moderation.
  - Add school.
  - Add parent.
  - Add admin.
  - User management.
  - Delete school/user.
  - Role/status update protections.
  - Super admin protection.
  - Admin audit logs.
  - Admin school list exposes `stateBoardName` for display in board column.
  - Admin school list exposes `managementType` for school ownership/management context.
  - Edit a School Admin's or Parent's account credentials (name, email, phone, password) via `PATCH /api/admin/users/:id/account`, gated to `FULL_ACCESS` and blocked for super admin targets.
  - Email/password changes on a user account force-invalidate all of that user's existing sessions via `tokenVersion` increment.

  ### Static frontend pages

  - About page is frontend-only and does not require backend API, database model, controller, or route changes.
  - Homepage content sections are frontend-composed; only the dynamic browse/featured school data uses existing public school APIs.

  ### Contact

  - Contact form DB submissions.
  - Rate-limited contact endpoint.

  ### Reliability

  - Central error handler.
  - Sentry monitoring.
  - Startup/env validation.
  - Health checks.

  ---

  ## 23. Admin Edit User Account (Name, Email, Phone, Password)

  > Status: Implemented.

  ### Summary

  FULL_ACCESS admins can edit a School Admin's or Parent's account credentials
  (name, email, phone, password) from `/admin/users` via the "Edit" button →
  modal. Changing email or password force-invalidates all of that user's
  existing sessions across every device, via the `User.tokenVersion`
  mechanism.

  ### Schema — `backend/prisma/schema.prisma`

  - Added `tokenVersion Int @default(0)` to the `User` model.
  - Migration: `add_user_token_version`.
  - Purpose: source of truth for session invalidation. Incremented whenever
    an admin changes a user's email or password; every previously issued JWT
    becomes invalid immediately (regardless of device/session).

  ### Validator — `backend/src/validators/auth.validator.ts`

  - Added `adminUpdateUserSchema`: `name`, `email`, `phone`, `password` all
    optional, `.strict()`, `.refine()` requires at least one field.
  - Exported `AdminUpdateUserInput` type.

  ### New helper — `backend/src/lib/auth-helpers.ts`

  - `getUserTokenVersion(userId)`: isolated DB lookup for a user's current
    `tokenVersion`. Centralised so a future cache layer (`lib/cache.ts`
    `withCache()`) can be dropped in later without touching the middleware.

  ### Auth middleware — `backend/src/middleware/auth.ts`

  - `AccessTokenPayload` type: added `tokenVersion?: number`.
  - `signAccessToken()`: now accepts optional `tokenVersion` in its payload.
  - `auth` middleware: after JWT verify, does a DB call via
    `getUserTokenVersion()` and compares against the token's `tokenVersion`.
    Mismatch → 401 (`Errors.InvalidToken()`), i.e. session is treated as
    invalidated.
  - Trade-off accepted: one extra DB read per authenticated request. Decided
    against caching for now (low traffic / early stage); revisit with
    `withCache()` if/when request volume grows.

  ### Auth controller — `backend/src/controllers/auth.controller.ts`

  - All 5 call sites of `signAccessToken()` now pass `tokenVersion`:
    - `registerParent`
    - `registerSchool`
    - `login` (added `tokenVersion: true` to the existing `select`)
    - `verifyOtp` (already a full `findFirst`, no select change needed)
    - `syncGoogleUser` (added `tokenVersion: true` to both `update` and
      `create` selects)
  - `getMe` / `updateMe` untouched — they don't issue new tokens.

  ### Admin controller — `backend/src/controllers/admin.controller.ts`

  - New function: `updateUserAccount(req, res)`.
  - Logic:
    - Fetch target user; 404 if not found.
    - Block if `target.isSuperAdmin` (defense-in-depth; middleware also blocks).
    - Email duplicate check (`findUnique` by email) → 409 if taken by another
      user.
    - **Phone duplicate check intentionally skipped** — `phone` has no
      `@unique` constraint in schema, and is decided to remain a soft field.
    - Builds a dynamic `data` object — only fields actually sent are updated.
    - Password (if sent) is bcrypt-hashed (`BCRYPT_ROUNDS` env, default 12).
    - If email or password changed → `data.tokenVersion = { increment: 1 }`
      (forces re-login everywhere).
    - Audit log via existing `writeAuditLog` helper (`../lib/auditLog`):
      action `USER_ACCOUNT_UPDATED`, `changedFields` array (password is
      logged as `"password changed"`, never the value/hash).
    - Response: updated user object, password excluded (not even selected),
      includes `accountStatus` via existing `isAccountDisabled()` check.

  ### Routes — `backend/src/routes/admin.routes.ts`

  - New route:
    ```
    PATCH /api/admin/users/:id/account
    ```
    Middleware chain: `requireAdminLevel("FULL_ACCESS")` →
    `blockIfSuperAdminTarget` → `validate(adminUpdateUserSchema)` →
    `asyncHandler(updateUserAccount)`
  - Mirrors the existing `/users/:id/role` and `/users/:id/status` routes.

  ### Known follow-ups / things to double check

  - **Disabled-account phone sentinel collision**: if a user's `phone` is
    currently set to the disabled-account sentinel value (used by
    `updateUserStatus` / `isAccountDisabled()`), the edit modal will
    currently show/allow saving that raw sentinel string. Recommended fix:
    pass `currentPhone={isAccountDisabled(user.phone) ? "" : user.phone}` (or
    equivalent) into `UserManagementActions` so the modal doesn't display or
    resubmit the sentinel value.
  - **`tokenVersion` DB-check performance**: every authenticated request now
    does one extra indexed PK lookup. Acceptable at current scale; if/when
    traffic grows, wrap `getUserTokenVersion()` in `lib/cache.ts`'s
    `withCache()` (short TTL, e.g. 30–60s) — no other file needs to change
    for this.
  - **Phone duplicate check**: intentionally not enforced (schema has no
    `@unique` on `phone`). Revisit if `phone` is ever made unique.
  - **Migration reminder**: `npx prisma migrate dev --name add_user_token_version`
    must have been run in `backend/` for `tokenVersion` to exist in the DB.