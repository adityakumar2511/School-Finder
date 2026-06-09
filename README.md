# SchoolFinder

> Last updated: June 9, 2026

A full-stack school discovery and inquiry platform built for **Tier-2 and Tier-3 cities in India**. Parents can search and compare schools; school administrators manage listings and inquiries; platform administrators verify listings and maintain quality.

This repository is a **monorepo** with a Next.js frontend and an Express API. **PostgreSQL is accessed only by the backend** — the frontend has no database driver or Prisma dependency.

| Layer | Technology | Port (local) |
|-------|------------|--------------|
| Frontend | Next.js 14, NextAuth v5 (JWT) | `3000` |
| Backend | Express.js, JWT, Prisma | `4000` |
| Database | PostgreSQL (Neon) | — |
| Media | Cloudinary | — |

**Detailed docs:** [frontend/Frontend.md](frontend/Frontend.md) · [backend/Backend.md](backend/Backend.md)

---

## Table of Contents

1. [Project Introduction](#1-project-introduction)
2. [Project Architecture](#2-project-architecture)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Tech Stack](#4-tech-stack)
5. [Authentication System](#5-authentication-system)
6. [Core Features](#6-core-features)
7. [Design System](#7-design-system)
8. [Environment Variables](#8-environment-variables)
9. [Local Development Setup](#9-local-development-setup)
10. [Deployment Guide](#10-deployment-guide)
11. [Security Features](#11-security-features)
12. [SEO and Performance](#12-seo-and-performance)
13. [License and Contribution](#13-license-and-contribution)

---

## 1. Project Introduction

### What SchoolFinder Is

SchoolFinder helps families discover CBSE, ICSE, and state board schools in one place. Schools gain visibility and receive parent inquiries through a structured dashboard. Administrators approve listings before they appear publicly, which keeps the directory trustworthy.

### Problem Being Solved

In many Tier-2 and Tier-3 cities, school information is fragmented across websites, phone calls, and word of mouth. Parents struggle to compare boards, fees, location, and contact details. Schools lack a simple way to present verified information and respond to interest. SchoolFinder centralizes discovery, comparison, and inquiry management.

### Target Users

| User | Goals |
|------|--------|
| **Parents** | Find schools by city, board, and filters; save favourites; send inquiries |
| **School administrators** | Register a school, update profile and gallery, manage inquiry status |
| **Platform administrators** | Approve or reject schools, manage users, monitor inquiries |

---

## 2. Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Parent / School / Admin                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                               │
│  Next.js 14 App Router · NextAuth v5 (JWT only, no DB adapter)   │
│  backendFetch / adminFetch / BFF proxy routes → Express API      │
│  Upload route → Cloudinary (server-side only)                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS
                                │ NEXT_PUBLIC_API_URL
                                │ Authorization: Bearer <JWT>
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (Render / Railway)                                  │
│  Express · JWT (HS256) · Prisma · Zod · Rate limits · Helmet     │
│  Single source of truth for all database operations              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Neon PostgreSQL                                                 │
│  Schema: backend/prisma/schema.prisma                            │
│  Users · Schools · Inquiries · Favourites · OAuth tables         │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend

- **Next.js 14** (App Router) for SSR, SEO, and role-based dashboards
- **NextAuth v5** with **JWT strategy only** — no Prisma adapter, no `DATABASE_URL`
- All dashboard and authenticated data fetched via **REST API** (`backendFetch`, `adminFetch`, BFF proxies)
- **Cloudinary** uploads handled by a Next.js route handler (`POST /api/upload`)

### Backend

- **Express.js** REST API — **single source of truth** for the database
- **Prisma** owns the schema at `backend/prisma/schema.prisma`
- **JWT** for API authentication (Bearer tokens, role enforcement)
- In-memory response cache with TTL; invalidation on school mutations

### Database

- **Neon PostgreSQL** (serverless-friendly, SSL)
- Schema and migrations managed entirely from **`backend/`**
- Frontend uses local TypeScript enums in `src/lib/types/database.ts` (no generated client)

### Media

- **Cloudinary** for logos, gallery images, and profile photos
- Frontend upload route validates MIME, size, and magic bytes; secrets never exposed to the browser
- Backend stores image URLs via JSON body on school/profile endpoints

---

## 3. Monorepo Structure

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
./docs
./docs/generate-audit-pdf.js
./docs/package.json
./docs/package-lock.json
./docs/SchoolFinder-Codebase-Audit.md
./docs/SchoolFinder-Codebase-Audit.pdf
./frontend
./frontend/.env
./frontend/.env.example
./frontend/.eslintrc.json
./frontend/.gitignore
./frontend/Frontend.md
./frontend/middleware.ts
./frontend/next.config.js
./frontend/next.config.mjs
./frontend/next-env.d.ts
./frontend/package.json
./frontend/package-lock.json
./frontend/postcss.config.mjs
./frontend/src
./frontend/src/app
./frontend/src/app/admin
./frontend/src/app/admin/add-school
./frontend/src/app/admin/add-school/page.tsx
./frontend/src/app/admin/inquiries
./frontend/src/app/admin/inquiries/page.tsx
./frontend/src/app/admin/layout.tsx
./frontend/src/app/admin/page.tsx
./frontend/src/app/admin/schools
./frontend/src/app/admin/schools/page.tsx
./frontend/src/app/admin/users
./frontend/src/app/admin/users/page.tsx
./frontend/src/app/admin-login
./frontend/src/app/admin-login/layout.tsx
./frontend/src/app/admin-login/page.tsx
./frontend/src/app/api
./frontend/src/app/api/admin
./frontend/src/app/api/admin/add-school
./frontend/src/app/api/admin/add-school/route.ts
./frontend/src/app/api/admin/check-owner
./frontend/src/app/api/admin/check-owner/route.ts
./frontend/src/app/api/admin/schools
./frontend/src/app/api/admin/schools/[id]
./frontend/src/app/api/admin/schools/[id]/approve
./frontend/src/app/api/admin/schools/[id]/approve/route.ts
./frontend/src/app/api/admin/schools/[id]/reject
./frontend/src/app/api/admin/schools/[id]/reject/route.ts
./frontend/src/app/api/admin/schools/route.ts
./frontend/src/app/api/admin/session
./frontend/src/app/api/admin/session/route.ts
./frontend/src/app/api/admin/users
./frontend/src/app/api/admin/users/[id]
./frontend/src/app/api/admin/users/[id]/role
./frontend/src/app/api/admin/users/[id]/role/route.ts
./frontend/src/app/api/admin/users/[id]/status
./frontend/src/app/api/admin/users/[id]/status/route.ts
./frontend/src/app/api/auth
./frontend/src/app/api/auth/[...nextauth]
./frontend/src/app/api/auth/[...nextauth]/route.ts
./frontend/src/app/api/auth/logout
./frontend/src/app/api/auth/logout/route.ts
./frontend/src/app/api/parent
./frontend/src/app/api/parent/favourites
./frontend/src/app/api/parent/favourites/route.ts
./frontend/src/app/api/parent/profile
./frontend/src/app/api/parent/profile/route.ts
./frontend/src/app/api/school
./frontend/src/app/api/school/gallery
./frontend/src/app/api/school/gallery/[id]
./frontend/src/app/api/school/gallery/[id]/route.ts
./frontend/src/app/api/school/gallery/route.ts
./frontend/src/app/api/school/inquiries
./frontend/src/app/api/school/inquiries/[id]
./frontend/src/app/api/school/inquiries/[id]/status
./frontend/src/app/api/school/inquiries/[id]/status/route.ts
./frontend/src/app/api/school/profile
./frontend/src/app/api/school/profile/route.ts
./frontend/src/app/api/school/session
./frontend/src/app/api/school/session/route.ts
./frontend/src/app/api/upload
./frontend/src/app/api/upload/route.ts
./frontend/src/app/dashboard
./frontend/src/app/dashboard/school
./frontend/src/app/dashboard/school/inquiries
./frontend/src/app/dashboard/school/inquiries/page.tsx
./frontend/src/app/dashboard/school/layout.tsx
./frontend/src/app/dashboard/school/page.tsx
./frontend/src/app/dashboard/school/profile
./frontend/src/app/dashboard/school/profile/page.tsx
./frontend/src/app/error.tsx
./frontend/src/app/favicon.ico
./frontend/src/app/fonts
./frontend/src/app/fonts/GeistMonoVF.woff
./frontend/src/app/fonts/GeistVF.woff
./frontend/src/app/forgot-password
./frontend/src/app/forgot-password/page.tsx
./frontend/src/app/global-error.tsx
./frontend/src/app/globals.css
./frontend/src/app/layout.tsx
./frontend/src/app/login
./frontend/src/app/login/page.tsx
./frontend/src/app/not-found.tsx
./frontend/src/app/page.tsx
./frontend/src/app/parent
./frontend/src/app/parent/favourites
./frontend/src/app/parent/favourites/FavouritesPagination.tsx
./frontend/src/app/parent/favourites/loading.tsx
./frontend/src/app/parent/favourites/page.tsx
./frontend/src/app/parent/favourites/RemoveFavouriteButton.tsx
./frontend/src/app/parent/inquiries
./frontend/src/app/parent/inquiries/page.tsx
./frontend/src/app/parent/layout.tsx
./frontend/src/app/parent/page.tsx
./frontend/src/app/parent/profile
./frontend/src/app/parent/profile/page.tsx
./frontend/src/app/providers.tsx
./frontend/src/app/register
./frontend/src/app/register/page.tsx
./frontend/src/app/reset-password
./frontend/src/app/reset-password/page.tsx
./frontend/src/app/robots.ts
./frontend/src/app/school-complete-registration
./frontend/src/app/school-complete-registration/page.tsx
./frontend/src/app/school-login
./frontend/src/app/school-login/layout.tsx
./frontend/src/app/school-login/page.tsx
./frontend/src/app/school-register
./frontend/src/app/school-register/page.tsx
./frontend/src/app/schools
./frontend/src/app/schools/[slug]
./frontend/src/app/schools/[slug]/loading.tsx
./frontend/src/app/schools/[slug]/page.tsx
./frontend/src/app/schools/loading.tsx
./frontend/src/app/schools/page.tsx
./frontend/src/app/sitemap.ts
./frontend/src/app/template.tsx
./frontend/src/components
./frontend/src/components/admin
./frontend/src/components/admin/AdminNav.tsx
./frontend/src/components/admin/AdminPagination.tsx
./frontend/src/components/admin/AdminSearchBar.tsx
./frontend/src/components/admin/RoleBadge.tsx
./frontend/src/components/admin/SchoolDetailModal.tsx
./frontend/src/components/admin/SchoolModerationActions.tsx
./frontend/src/components/admin/SchoolStatusBadge.tsx
./frontend/src/components/admin/UserManagementActions.tsx
./frontend/src/components/auth
./frontend/src/components/auth/AuthRoleGuard.tsx
./frontend/src/components/auth/ParentLoginContent.tsx
./frontend/src/components/auth/SchoolLoginContent.tsx
./frontend/src/components/Footer.tsx
./frontend/src/components/HideOnAdminLogin.tsx
./frontend/src/components/home
./frontend/src/components/home/FeaturedSchools.tsx
./frontend/src/components/home/FeaturedSchoolsSkeleton.tsx
./frontend/src/components/home/HomeHero.tsx
./frontend/src/components/home/HomeStats.tsx
./frontend/src/components/motion
./frontend/src/components/motion/fade-in.tsx
./frontend/src/components/motion/stagger-grid.tsx
./frontend/src/components/Navbar.tsx
./frontend/src/components/parent
./frontend/src/components/parent/ParentNav.tsx
./frontend/src/components/parent/ProfileForm.tsx
./frontend/src/components/parent/RecentViewedSchools.tsx
./frontend/src/components/parent/TrackSchoolView.tsx
./frontend/src/components/school
./frontend/src/components/school/InquiryFilters.tsx
./frontend/src/components/school/InquiryPagination.tsx
./frontend/src/components/school/InquiryStatusBadge.tsx
./frontend/src/components/school/InquiryStatusSelect.tsx
./frontend/src/components/school/SchoolDashboardNav.tsx
./frontend/src/components/school/SchoolGalleryManager.tsx
./frontend/src/components/school/SchoolProfileForm.tsx
./frontend/src/components/school/SchoolRegisterWizard.tsx
./frontend/src/components/school/SchoolStatusCard.tsx
./frontend/src/components/SchoolCard.tsx
./frontend/src/components/SchoolFilters.tsx
./frontend/src/components/schools
./frontend/src/components/schools/FavouriteButton.tsx
./frontend/src/components/schools/InquiryModal.tsx
./frontend/src/components/schools/SchoolCardSkeleton.tsx
./frontend/src/components/schools/SchoolGridSkeleton.tsx
./frontend/src/components/seo
./frontend/src/components/seo/JsonLd.tsx
./frontend/src/components/SessionHeartbeat.tsx
./frontend/src/components/ui
./frontend/src/components/ui/badge.tsx
./frontend/src/components/ui/button.tsx
./frontend/src/components/ui/card.tsx
./frontend/src/components/ui/dialog.tsx
./frontend/src/components/ui/empty-state.tsx
./frontend/src/components/ui/input.tsx
./frontend/src/components/ui/label.tsx
./frontend/src/components/ui/PasswordInput.tsx
./frontend/src/components/ui/select.tsx
./frontend/src/components/ui/skeleton.tsx
./frontend/src/components/ui/stat-card.tsx
./frontend/src/components/ui/table.tsx
./frontend/src/components/ui/textarea.tsx
./frontend/src/components/upload
./frontend/src/components/upload/ImageUploadField.tsx
./frontend/src/lib
./frontend/src/lib/admin
./frontend/src/lib/admin/constants.ts
./frontend/src/lib/admin/data.ts
./frontend/src/lib/admin/session.ts
./frontend/src/lib/admin-auth.ts
./frontend/src/lib/api
./frontend/src/lib/api/pagination.ts
./frontend/src/lib/api/proxy.ts
./frontend/src/lib/api/resolve-backend-token.ts
./frontend/src/lib/api/server.ts
./frontend/src/lib/auth.ts
./frontend/src/lib/auth-config.ts
./frontend/src/lib/backend-jwt.ts
./frontend/src/lib/cloudinary.ts
./frontend/src/lib/cloudinary-url.ts
./frontend/src/lib/data
./frontend/src/lib/data/schools-public.ts
./frontend/src/lib/image-placeholder.ts
./frontend/src/lib/logout.ts
./frontend/src/lib/middleware-auth.ts
./frontend/src/lib/motion.ts
./frontend/src/lib/parent
./frontend/src/lib/parent/data.ts
./frontend/src/lib/parent/recent-schools.ts
./frontend/src/lib/parent-token.ts
./frontend/src/lib/revalidate-schools.ts
./frontend/src/lib/school
./frontend/src/lib/school/data.ts
./frontend/src/lib/school/gallery.ts
./frontend/src/lib/school-auth.ts
./frontend/src/lib/seo.ts
./frontend/src/lib/types
./frontend/src/lib/types/database.ts
./frontend/src/lib/upload-client.ts
./frontend/src/lib/upload-security.ts
./frontend/src/lib/utils.ts
./frontend/tailwind.config.ts
./frontend/tsconfig.json
./frontend/vercel.json
./README.md
```

| Folder | Responsibility |
|--------|----------------|
| `frontend/` | Next.js UI, NextAuth, middleware, BFF proxies, Cloudinary upload route |
| `backend/` | Express REST API, Prisma schema, JWT auth, all database access |
| `docs/` | Codebase audit artifacts |

---

## 4. Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 14 | App Router, SSR, BFF API routes |
| TypeScript | Type safety |
| Tailwind CSS | Styling and design tokens |
| shadcn/ui | Accessible UI primitives |
| NextAuth v5 | Authentication (Google + credentials, JWT strategy) |
| Zod + React Hook Form | Form and validation schemas |
| Cloudinary | Image delivery (via server upload route) |
| Framer Motion | Subtle UI motion (respects reduced motion) |

**Not used on frontend:** Prisma, `@prisma/client`, database drivers.

### Backend

| Technology | Purpose |
|------------|---------|
| Express.js 5 | HTTP API |
| TypeScript | Type safety |
| Prisma 5 | ORM (`generated/prisma` client, `@prisma/adapter-pg`) |
| JWT (`jsonwebtoken`) | API token auth (HS256, issuer `schoolfinder-api`) |
| Zod | Request validation |
| Helmet | Security headers (CSP, HSTS) |
| express-rate-limit | General, auth, forgot/reset rate limiting |
| bcryptjs | Password hashing |
| Resend | Password reset emails |
| Fast2SMS | Phone OTP SMS (`POST /api/auth/send-otp`) |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL (Neon) | Primary data store, SSL in production |

---

## 5. Authentication System

Authentication is **split by role**. There is no single shared login page for all users.

### Two-Layer Token Model

| Layer | Purpose | Lifetime |
|-------|---------|----------|
| **NextAuth JWT** | Frontend session for middleware and UI | 30 minutes |
| **Backend Bearer JWT** | API authorization on Express | 7 days (configurable) |

Parents receive a backend token on login (`backendAccessToken` in session). School admins use `session.backendAccessToken` with synchronous `mintBackendJwt()` fallback (`jsonwebtoken` HS256, issuer `schoolfinder-api`). Admins store JWT in HTTP-only cookie `sf_admin_token`.

### Parent (`PARENT`)

| Route | Purpose |
|-------|---------|
| `/login` | Sign in (Google or email/password) |
| `/register` | Create parent account |
| `/forgot-password?role=PARENT` or `?role=SCHOOL_ADMIN` | 3-step OTP password reset (email → OTP → new password), role-isolated via `expectedRole` |

Backend: `POST /api/auth/register-parent`, `POST /api/auth/login` (`expectedRole: "PARENT"`), `POST /api/auth/google-sync`, `POST /api/auth/forgot-password`, `POST /api/auth/verify-reset-otp`, `POST /api/auth/reset-password`. Password reset OTP uses `sendOtpEmail` (Resend) when configured; Brevo is not used.

### School administrator (`SCHOOL_ADMIN`)

| Route | Purpose |
|-------|---------|
| `/school-login` | School admin sign-in |
| `/school-register` | 4-step wizard with localStorage draft (`sf_school_draft_{email}`) and auto sign-in; creates `PENDING` school |
| `/school-complete-registration` | Page for schools with `DRAFT` status |

Backend: `POST /api/auth/register-school` (role-specific duplicate email errors, school name uniqueness check in transaction), `POST /api/auth/login` with `expectedRole: "SCHOOL_ADMIN"`.

### Platform administrator (`ADMIN`)

| Route | Purpose |
|-------|---------|
| `/admin-login` | Hidden route (not linked in public navigation) |
| `/admin/add-school` | Multi-step wizard to add a school directly as `APPROVED` |

Flow: backend login with `expectedRole: "ADMIN"` → JWT in HTTP-only cookie `sf_admin_token` → NextAuth session sync for middleware. Client-side admin mutations (add school, approve/reject, duplicate checks) go through BFF routes under `/api/admin/*` so the browser never reads the HTTP-only cookie.

### Role Separation and Protection

- **Middleware** (`frontend/middleware.ts`) enforces role-based redirects using NextAuth JWT role
- **Backend** uses `auth` + `requireRole()` on protected routes
- Cross-role access redirects to the correct home route
- Unauthenticated dashboard access redirects to the role-specific login with `callbackUrl`

| Role | Default home | Unauthenticated dashboard redirect |
|------|----------------|-------------------------------------|
| `PARENT` | `/` (parent area: `/parent`) | `/login?callbackUrl=…` |
| `SCHOOL_ADMIN` | `/dashboard/school` | `/school-login?callbackUrl=…` |
| `ADMIN` | `/admin` | `/admin-login?callbackUrl=…` |

**Session:** NextAuth JWT max age is 30 minutes. `SessionHeartbeat` refreshes the session every 10 minutes while the tab is open.

---

## 6. Core Features

### Parents

- Search and filter schools: dynamic city dropdown (`GET /api/schools/cities`), board multi-select, school type, medium, text search
- View school detail pages (fees, facilities, gallery, contact)
- Save schools to **favourites** via BFF `/api/parent/favourites` (`FavouriteButton`)
- Send **inquiries** to approved schools
- **Parent dashboard** (`/parent`): profile, favourites, recently viewed, sent inquiries

### Schools

- **Registration wizard** (`SchoolRegisterWizard`): 4 steps with localStorage draft (`sf_school_draft_{email}`), fields `establishedYear`, `totalStudents`, `transportFee`, `hostelFee`, auto sign-in via `signIn("credentials")`
- **DRAFT flow**: `dashboard/school/layout.tsx` redirects `DRAFT` schools to `/school-complete-registration`
- **School dashboard**: inquiry list with status (`NEW`, `CONTACTED`, `CLOSED`)
- **Profile management**: update listing, logo, gallery
- **Status visibility**: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`

### Administrators

- **School moderation**: approve, reject, search and filter listings
- **Add school wizard** (`/admin/add-school`): 4-step form (owner → school info → academic → fees) with per-step React Hook Form validation; owner email check and duplicate school name check before advancing; submits via BFF `POST /api/admin/add-school` using HTTP-only `sf_admin_token` (school created as `APPROVED`)
- **User management**: roles, disable accounts
- **Inquiry monitoring** across the platform
- **Overview stats** on the admin dashboard

---

## 7. Design System

### Typography

- **Headings:** Plus Jakarta Sans (`font-heading`)
- **Body:** Inter (`font-body`)

### Color Palette

- **Primary blue** — trust, navigation, links
- **Amber accent** — CTAs and highlights
- **Neutral gray** — surfaces and borders
- **Semantic** — success, warning, danger, info tokens in Tailwind config

### Responsive Approach

- Mobile-first layouts for search, cards, and dashboards
- Collapsible navigation and scrollable tables on small screens
- Touch-friendly controls on mobile

See [frontend/Frontend.md](frontend/Frontend.md) for the full design system reference.

---

## 8. Environment Variables

Copy from `.env.example` files. **Never commit real secrets.**

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO and sitemap |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (HTTPS in production) |
| `NEXTAUTH_URL` / `AUTH_URL` | NextAuth canonical URL |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | NextAuth session encryption |
| `AUTH_TRUST_HOST` | Required on Vercel (`true`) |
| `JWT_SECRET` | Must match backend — mints Bearer tokens for server-side API calls |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Parent Google OAuth |
| `CLOUDINARY_*` | Server upload route only |

**No `DATABASE_URL` on the frontend.** Database is managed entirely by the backend.

Only `NEXT_PUBLIC_*` variables are exposed to the browser.

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (injected on Render/Railway) |
| `DATABASE_URL` | Neon PostgreSQL with `sslmode=require` |
| `JWT_SECRET` | API token signing (must match frontend `JWT_SECRET`) |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `FRONTEND_URL` | CORS allowlist (comma-separated for multiple origins) |
| `CLOUDINARY_*` | Image upload utilities |
| `RESEND_API_KEY` / `EMAIL_FROM` | Password reset OTP email via Resend (`sendOtpEmail`) |
| `FAST2SMS_API_KEY` | Phone OTP SMS (optional; dev logs OTP if unset) |
| `BCRYPT_ROUNDS` | Password hashing cost (default `12`) |
| `TRUST_PROXY` | Behind reverse proxy in production |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin for `npm run seed:admin` |

See [backend/Backend.md](backend/Backend.md) for the full variable reference including startup validation notes.

---

## 9. Local Development Setup

### Prerequisites

- Node.js 18+
- Neon PostgreSQL (or compatible Postgres)
- Cloudinary account (for uploads)
- Google OAuth credentials (optional, for parent Google login)
- Resend API key (optional locally; password reset emails)
- Fast2SMS API key (optional locally; phone OTP SMS)

### 1. Backend (database owner)

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, FRONTEND_URL, Cloudinary, etc.

npm install
npx prisma generate
npm run migrate:dev    # or: npx prisma migrate deploy (existing DB)
npm run dev
```

API: [http://localhost:4000](http://localhost:4000)  
Health check: `GET http://localhost:4000/health`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
# Set JWT_SECRET to the same value as backend

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. First admin user

**Option A — seeder (recommended):**

```bash
cd backend
# Set ADMIN_EMAIL and ADMIN_PASSWORD in .env
npm run seed:admin
```

Sign in at `/admin-login` with those credentials.

**Option B — manual role update:**

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Then sign in at `/admin-login`.

### Run both services

Use two terminals: frontend on port `3000`, backend on port `4000`.

---

## 10. Deployment Guide

### Database (Neon)

1. Create a Neon project and copy `DATABASE_URL` with `?sslmode=require`.
2. Run migrations from **backend** only:

```bash
cd backend
npx prisma migrate deploy
```

3. Set `DATABASE_URL` on Render (backend). Frontend does **not** need it.

### Backend (Render)

Use `backend/render.yaml` or manual Web Service:

- **Build:** `npm ci && npx prisma generate && npm run build`
- **Pre-deploy:** `npx prisma migrate deploy`
- **Start:** `npm start`
- **Health:** `/health`

Set `FRONTEND_URL` to your Vercel domain (exact match, HTTPS, no trailing slash).

### Frontend (Vercel)

1. Connect the repository; set root directory to `frontend`.
2. Add all variables from `frontend/.env.example` for Production.
3. Build uses `vercel.json`: `npm run build` (no Prisma step).
4. Set `NEXT_PUBLIC_API_URL` to your deployed API HTTPS URL.
5. Set `JWT_SECRET` to match backend.
6. Add Google OAuth redirect: `https://your-domain.com/api/auth/callback/google`.

See [frontend/Frontend.md](frontend/Frontend.md) for the full production checklist.

### Post-deploy verification

| Check | Expected |
|-------|----------|
| `GET /health` | `{ "status": "ok", "database": "connected", "blacklistSize": N }` |
| Public school listing | Loads on `/schools` |
| CORS | Browser requests from Vercel origin succeed |
| Auth | Parent login and admin login work on production URLs |
| Sitemap | `/sitemap.xml` includes approved schools from API |

---

## 11. Security Features

| Feature | Implementation |
|---------|----------------|
| **JWT auth** | HS256, issuer `schoolfinder-api`, Bearer tokens; logout JTI blacklist (in-memory) |
| **Role protection** | Middleware (frontend) + `requireRole` (backend) |
| **Forgot-password role isolation** | `expectedRole` on forgot / verify-reset-otp / reset; generic 200 on forgot (anti-enumeration); 3-step email OTP flow (`otpVerified` required before reset) |
| **Hidden admin login** | `/admin-login` not in public nav; `expectedRole: ADMIN` on API |
| **Upload validation** | MIME, extension, 5MB limit, magic-byte checks (frontend route) |
| **Rate limiting** | 100 req/15 min general; 10 req/15 min auth; 3/h forgot; 5/h reset; 3/10 min OTP |
| **Upload rate limiting** | 10 uploads/hour/user on `POST /api/upload` |
| **Session heartbeat** | Client pings session every 10 min; NextAuth JWT max age 30 min |
| **Brute-force guard** | Login throttling per IP + email |
| **CORS** | Restricted to `FRONTEND_URL` in production |
| **Helmet** | Security headers + HSTS on API |
| **Validation** | Zod on mutating routes; sanitized request bodies |
| **Secrets** | JWT, DB, Cloudinary secrets server-side only |
| **No frontend DB** | Database credentials never on Vercel |

---

## 12. SEO and Performance

### SEO

- Dynamic metadata per page (`lib/seo.ts`)
- `robots.ts` and `sitemap.ts` (approved schools from backend API)
- JSON-LD structured data on home and school detail
- Private dashboards excluded from indexing

### Performance

- **Pagination** — schools default 12 per page; admin tables default 20
- **ISR** — public school fetches with `revalidate` and cache tags
- **Backend cache** — in-memory TTL (list 60s, detail 300s, admin stats 30s)
- **next/image** — AVIF/WebP, lazy loading, blur placeholders
- **Suspense** — skeleton loaders on listings and featured schools
- **Selective API responses** — minimal fields on list endpoints

---

## 13. License and Contribution

### License

This project is provided as an educational and production-oriented codebase. Add your chosen license file (for example, MIT) before public distribution if you open-source the repository.

### Contributing

1. Fork the repository and create a feature branch.
2. Follow existing patterns: TypeScript strict mode, role-separated auth, professional English in UI and API messages.
3. Run `npm run build` in `frontend` and `npx tsc --noEmit` in both projects before opening a pull request.
4. Do not commit `.env`, `.env.local`, or secrets.
5. **Schema changes:** update `backend/prisma/schema.prisma`, run `npm run migrate:dev` from backend, then `npx prisma generate`.

### Documentation

| Document | Contents |
|----------|----------|
| [frontend/Frontend.md](frontend/Frontend.md) | App Router, auth, API integration, dashboards, SEO, deployment |
| [backend/Backend.md](backend/Backend.md) | API routes, middleware, schema, pagination, security |

### Support and setup notes

- **Backend offline:** public pages degrade gracefully when `NEXT_PUBLIC_API_URL` is unreachable.
- **CORS errors:** ensure `FRONTEND_URL` on the API matches the Vercel domain exactly.
- **JWT mismatch:** `JWT_SECRET` must be identical on frontend and backend for server-side API calls.
- **Prisma client:** backend imports from `generated/prisma`; run `npx prisma generate` after schema changes.

---

**SchoolFinder** — practical school discovery for families and administrators across India.
