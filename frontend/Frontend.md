# SchoolFinder — Frontend Documentation

> Last updated: June 9, 2026

> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · NextAuth v5 · Cloudinary  
> **Default port:** `3000` · **Repository path:** `frontend/`  
> **Database:** None — all data via Express REST API at `NEXT_PUBLIC_API_URL`

This document describes the production-ready SchoolFinder frontend: architecture, backend API integration, authentication, routing, performance, deployment, and security.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Backend API Integration](#4-backend-api-integration)
5. [Authentication Architecture](#5-authentication-architecture)
6. [Route Protection](#6-route-protection)
7. [Dashboard Architecture](#7-dashboard-architecture)
8. [Upload System](#8-upload-system)
9. [SEO Architecture](#9-seo-architecture)
10. [Performance Optimizations](#10-performance-optimizations)
11. [Environment Variables](#11-environment-variables)
12. [Local Development Setup](#12-local-development-setup)
13. [Production Deployment](#13-production-deployment)
14. [Security Notes](#14-security-notes)
15. [UI/UX System](#15-uiux-system)

---

## 1. Project Overview

### Purpose

SchoolFinder is a school discovery platform for India. The frontend enables:

- **Parents** to browse, compare, and inquire about CBSE, ICSE, and state board schools
- **School administrators** to manage profiles, galleries, and parent inquiries
- **Platform administrators** to moderate schools, users, and inquiries

Public marketing and listing pages are SEO-optimized. Authenticated areas are role-isolated and excluded from search indexing.

### Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **No direct database access** | Zero Prisma dependency; no `DATABASE_URL` |
| **Backend as source of truth** | All CRUD via Express REST API |
| **JWT-only NextAuth** | Session strategy `jwt` — no Prisma adapter |
| **BFF pattern** | Next.js `/api/*` routes proxy mutations to backend with Bearer tokens |
| **Local type enums** | `src/lib/types/database.ts` mirrors backend Prisma enums |

### Next.js 14 Architecture

The application uses the **App Router** with:

- **Server Components** by default for data fetching, SEO metadata, and layout composition
- **Client Components** only where interactivity is required (forms, uploads, filters, session actions)
- **Route handlers** under `app/api/` as BFF proxies, NextAuth handlers, and Cloudinary upload
- **ISR / caching** via `fetch(..., { next: { revalidate } })` for public school data

### Role-Based Authentication

Three distinct roles are enforced at the middleware and layout level:

| Role | Primary entry | Home after login |
|------|---------------|------------------|
| `PARENT` | `/login`, `/register` | `/` (parent area at `/parent`) |
| `SCHOOL_ADMIN` | `/school-login`, `/school-register` | `/dashboard/school` |
| `ADMIN` | `/admin-login` (hidden) | `/admin` |

Authentication is **not** a single shared login page. Each role has dedicated routes and redirect rules.

---

## 2. Tech Stack

| Technology | Usage |
|------------|--------|
| **Next.js 14** | App Router, SSR, BFF API routes, image optimization |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS** | Utility-first styling, design tokens |
| **shadcn/ui** | Accessible primitives (`Button`, `Card`, `Table`, `Dialog`, etc.) |
| **NextAuth v5** | JWT sessions, Google OAuth, credentials provider |
| **Zod** | Form and API validation |
| **React Hook Form** | Client form state and validation |
| **Cloudinary** | Image storage and delivery (via server upload route) |
| **Lucide React** | Icon system |
| **Framer Motion** | Subtle UI motion |

**External API:** Express backend at `NEXT_PUBLIC_API_URL` for all authenticated and public data.

**Not used:** Prisma, `@prisma/client`, `@auth/prisma-adapter`, database drivers.

---

## 3. Folder Structure

```
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
```

### Middleware

- **File:** `middleware.ts` (project root, not under `src/`)
- **Logic:** Delegates to `src/lib/middleware-auth.ts`
- **Matcher:** Admin, dashboard, parent, and all role-specific auth routes

---

## 4. Backend API Integration

The frontend never connects to PostgreSQL. All data flows through the Express API.

### Integration Patterns

| Pattern | When used | Implementation |
|---------|-----------|----------------|
| **Server fetch** | RSC dashboards, admin pages | `backendFetch()` / `adminFetch()` in `lib/api/server.ts` |
| **Public fetch** | School listings, sitemap, home | Direct `fetch(NEXT_PUBLIC_API_URL/...)` with ISR |
| **BFF proxy** | Client mutations from browser | `proxyToBackend()` in `lib/api/proxy.ts` via `/api/*` routes |
| **Direct client fetch** | Auth flows, some favourites | Browser → backend with Bearer token |

### `backendFetch` (Server Components)

Used by `lib/school/data.ts`, `lib/parent/data.ts`, and server pages:

```typescript
import { backendFetch } from "@/lib/api/server";

const { ok, data } = await backendFetch("/api/schools/my-school");
```

Token resolution (`resolve-backend-token.ts`):

1. **ADMIN** — `sf_admin_token` HTTP-only cookie only (never minted)
2. **SCHOOL_ADMIN** — `session.backendAccessToken` from credentials login, then `mintBackendJwt()` fallback
3. **PARENT** — `session.backendAccessToken` from login, then `mintBackendJwt()` fallback

`mintBackendJwt()` (`backend-jwt.ts`) is **synchronous** — uses `jsonwebtoken` HS256 with issuer `schoolfinder-api` (replaced `jose` SignJWT which produced JWE tokens the backend could not verify). No `await` needed at call sites.

The legacy `sf_school_token` cookie (`SCHOOL_TOKEN_COOKIE`) is **no longer** used for API authorization.

### `adminFetch` (Admin dashboards)

Uses only the `sf_admin_token` cookie:

```typescript
import { adminFetch } from "@/lib/api/server";

const { ok, data } = await adminFetch("/api/admin/stats");
```

### BFF Proxy Routes

Browser client components call same-origin Next.js routes; handlers forward to backend:

| Frontend route | Backend target | Token source |
|----------------|----------------|--------------|
| `GET/PATCH /api/parent/profile` | `/api/parent/profile` | Session JWT |
| `GET/POST/DELETE /api/parent/favourites` | `/api/parent/favourites` | Session JWT via `proxyToBackend` |
| `PATCH /api/school/profile` | `/api/schools/:id` | Session JWT |
| `GET/POST /api/school/gallery` | `/api/schools/my-school/images` | Session JWT |
| `DELETE /api/school/gallery/[id]` | `/api/schools/images/:id` | Session JWT |
| `PATCH /api/school/inquiries/[id]/status` | `/api/inquiries/:id/status` | Session JWT |
| `POST /api/admin/session` | Sets/clears `sf_admin_token` cookie | Admin login flow |
| `GET /api/admin/schools` | `/api/admin/schools` (query: `page`, `limit`, `status`, `search`) | Admin cookie |
| `GET /api/admin/check-owner` | `/api/admin/check-owner?email=` | Admin cookie |
| `POST /api/admin/add-school` | `/api/admin/add-school` | HTTP-only `sf_admin_token` (server reads cookie, forwards Bearer); 401 if missing |
| `PATCH /api/admin/schools/[id]/approve` | `/api/admin/schools/:id/approve` | Admin cookie |
| `PATCH /api/admin/schools/[id]/reject` | `/api/admin/schools/:id/reject` | Admin cookie |
| `PATCH /api/admin/users/[id]/role` | `/api/admin/users/:id/role` | Admin cookie |
| `PATCH /api/admin/users/[id]/status` | `/api/admin/users/:id/status` | Admin cookie |
| `POST /api/upload` | Cloudinary (server-side only) | NextAuth session |
| `GET/POST /api/auth/[...nextauth]` | NextAuth handlers | — |

**Favourites:** `FavouriteButton` and parent favourites pages use BFF `/api/parent/favourites` (GET, POST, DELETE).

### Domain Data Modules

| Module | Backend endpoints |
|--------|-------------------|
| `lib/data/schools-public.ts` | `GET /api/schools`, `GET /api/schools/cities`, `GET /api/schools/:slug`, `GET /api/schools/search` |
| `lib/school/data.ts` | `GET /api/schools/my-school`, `GET /api/inquiries/school/:id` |
| `lib/parent/data.ts` | `GET/PATCH /api/parent/profile`, `GET /api/parent/favourites`, `GET /api/parent/inquiries` |
| `lib/admin/data.ts` | `GET /api/admin/stats`, `/schools`, `/users`, `/inquiries` |

### Type Definitions

Shared enums live in `src/lib/types/database.ts` (not generated from Prisma):

```typescript
export type Role = "PARENT" | "SCHOOL_ADMIN" | "ADMIN";
export type SchoolStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
export type InquiryStatus = "NEW" | "CONTACTED" | "CLOSED";
export type BoardType = "CBSE" | "ICSE" | "UP_BOARD" | "OTHER";
export type SchoolType = "BOYS" | "GIRLS" | "CO_ED";
export type MediumType = "HINDI" | "ENGLISH" | "BOTH";
```

Keep these in sync with `backend/prisma/schema.prisma` when enums change.

---

## 5. Authentication Architecture

### NextAuth Configuration (`src/lib/auth.ts`)

| Setting | Value |
|---------|-------|
| Strategy | `jwt` (no database adapter) |
| Session max age | 1800 seconds (30 minutes) |
| JWT max age | 1800 seconds (30 minutes) |
| Providers | Google, Credentials (parent/school/admin contexts) |
| Secret | `AUTH_SECRET` or `NEXTAUTH_SECRET` |
| `trustHost` | `true` |
| Custom sign-in page | `AUTH_ROUTES.parentLogin` (`/login`) |

**No PrismaAdapter.** OAuth Account/Session tables exist in the backend schema but are not used by the frontend.

### Parent (`PARENT`)

| Route | Purpose |
|-------|---------|
| `/login` | Google or email/password (`authContext: parent`) |
| `/register` | Create parent account |
| `/forgot-password?role=PARENT` or `?role=SCHOOL_ADMIN` | 3-step OTP reset: (1) `POST /api/auth/forgot-password` with `expectedRole`, (2) `POST /api/auth/verify-reset-otp`, (3) `POST /api/auth/reset-password` — all from the client to the backend API |

Login pages link to `/forgot-password?role=PARENT` or `?role=SCHOOL_ADMIN` for role-isolated reset. **OTP delivery:** `sendOtpEmail` (Resend) when `RESEND_API_KEY` and `EMAIL_FROM` are configured; Brevo is not used. There is no separate `/reset-password` page — new password is step 3 on `/forgot-password`.

All password fields use `PasswordInput` (`src/components/ui/PasswordInput.tsx`) for show/hide toggle.

- Google sign-in calls backend `POST /api/auth/google-sync`; only `PARENT` role allowed.
- Credentials login calls backend `POST /api/auth/login` with `expectedRole: "PARENT"`.
- Backend JWT stored as `session.backendAccessToken`.

### School Administrator (`SCHOOL_ADMIN`)

| Route | Purpose |
|-------|---------|
| `/school-login` | Credentials sign-in (`authContext: school`) |
| `/school-register` | 4-step registration wizard with localStorage draft and auto sign-in |

- Login via backend with `expectedRole: "SCHOOL_ADMIN"`.
- JWT callback: fresh credentials login does **not** call `refreshUserFromBackend`; subsequent refreshes skip when `trigger === "update"` (prevents refresh loop).
- Server-side API calls: `session.backendAccessToken` when present, else synchronous `mintBackendJwt()` HS256 fallback.
- After registration: wizard calls `signIn("credentials", { authContext: "school" })` directly.
- `DRAFT` schools: `dashboard/school/layout.tsx` redirects to `/school-complete-registration`.

### Platform Administrator (`ADMIN`)

| Route | Purpose |
|-------|---------|
| `/admin-login` | Hidden — not in public navigation |
| `/admin/add-school` | 4-step wizard to create an approved school listing |

**Flow:**

1. POST to backend `POST /api/auth/login` with `expectedRole: "ADMIN"`.
2. Store JWT in HTTP-only cookie `sf_admin_token` via `POST /api/admin/session`.
3. NextAuth credentials sign-in syncs session for middleware.
4. Admin data fetching uses `adminFetch()` with cookie token.

### Session Model

- **NextAuth JWT fields:** `id`, `role`, `backendAccessToken` (persisted in session for `PARENT`; stripped from NextAuth JWT token for non-parent roles after login)
- **Role refresh:** JWT callback calls `GET /api/auth/me` on subsequent requests when a backend token exists and `trigger !== "update"`; skipped on fresh credentials login
- **Production:** `trustHost: true` for Vercel

### Post-Login Redirect (`callbackUrl`)

Middleware preserves the original path as `callbackUrl`. After sign-in, login pages redirect to that URL when safe; otherwise they use `ROLE_HOME` from `auth-config.ts`.

---

## 6. Route Protection

### Middleware Flow

```
Request → getToken (NextAuth JWT) → resolveMiddlewareRedirect(pathname, role)
         → redirect OR NextResponse.next()
         → Cache-Control: no-store on protected dashboard responses
```

### Matcher

```
/admin, /admin/:path*, /dashboard/:path*, /parent, /parent/:path*,
/login, /register, /school-login, /school-register, /admin-login
```

### Rules Summary

| Area | Allowed role | Unauthenticated redirect |
|------|--------------|--------------------------|
| `/parent/*` | `PARENT` | `/login?callbackUrl=…` |
| `/dashboard/school/*` | `SCHOOL_ADMIN` | `/school-login?callbackUrl=…` |
| `/admin/*` | `ADMIN` | `/admin-login?callbackUrl=…` |

**Cross-role behavior:**

- Wrong role on protected area → redirect to `ROLE_HOME[role]`
- Signed-in user on another role's login page → their home route

### Layout Guards (defense in depth)

- `parent/layout.tsx` — requires `PARENT`
- `dashboard/school/layout.tsx` — requires `SCHOOL_ADMIN`
- `admin/layout.tsx` — requires `ADMIN`

### Noindex Routes

Via `robots.ts` and layout metadata:

- `/admin/*`, `/dashboard/*`, `/parent/*`
- Auth routes: `/login`, `/register`, `/admin-login`, `/school-login`
- `/api/*`

Public routes (`/`, `/schools`, `/schools/[slug]`) remain indexable.

---

## 7. Dashboard Architecture

### Parent Dashboard (`/parent`)

| Route | Description | Data source |
|-------|-------------|-------------|
| `/parent` | Overview, recently viewed schools | `lib/parent/data.ts` |
| `/parent/profile` | Edit parent profile | `GET/PATCH /api/parent/profile` |
| `/parent/favourites` | Saved schools with pagination | `GET /api/parent/favourites` |
| `/parent/inquiries` | Sent inquiries with status | `GET /api/parent/inquiries` |

**School listing filters:** `SchoolFilters` uses `fetchCities()` for city dropdown and checkbox multi-select for board (and school type, medium).

**School detail (public):** `InquiryModal` posts to backend inquiries; `FavouriteButton` toggles via BFF `/api/parent/favourites`.

### School Dashboard (`/dashboard/school`)

| Route | Description | Data source |
|-------|-------------|-------------|
| `/dashboard/school` | Overview, status card, inquiry summary | `GET /api/schools/my-school` |
| `/dashboard/school/inquiries` | Inquiry list with filters | `GET /api/inquiries/school/:id` |
| `/dashboard/school/profile` | Profile editor, logo, gallery | BFF `/api/school/*` |

**Inquiry status updates:** `PATCH /api/school/inquiries/[id]/status` → backend `/api/inquiries/:id/status`.

#### School registration wizard (`/school-register`)

`SchoolRegisterWizard` in `src/components/school/SchoolRegisterWizard.tsx`. Page (`school-register/page.tsx`) renders the wizard directly — no `AuthRoleGuard`.

| Step | Label | Fields validated on Next |
|------|-------|--------------------------|
| 0 | Account | `ownerName`, `ownerEmail`, `ownerPassword` |
| 1 | School Info | `schoolName`, `city`, `state`, `address`, `pincode`, `phone` |
| 2 | Academic | `board`, `schoolType`, `medium`, `classesFrom`, `classesTo`, `establishedYear`, `totalStudents` |
| 3 | Fees | All optional: `admissionFee`, `tuitionFeeMonthly`, `totalAnnualFee`, `transportFee`, `hostelFee` |

**Draft persistence:** localStorage key `sf_school_draft_{email}` — saves form data, step, and logo URL on step advance; restored on mount; cleared on successful submit.

**Submit flow:**

1. `POST ${NEXT_PUBLIC_API_URL}/api/auth/register-school` with full payload.
2. `signIn("credentials", { authContext: "school", redirect: false })` for auto sign-in.
3. Redirect to `/dashboard/school` on success, or `/school-login?registered=true` if sign-in fails.

Creates school with status `PENDING`.

### Admin Dashboard (`/admin`)

| Route | Description | Data source |
|-------|-------------|-------------|
| `/admin` | Platform stats | `GET /api/admin/stats` |
| `/admin/schools` | School moderation | `GET /api/admin/schools` |
| `/admin/users` | User management | `GET /api/admin/users` |
| `/admin/inquiries` | Cross-school inquiries | `GET /api/admin/inquiries` |
| `/admin/add-school` | 4-step add-school wizard (client component) | See **Add school wizard** below |

**Moderation:** Approve/reject via BFF routes → `PATCH /api/admin/schools/:id/approve|reject`.

Only `APPROVED` schools appear in public listings and sitemap.

#### Add school wizard (`/admin/add-school`)

Single-page multi-step form in `src/app/admin/add-school/page.tsx` (React Hook Form + Zod). No separate wizard components — all steps live in this file.

| Step | Label | Fields validated on Next |
|------|-------|--------------------------|
| 0 | Owner Info | `ownerEmail`, `ownerName`, `ownerPassword` (optional) |
| 1 | School Info | `name`, `city`, `state`, `address`, `pincode`, `phone`, `email`, `website`, `description` |
| 2 | Academic | `board`, `schoolType`, `medium`, `classesFrom`, `classesTo`, `establishedYear`, `totalStudents` |
| 3 | Fees | Fee fields (all optional) |

**Navigation and validation**

- **Next** buttons are `type="button"` on steps 0–2; only step 3 shows `type="submit"` (**Add school**).
- Each **Next** click runs `trigger()` for the current step’s fields only — errors appear on that step, not at final submit.
- **Enter** in inputs does not submit the form before the last step.
- `onSubmit` is a no-op unless `step === STEPS.length - 1`.

**Async checks before advancing**

| Step | Check | BFF route | On failure |
|------|-------|-----------|------------|
| 0 | Owner already registered as `SCHOOL_ADMIN` with an existing school | `GET /api/admin/check-owner?email=` | Amber warning card; blocks advance |
| 1 | Duplicate school name (case-insensitive exact match) | `GET /api/admin/schools?search=<name>&limit=50` | Inline error under **School Name**; blocks advance |

For step 1, the client filters API results for an exact name match (backend `search` uses `contains`, so partial hits are ignored). If the duplicate-check request fails, the error is logged and the user may proceed.

**Submit flow (step 3)**

1. Optional logo upload → `POST /api/upload` (Cloudinary URL).
2. `POST /api/admin/add-school` with full payload (BFF forwards `sf_admin_token` as Bearer).
3. Success screen with links to schools list or “Add another”; errors shown inline via `errorMessage` state.

Server-side admin list pages (`/admin/schools`, etc.) still use `adminFetch()` in `lib/admin/data.ts` — the new `GET /api/admin/schools` BFF route exists for **browser** calls from the wizard only.

---

## 8. Upload System

### Cloudinary Integration

- Uploads go through **`POST /api/upload`** (Next.js server route only).
- **Authentication required:** valid NextAuth session with role `PARENT`, `SCHOOL_ADMIN`, or `ADMIN`.
- **Rate limit:** 10 uploads per hour per user (in-memory counter; returns `429` when exceeded).
- Credentials (`CLOUDINARY_*`) never reach the browser.
- Folders: `school-platform/logos`, `school-platform/gallery`, `school-platform/profiles`.

### Restrictions

| Rule | Value |
|------|--------|
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Max file size | **5 MB** |
| Magic-byte check | Server validates actual file content vs declared MIME |

### Usage Flow

1. Client uploads to `/api/upload` → receives Cloudinary URL.
2. Client sends URL to backend via school/profile PATCH or gallery POST.
3. Backend persists URL on `School` or `SchoolImage` records.

---

## 9. SEO Architecture

### Metadata

- **Root:** `lib/seo.ts` → `rootMetadata`, `buildPageMetadata()`, `buildSchoolMetadata()`
- **School detail:** Dynamic title, description, canonical URL, Open Graph, Twitter cards

### Sitemap

- **File:** `app/sitemap.ts`
- **Source:** `GET /api/schools?status=APPROVED&limit=1000` (not Prisma)
- **URL base:** `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`
- **Revalidation:** 3600 seconds with cache tag `schools`

### Robots

- **File:** `app/robots.ts`
- Allows public discovery routes; disallows private and auth routes
- Points to `/sitemap.xml`

### Structured Data

- **Component:** `components/seo/JsonLd.tsx`
- **Types:** `WebSite` (home), `EducationalOrganization` + `BreadcrumbList` (school detail)

---

## 10. Performance Optimizations

### Suspense and Streaming

| Surface | Pattern |
|---------|---------|
| Homepage featured schools | `Suspense` + skeleton |
| Schools listing | `Suspense` + `SchoolGridSkeleton` |
| Route transitions | `loading.tsx` on `/schools` routes |

### Data Fetching

- `lib/data/schools-public.ts` — ISR (`revalidate: 60` listing, `3600` featured)
- Server dashboards — `cache: "no-store"` via `backendFetch`
- Backend applies in-memory cache (list 60s, detail 300s, admin stats 30s)

### Image Optimization

- Remote patterns: Cloudinary, Google avatars
- Formats: AVIF, WebP via Next.js image pipeline
- `sizes` attribute per layout breakpoint

### Pagination

- **Public listings:** Backend default 12 schools per page
- **Admin tables:** Server-side pagination via query params
- **Parent favourites/inquiries:** Paginated API responses

### Session Heartbeat

- **Component:** `components/SessionHeartbeat.tsx`
- Pings `GET /api/auth/session` every **10 minutes** while authenticated
- Keeps NextAuth JWT alive before 30-minute `maxAge` expires

---

## 11. Environment Variables

Copy `frontend/.env.example` to `.env.local`. Never commit real secrets.

| Variable | Required | Description | Production notes |
|----------|----------|-------------|------------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL for SEO and sitemap | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Yes | Express API base URL | Must be **HTTPS** |
| `NEXTAUTH_URL` | Yes | NextAuth canonical URL | Same as public site URL |
| `AUTH_URL` | Yes | NextAuth v5 alias | Same as `NEXTAUTH_URL` |
| `NEXTAUTH_SECRET` | Yes | Session encryption secret | `openssl rand -base64 32` |
| `AUTH_SECRET` | Yes | NextAuth v5 alias | Same value as `NEXTAUTH_SECRET` |
| `AUTH_TRUST_HOST` | Yes (Vercel) | Trust deployment host | `true` |
| `JWT_SECRET` | Yes | Must match backend — server-side Bearer minting | Same as backend `JWT_SECRET` |
| `GOOGLE_CLIENT_ID` | Yes* | Google OAuth client ID | Add production redirect URI |
| `GOOGLE_CLIENT_SECRET` | Yes* | Google OAuth secret | Server-only |
| `CLOUDINARY_CLOUD_NAME` | Yes** | Cloudinary cloud name | Server-only (upload route) |
| `CLOUDINARY_API_KEY` | Yes** | Cloudinary API key | Server-only |
| `CLOUDINARY_API_SECRET` | Yes** | Cloudinary API secret | Server-only |

\* Required if Google sign-in is enabled.  
\** Required for image uploads.

**Not required:** `DATABASE_URL` — database is managed entirely by the backend.

### What must not be exposed

Only `NEXT_PUBLIC_*` variables are bundled for the browser. Keep `AUTH_SECRET`, `JWT_SECRET`, and `CLOUDINARY_API_SECRET` server-side only.

---

## 12. Local Development Setup

### Prerequisites

- Node.js 18+
- Express backend running on port `4000`
- Cloudinary account (for uploads)
- Google OAuth credentials (optional)

### Steps

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
# Set JWT_SECRET to match backend

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend dependency

Ensure the backend is running with migrations applied. Public school pages degrade gracefully when the API is unavailable.

### Verify TypeScript

```bash
npx tsc --noEmit
```

### First admin user

Use backend seeder (`npm run seed:admin` in `backend/`) or promote a user via SQL, then sign in at `/admin-login`.

---

## 13. Production Deployment

### Target: Vercel

Configuration: `vercel.json`

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "regions": ["bom1"]
}
```

No Prisma generate step — frontend has no database client.

### Deployment steps

1. Connect repository to Vercel; set root directory to `frontend`.
2. Add all environment variables from [Section 11](#11-environment-variables).
3. Set `JWT_SECRET` identical to backend.
4. Deploy.

### Domain setup

1. Add custom domain in Vercel.
2. Update `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL`, and `AUTH_URL`.
3. Update Google OAuth redirect: `https://your-domain.com/api/auth/callback/google`.
4. Update backend `FRONTEND_URL` for CORS.

### Production checklist

| Step | Action |
|------|--------|
| 1 | Deploy backend with HTTPS |
| 2 | Set `NEXT_PUBLIC_API_URL` to backend URL |
| 3 | Set `JWT_SECRET` matching backend |
| 4 | Configure Google OAuth and Cloudinary |
| 5 | Verify `/health` on backend |
| 6 | Smoke-test auth, listings, dashboards |
| 7 | Confirm sitemap and robots in production |

---

## 14. Security Notes

### Protected routes

- Middleware enforces role boundaries on dashboard and admin paths.
- Layout-level `auth()` provides server-side defense in depth.

### Hidden admin login

- `/admin-login` not linked in public navigation.
- `HideOnAdminLogin` hides global chrome on admin login page.

### Upload validation

- Client and server validation (MIME, extension, size, magic bytes).
- Upload route runs on Node.js runtime only.

### Auth restrictions

- Google OAuth limited to parent role.
- Credentials provider validates `authContext` against expected role.
- Disabled accounts cannot sign in (backend enforces).
- Admin uses separate backend JWT + HTTP-only cookie.

### Frontend security behavior

- Security headers via Next.js config (HSTS, CSP, X-Frame-Options).
- Protected responses use `Cache-Control: no-store` in middleware.
- Rate limiting on backend auth routes.

---

## 15. UI/UX System

### Design principles

- **Trust and clarity** — education-focused blue palette with amber CTAs
- **Mobile-first** — responsive grids and touch-friendly controls
- **Accessibility** — WCAG-friendly contrast, visible `:focus-visible` rings

### Typography

| Role | Font | Tailwind |
|------|------|----------|
| Headings, buttons, nav | Plus Jakarta Sans | `font-heading` |
| Body, labels, meta | Inter | `font-body` |

### Color palette

- **Primary blue:** `blue-50` through `blue-900`
- **Accent amber:** `amber-50` through `amber-800`
- **Neutral gray:** `gray-50` through `gray-900`
- **Semantic:** success, warning, danger, info tokens

### Button variants

Defined in `src/components/ui/button.tsx`:

| Variant | Usage |
|---------|-------|
| `default` | Primary actions (save, submit) |
| `secondary` | Secondary actions |
| `cta` | High-intent CTAs (register school) |
| `destructive` | Delete, reject, disable |
| `outline` / `ghost` | Tertiary actions |

### Responsive behavior

- School grid: 1 → 2 → 3 columns
- Dashboards: stacked nav on mobile, fixed nav on desktop

---

## Quick Reference

| Task | Command / Path |
|------|----------------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Type check | `npx tsc --noEmit` |
| Env template | `.env.example` |
| Auth config | `src/lib/auth.ts` |
| API client | `src/lib/api/server.ts` |
| BFF proxy | `src/lib/api/proxy.ts` |
| Middleware | `middleware.ts` |
| Public API fetch | `src/lib/data/schools-public.ts` |
| Type enums | `src/lib/types/database.ts` |
| SEO helpers | `src/lib/seo.ts` |

---

*Last updated: June 9, 2026.*
