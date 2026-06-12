# SchoolFinder — Frontend Documentation

> Last updated: June 12, 2026

> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · NextAuth v5 · Cloudinary  
> **Default port:** `3000` · **Repository path:** `frontend/`  
> **Database:** None — all data via Express REST API at `NEXT_PUBLIC_API_URL`

The frontend is a role-separated Next.js application. It handles UI, NextAuth sessions, BFF proxy routes, and Cloudinary uploads. PostgreSQL is accessed only by the backend.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Route Structure](#4-route-structure)
5. [Component Hierarchy](#5-component-hierarchy)
6. [State Management](#6-state-management)
7. [API Integration](#7-api-integration)
8. [Authentication Flow](#8-authentication-flow)
9. [Route Protection](#9-route-protection)
10. [Data Fetching & Caching](#10-data-fetching--caching)
11. [Form Handling](#11-form-handling)
12. [Error Handling](#12-error-handling)
13. [Upload System](#13-upload-system)
14. [SEO](#14-seo)
15. [Environment Variables](#15-environment-variables)
16. [Build & Deployment](#16-build--deployment)
17. [Third-Party Integrations](#17-third-party-integrations)
18. [Current Features](#18-current-features)

---

## 1. Architecture Overview

### Principles

| Principle | Implementation |
|-----------|----------------|
| No direct database access | Zero Prisma; no `DATABASE_URL` |
| Backend as source of truth | All CRUD via Express REST API |
| JWT-only NextAuth | Session strategy `jwt` — no Prisma adapter |
| BFF pattern | `/api/*` routes proxy mutations with Bearer tokens |
| Local type enums | `src/lib/types/database.ts` mirrors backend Prisma enums |

### Execution Flow

```
Browser / Server Component
    │
    ├─ Public data ──────────► fetch(NEXT_PUBLIC_API_URL/...)  [ISR]
    ├─ Server dashboards ────► backendFetch() / adminFetch()   [no-store]
    ├─ Client mutations ─────► same-origin /api/* BFF routes   [proxyToBackend]
    └─ Auth ─────────────────► NextAuth + direct backend auth endpoints
                                    │
                                    ▼
                          Express API (port 4000)
                                    │
                                    ▼
                          PostgreSQL (Neon)
```

### Rendering Model

- **Server Components** by default — data fetching, SEO, layouts
- **Client Components** where interactivity is required — forms, filters, uploads, session actions
- **Route handlers** under `src/app/api/` — BFF proxies, NextAuth, Cloudinary upload

---

## 2. Tech Stack

| Technology | Version | Usage |
|------------|---------|-------|
| Next.js | 14.2.29 | App Router, SSR, BFF routes, image optimization |
| React | 18.3 | UI |
| TypeScript | 5.4 | Type safety |
| Tailwind CSS | 3.4 | Styling, design tokens |
| shadcn/ui | — | Accessible primitives (Button, Card, Table, Dialog, etc.) |
| NextAuth | 5.0.0-beta.19 | JWT sessions, Google OAuth, credentials |
| Zod | 3.23 | Validation schemas |
| React Hook Form | 7.52 | Client form state |
| Cloudinary | 2.3 | Server-side image upload |
| Framer Motion | 12.40 | Page transitions, home animations |
| jsonwebtoken | 9.0 | Server-side Bearer token minting |
| Lucide React | — | Icons |

**Not used:** Prisma, `@auth/prisma-adapter`, database drivers.

**Installed but unused in `src/`:** `jose`; several `@radix-ui/*` packages (accordion, avatar, checkbox, dropdown-menu, separator, tabs, toast).

---

## 3. Folder Structure

```
frontend/
├── middleware.ts                 # Edge middleware → middleware-auth.ts
├── next.config.js                # Active Next.js config (security headers, images)
├── next.config.mjs               # Dead stub (commented out — safe to delete)
├── vercel.json                   # Vercel deployment config
├── tailwind.config.ts
├── .env.example
└── src/
    ├── app/                      # App Router pages and API routes
    │   ├── page.tsx              # Home
    │   ├── layout.tsx            # Root layout (Navbar, Footer, Providers)
    │   ├── providers.tsx         # SessionProvider + SessionHeartbeat
    │   ├── schools/              # Public listing + [slug] detail
    │   ├── login/ register/ forgot-password/ reset-password/
    │   ├── school-login/ school-register/ school-complete-registration/
    │   ├── admin-login/
    │   ├── parent/               # Parent dashboard
    │   ├── dashboard/school/     # School admin dashboard
    │   ├── admin/                # Platform admin panel
    │   ├── api/                  # BFF route handlers (19 routes)
    │   ├── sitemap.ts robots.ts
    │   └── error.tsx global-error.tsx not-found.tsx
    ├── components/
    │   ├── admin/                # AdminNav, moderation, pagination
    │   ├── auth/                 # Login content, AuthRoleGuard
    │   ├── home/                 # Hero, stats, featured schools
    │   ├── parent/               # ParentNav, ProfileForm, recent schools
    │   ├── school/               # Dashboard nav, profile, gallery, wizard
    │   ├── schools/              # FavouriteButton, InquiryModal, skeletons
    │   ├── seo/                  # JsonLd
    │   ├── ui/                   # shadcn primitives
    │   └── upload/               # ImageUploadField
    └── lib/
        ├── auth.ts               # NextAuth configuration
        ├── auth-config.ts        # Route constants, role homes
        ├── backend-jwt.ts        # mintBackendJwt() — HS256
        ├── middleware-auth.ts    # Middleware redirect logic
        ├── api/
        │   ├── server.ts         # backendFetch, adminFetch
        │   ├── proxy.ts          # proxyToBackend (BFF)
        │   └── resolve-backend-token.ts
        ├── admin/                # Admin data fetching
        ├── parent/               # Parent data + recent schools
        ├── school/               # School dashboard data + gallery
        ├── data/schools-public.ts # Public ISR fetches
        ├── types/database.ts     # Local enum mirrors
        ├── cloudinary.ts         # Server upload helper
        ├── seo.ts                # Metadata helpers
        └── upload-client.ts      # Client upload to /api/upload
```

---

## 4. Route Structure

### Public Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Home — hero, stats, featured schools |
| `/schools` | `app/schools/page.tsx` | Filterable school listing |
| `/schools/[slug]` | `app/schools/[slug]/page.tsx` | Detail, inquiry modal, favourites |
| `/login` | `app/login/page.tsx` | Parent login (Google + credentials) |
| `/register` | `app/register/page.tsx` | Parent registration |
| `/forgot-password` | `app/forgot-password/page.tsx` | 3-step OTP password reset |
| `/reset-password` | `app/reset-password/page.tsx` | **Redirect stub** → `/forgot-password?role=…` |
| `/school-login` | `app/school-login/page.tsx` | School admin login |
| `/school-register` | `app/school-register/page.tsx` | 4-step registration wizard |
| `/school-complete-registration` | `app/school-complete-registration/page.tsx` | DRAFT school completion prompt |
| `/admin-login` | `app/admin-login/page.tsx` | Hidden admin login |

### Parent Dashboard (`/parent/*`)

| Route | Purpose |
|-------|---------|
| `/parent` | Overview, recently viewed schools |
| `/parent/profile` | Edit profile |
| `/parent/favourites` | Saved schools with pagination |
| `/parent/inquiries` | Sent inquiries with status |

Layout: `app/parent/layout.tsx` — requires `PARENT` role.

### School Dashboard (`/dashboard/school/*`)

| Route | Purpose |
|-------|---------|
| `/dashboard/school` | Overview, status card, inquiry summary |
| `/dashboard/school/inquiries` | Inquiry list with filters and status updates |
| `/dashboard/school/profile` | Profile editor, logo, gallery |

Layout: `app/dashboard/school/layout.tsx` — requires `SCHOOL_ADMIN`; redirects `DRAFT` schools to `/school-complete-registration`.

### Admin Panel (`/admin/*`)

| Route | Purpose |
|-------|---------|
| `/admin` | Platform stats |
| `/admin/schools` | School moderation (approve/reject) |
| `/admin/users` | User role and status management |
| `/admin/inquiries` | Cross-school inquiry monitoring |
| `/admin/add-school` | 4-step wizard to create approved schools |

Layout: `app/admin/layout.tsx` — requires `ADMIN` role.

### BFF API Routes (`src/app/api/`)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/auth/logout` | POST | Backend token blacklist + cookie cleanup |
| `/api/admin/session` | POST, DELETE | Set/clear `sf_admin_token` cookie |
| `/api/admin/schools` | GET | Proxy admin school list (wizard duplicate check) |
| `/api/admin/schools/[id]` | DELETE | Proxy school delete — **no UI caller** |
| `/api/admin/schools/[id]/approve` | PATCH | Approve school |
| `/api/admin/schools/[id]/reject` | PATCH | Reject school |
| `/api/admin/users/[id]/role` | PATCH | Update user role |
| `/api/admin/users/[id]/status` | PATCH | Enable/disable user |
| `/api/admin/add-school` | POST | Create approved school |
| `/api/admin/check-owner` | GET | Owner email pre-check |
| `/api/parent/profile` | PATCH | Update parent profile |
| `/api/parent/favourites` | GET, POST, DELETE | Favourites CRUD |
| `/api/school/session` | POST, DELETE | Set/clear `sf_school_token` cookie (legacy) |
| `/api/school/profile` | PATCH | Update school profile |
| `/api/school/gallery` | GET, POST | Gallery list / add image |
| `/api/school/gallery/[id]` | DELETE | Remove gallery image |
| `/api/school/inquiries/[id]/status` | PATCH | Update inquiry status |
| `/api/upload` | POST | Cloudinary upload (authenticated) |

---

## 5. Component Hierarchy

```
RootLayout (layout.tsx)
├── Providers (SessionProvider, SessionHeartbeat)
├── Navbar
├── <main> → page content
└── HideOnAdminLogin → Footer

Public
├── HomeHero, HomeStats, FeaturedSchools → SchoolCard
├── SchoolFilters, SchoolCard, SchoolGridSkeleton
└── schools/[slug]: JsonLd, InquiryModal, FavouriteButton, TrackSchoolView

Auth
├── ParentLoginContent, SchoolLoginContent → AuthRoleGuard
├── SchoolRegisterWizard (4-step, localStorage draft)
└── admin-login: inline form

Parent dashboard
└── ParentNav → ProfileForm, RecentViewedSchools, RemoveFavouriteButton

School dashboard
└── SchoolDashboardNav → SchoolStatusCard, SchoolProfileForm,
                          SchoolGalleryManager, InquiryFilters/Select

Admin panel
└── AdminNav → AdminSearchBar, AdminPagination, SchoolModerationActions,
               UserManagementActions, RoleBadge, SchoolStatusBadge
```

### Unused Components (candidates for removal)

| File | Status |
|------|--------|
| `components/motion/fade-in.tsx` | Never imported |
| `components/motion/stagger-grid.tsx` | Never imported |
| `components/ui/stat-card.tsx` | Never imported |
| `components/ui/empty-state.tsx` | Never imported (inline empty state used in schools page) |

---

## 6. State Management

| Mechanism | Location | Purpose |
|-----------|----------|---------|
| **NextAuth JWT session** | `lib/auth.ts`, `providers.tsx` | Primary auth state: `id`, `role`, `backendAccessToken` |
| **HTTP-only cookie `sf_admin_token`** | `lib/admin-auth.ts` | Admin backend JWT for `adminFetch()` and BFF |
| **HTTP-only cookie `sf_school_token`** | `lib/school-auth.ts` | Set at school login; **not used** for API auth |
| **sessionStorage `sf_parent_token`** | `lib/parent-token.ts` | Client-side token for direct inquiry API calls |
| **localStorage `sf_school_draft_{email}`** | `SchoolRegisterWizard.tsx` | School registration draft persistence |
| **localStorage recent schools** | `lib/parent/recent-schools.ts` | Recently viewed schools on parent dashboard |
| **React Hook Form + Zod** | Auth forms, wizards, profiles | Client form validation |
| **URL searchParams** | Filters, pagination, `callbackUrl` | Routing state |

No Redux, Zustand, or custom React context beyond NextAuth's `SessionProvider`.

---

## 7. API Integration

### Integration Patterns

| Pattern | When Used | Implementation |
|---------|-----------|----------------|
| **Server fetch** | RSC dashboards, admin pages | `backendFetch()` / `adminFetch()` in `lib/api/server.ts` |
| **Public fetch** | School listings, sitemap, home | Direct `fetch(NEXT_PUBLIC_API_URL/...)` with ISR |
| **BFF proxy** | Client mutations from browser | `proxyToBackend()` via `/api/*` routes |
| **Direct client fetch** | Auth flows, inquiries | Browser → backend with Bearer token |

### Token Resolution (`resolve-backend-token.ts`)

1. **ADMIN** — `sf_admin_token` cookie only (never minted)
2. **SCHOOL_ADMIN / PARENT** — `session.backendAccessToken`, then `mintBackendJwt()` fallback
3. **`sf_school_token` is not read** by token resolution despite being set at school login

### Domain Data Modules

| Module | Backend Endpoints |
|--------|-------------------|
| `lib/data/schools-public.ts` | `GET /api/schools`, `/cities`, `/:slug` |
| `lib/school/data.ts` | `GET /api/schools/my-school`, `GET /api/inquiries/school/:id` |
| `lib/parent/data.ts` | `GET/PATCH /api/parent/profile`, `GET /api/parent/favourites` |
| `lib/admin/data.ts` | `GET /api/admin/stats`, `/schools`, `/users`, `/inquiries` |

### Direct Client Calls (not via BFF)

| Caller | Endpoint |
|--------|----------|
| `InquiryModal.tsx` | `POST /api/inquiries` (uses sessionStorage token) |
| `parent/inquiries/page.tsx` | `GET /api/inquiries/my` |
| Auth pages | `POST /api/auth/login`, `/register-parent`, `/register-school`, etc. |
| `forgot-password/page.tsx` | `POST /api/auth/forgot-password`, `/verify-reset-otp`, `/reset-password` |

### Type Definitions (`lib/types/database.ts`)

```typescript
export type Role = "PARENT" | "SCHOOL_ADMIN" | "ADMIN";
export type SchoolStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
export type InquiryStatus = "NEW" | "CONTACTED" | "CLOSED";
export type BoardType = "CBSE" | "ICSE" | "UP_BOARD" | "OTHER";
export type SchoolType = "BOYS" | "GIRLS" | "CO_ED";
export type MediumType = "HINDI" | "ENGLISH" | "BOTH";
```

Keep in sync with `backend/prisma/schema.prisma` when enums change.

---

## 8. Authentication Flow

### Two-Layer Token Model

| Layer | Purpose | Lifetime |
|-------|---------|----------|
| **NextAuth JWT** | Frontend session for middleware and UI | 30 minutes |
| **Backend Bearer JWT** | API authorization on Express | 7 days (configurable) |

### Parent (`PARENT`)

1. Sign in at `/login` via Google OAuth or email/password (`authContext: "parent"`)
2. Backend `POST /api/auth/login` with `expectedRole: "PARENT"` → JWT stored as `session.backendAccessToken`
3. Also stored in `sessionStorage` via `storeParentBackendToken()` for direct API calls
4. Google OAuth calls `POST /api/auth/google-sync` — PARENT role only
5. Password reset: `/forgot-password?role=PARENT` — 3-step OTP flow
6. Logout: `performLogout()` → backend blacklist + NextAuth signOut → `/login`

### School Administrator (`SCHOOL_ADMIN`)

1. Sign in at `/school-login` or register at `/school-register`
2. Backend login with `expectedRole: "SCHOOL_ADMIN"`
3. `POST /api/school/session` sets `sf_school_token` cookie (legacy, not used for API auth)
4. NextAuth credentials sign-in with `authContext: "school"`
5. Server-side API: `mintBackendJwt()` fallback (backendAccessToken stripped from NextAuth JWT for non-parent roles)
6. Registration wizard: `POST /api/auth/register-school` → auto sign-in → `/dashboard/school`
7. `DRAFT` schools redirected to `/school-complete-registration` by dashboard layout

### Platform Administrator (`ADMIN`)

1. Sign in at `/admin-login` (hidden from public navigation)
2. Backend login with `expectedRole: "ADMIN"`
3. `POST /api/admin/session` stores JWT in HTTP-only `sf_admin_token` cookie
4. NextAuth credentials sign-in syncs session for middleware
5. All admin data via `adminFetch()` or BFF routes with `useAdminCookie: true`

### NextAuth Configuration (`lib/auth.ts`)

| Setting | Value |
|---------|-------|
| Strategy | `jwt` (no database adapter) |
| Session max age | 1800 seconds (30 minutes) |
| Providers | Google, Credentials |
| Secret | `AUTH_SECRET` or `NEXTAUTH_SECRET` |
| `trustHost` | `true` |

**Session refresh:** JWT callback calls `GET /api/auth/me` on subsequent requests. `SessionHeartbeat` pings session every 10 minutes.

---

## 9. Route Protection

### Middleware (`middleware.ts` → `lib/middleware-auth.ts`)

**Matcher:**
```
/admin, /admin/:path*, /dashboard/:path*, /parent, /parent/:path*,
/login, /register, /school-login, /school-register, /admin-login
```

| Area | Required Role | Unauthenticated Redirect |
|------|---------------|--------------------------|
| `/parent/*` | `PARENT` | `/login?callbackUrl=…` |
| `/dashboard/school/*` | `SCHOOL_ADMIN` | `/school-login?callbackUrl=…` |
| `/admin/*` | `ADMIN` | `/admin-login?callbackUrl=…` |

**Cross-role:** Wrong role → redirect to `ROLE_HOME[role]`. Signed-in user on another role's login page → their home route.

**Not in matcher:** `/forgot-password`, `/reset-password`, `/school-complete-registration`, public pages.

### Layout Guards (defense in depth)

- `parent/layout.tsx` — requires `PARENT`
- `dashboard/school/layout.tsx` — requires `SCHOOL_ADMIN` + DRAFT redirect
- `admin/layout.tsx` — requires `ADMIN`

### Noindex Routes

Via `robots.ts` and layout metadata: `/admin/*`, `/dashboard/*`, `/parent/*`, auth routes, `/api/*`.

---

## 10. Data Fetching & Caching

### Public Data (ISR)

| Data | Module | Revalidation |
|------|--------|--------------|
| School listing | `lib/data/schools-public.ts` | 60 seconds |
| School detail | `lib/data/schools-public.ts` | 3600 seconds |
| Featured schools | `lib/data/schools-public.ts` | 3600 seconds |
| Sitemap | `app/sitemap.ts` | 3600 seconds, tag `schools` |

Uses `fetch(..., { next: { revalidate, tags } })`.

### Authenticated Data

Server dashboards use `backendFetch()` / `adminFetch()` with `cache: "no-store"`.

### Backend Cache (consumed transparently)

Backend applies in-memory TTL: list 60s, detail 300s, admin stats 30s. Frontend does not manage this layer.

### Client Caching

- NextAuth session cached by `SessionProvider`
- No SWR/React Query — pages refetch on navigation via server components or client fetch

---

## 11. Form Handling

| Form | Library | Validation |
|------|---------|------------|
| Parent login/register | React Hook Form + Zod | Client-side schemas |
| School registration wizard | React Hook Form + Zod | Per-step `trigger()` validation |
| Admin add-school wizard | React Hook Form + Zod | Per-step validation + async duplicate checks |
| Profile forms | React Hook Form + Zod | Client-side |
| Inquiry modal | Controlled state + Zod | Client-side |

**School registration draft:** localStorage key `sf_school_draft_{email}` — saves form data, step, logo URL on step advance; restored on mount; cleared on submit.

**Admin add-school async checks:**
- Step 0: `GET /api/admin/check-owner?email=` — blocks if owner already has school
- Step 1: `GET /api/admin/schools?search=<name>` — client filters for exact name match

---

## 12. Error Handling

| Layer | Implementation |
|-------|----------------|
| Route errors | `app/error.tsx` — route-level error boundary |
| Root errors | `app/global-error.tsx` — root error boundary |
| 404 | `app/not-found.tsx` |
| API errors | BFF routes forward backend error envelope `{ success, code, message }` |
| Auth errors | Login pages display inline error messages from backend |
| Upload errors | `/api/upload` returns 400/401/429 with descriptive messages |
| Backend offline | Public pages degrade gracefully when API unreachable |

---

## 13. Upload System

All uploads go through `POST /api/upload` (Next.js server route).

| Rule | Value |
|------|-------|
| Auth required | `PARENT`, `SCHOOL_ADMIN`, or `ADMIN` session |
| Rate limit | 10 uploads/hour/user (in-memory) |
| Allowed MIME | `image/jpeg`, `image/png`, `image/webp` |
| Max size | 5 MB |
| Magic-byte check | Server validates file content vs declared MIME |
| Folders | `school-platform/logos`, `gallery`, `profiles` |

**Flow:** Client → `/api/upload` → Cloudinary URL → backend PATCH/POST with URL string.

Credentials (`CLOUDINARY_*`) never reach the browser.

---

## 14. SEO

| Feature | Implementation |
|---------|----------------|
| Metadata | `lib/seo.ts` — `rootMetadata`, `buildPageMetadata()`, `buildSchoolMetadata()` |
| Sitemap | `app/sitemap.ts` — approved schools from `GET /api/schools?status=APPROVED&limit=1000` |
| Robots | `app/robots.ts` — allows public routes, disallows private/auth |
| JSON-LD | `components/seo/JsonLd.tsx` — WebSite (home), EducationalOrganization (detail) |
| Images | `next/image` with AVIF/WebP, Cloudinary remote patterns |

---

## 15. Environment Variables

Copy `frontend/.env.example` to `.env.local`. Never commit secrets.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL for SEO and sitemap |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (HTTPS in production) |
| `NEXTAUTH_URL` / `AUTH_URL` | Yes | NextAuth canonical URL |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Yes | Session encryption |
| `AUTH_TRUST_HOST` | Yes (Vercel) | Trust deployment host |
| `JWT_SECRET` | Yes | Must match backend — server-side Bearer minting |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | If Google enabled | Parent OAuth |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | For uploads | Server-only |

**Not required:** `DATABASE_URL`.

Only `NEXT_PUBLIC_*` variables are exposed to the browser.

---

## 16. Build & Deployment

### Local Development

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
# Set JWT_SECRET to match backend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Backend must be running on port 4000.

### Build

```bash
npm run build    # next build — no Prisma step
npx tsc --noEmit # type check
```

### Production (Vercel)

Configuration: `vercel.json`

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "regions": ["bom1"]
}
```

1. Set root directory to `frontend`
2. Add all environment variables from Section 15
3. Set `JWT_SECRET` identical to backend
4. Update Google OAuth redirect: `https://your-domain.com/api/auth/callback/google`
5. Update backend `FRONTEND_URL` for CORS

Active config: `next.config.js` (CSP, HSTS, security headers, image remote patterns).

---

## 17. Third-Party Integrations

| Service | Usage | Config Location |
|---------|-------|-----------------|
| **Express API** | All data operations | `NEXT_PUBLIC_API_URL` |
| **Google OAuth** | Parent sign-in | `GOOGLE_CLIENT_ID/SECRET` |
| **Cloudinary** | Image storage and delivery | `CLOUDINARY_*` (server-only) |
| **NextAuth** | Session management | `AUTH_SECRET`, `AUTH_URL` |
| **Vercel** | Hosting | `vercel.json`, env vars |

---

## 18. Current Features

### Parents
- Search and filter schools (city, board, type, medium, text search)
- View school detail pages (fees, facilities, gallery, contact)
- Save schools to favourites
- Send inquiries to approved schools
- Dashboard: profile, favourites, recently viewed, sent inquiries
- Google OAuth and email/password auth
- OTP password reset

### School Administrators
- 4-step registration wizard with draft persistence
- School dashboard: overview, inquiry management, profile/gallery editing
- Inquiry status workflow (NEW → CONTACTED → CLOSED)
- Status visibility: PENDING, APPROVED, REJECTED (+ DRAFT redirect if assigned)

### Platform Administrators
- School moderation (approve/reject)
- Add school wizard (creates APPROVED listings)
- User management (roles, disable accounts)
- Cross-platform inquiry monitoring
- Dashboard stats

### Public
- SEO-optimized home, listing, and detail pages
- Dynamic sitemap and robots.txt
- JSON-LD structured data
- Responsive mobile-first design

---

## Quick Reference

| Task | Command / Path |
|------|----------------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Type check | `npx tsc --noEmit` |
| Auth config | `src/lib/auth.ts` |
| API client | `src/lib/api/server.ts` |
| BFF proxy | `src/lib/api/proxy.ts` |
| Middleware | `middleware.ts` |
| Public data | `src/lib/data/schools-public.ts` |
| Type enums | `src/lib/types/database.ts` |
