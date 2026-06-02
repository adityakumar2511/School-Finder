# SchoolFinder — Frontend Documentation

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
16. [Future Improvements](#16-future-improvements)

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
frontend/
├── middleware.ts                 # Edge middleware — role-based redirects
├── vercel.json                   # Vercel build and region config
├── .env.example                  # Environment template (no DATABASE_URL)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout, fonts, Navbar, Footer
│   │   ├── page.tsx              # Homepage
│   │   ├── providers.tsx         # Session provider + SessionHeartbeat
│   │   ├── robots.ts             # Crawler rules
│   │   ├── sitemap.ts            # Dynamic sitemap (approved schools via API)
│   │   ├── globals.css           # CSS variables, Tailwind layers
│   │   │
│   │   ├── login/                # Parent sign-in
│   │   ├── register/             # Parent registration
│   │   ├── forgot-password/      # Request password reset (calls backend directly)
│   │   ├── reset-password/       # Set new password via reset token
│   │   ├── school-login/         # School admin sign-in
│   │   ├── school-register/      # School registration wizard
│   │   ├── admin-login/          # Hidden admin sign-in
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   │
│   │   ├── schools/              # Public school discovery
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   │
│   │   ├── parent/               # Parent dashboard (PARENT only)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   ├── favourites/
│   │   │   └── inquiries/
│   │   │
│   │   ├── dashboard/school/     # School admin panel (SCHOOL_ADMIN only)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── inquiries/
│   │   │   └── profile/
│   │   │
│   │   ├── admin/                # Platform admin (ADMIN only)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── schools/
│   │   │   ├── users/
│   │   │   ├── inquiries/
│   │   │   └── add-school/
│   │   │
│   │   └── api/                  # BFF route handlers
│   │       ├── auth/[...nextauth]/   # NextAuth handlers
│   │       ├── upload/               # Cloudinary upload
│   │       ├── admin/                # Session cookie, approve/reject proxies
│   │       ├── parent/               # Profile, favourites proxies
│   │       └── school/               # Profile, gallery, inquiry status proxies
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── auth/                 # CredentialsLoginForm, AuthRoleGuard
│   │   ├── admin/                # AdminNav, moderation actions, pagination
│   │   ├── school/               # Dashboard nav, profile, inquiries, wizard
│   │   ├── parent/               # ParentNav, profile, recent schools
│   │   ├── home/                 # FeaturedSchools (+ skeleton)
│   │   ├── schools/              # FavouriteButton, InquiryModal, skeletons
│   │   ├── upload/               # ImageUploadField
│   │   ├── motion/               # fade-in, stagger-grid
│   │   ├── seo/                  # JsonLd
│   │   ├── SessionHeartbeat.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   └── lib/
│       ├── api/
│       │   ├── server.ts         # backendFetch, adminFetch, getBackendToken
│       │   ├── proxy.ts          # proxyToBackend for BFF routes
│       │   └── pagination.ts     # Paginated response parser
│       ├── types/
│       │   └── database.ts       # Role, SchoolStatus, InquiryStatus enums
│       ├── auth.ts               # NextAuth configuration (JWT only)
│       ├── auth-config.ts        # Route constants, role homes, redirects
│       ├── admin-auth.ts         # Admin JWT cookie name, API base
│       ├── backend-jwt.ts        # mintBackendJwt for server-side API calls
│       ├── middleware-auth.ts    # Middleware redirect resolution
│       ├── logout.ts             # Centralized sign-out
│       ├── parent-token.ts       # sessionStorage helper for client API calls
│       ├── admin/                # Admin server data (adminFetch)
│       ├── school/               # School dashboard data (backendFetch)
│       ├── parent/               # Parent data (backendFetch)
│       ├── data/schools-public.ts # Public API fetchers + ISR
│       ├── seo.ts                # Metadata, JSON-LD builders
│       ├── upload-security.ts    # MIME, size, magic-byte validation
│       ├── upload-client.ts      # Client upload with progress
│       ├── cloudinary.ts         # Server-side Cloudinary upload
│       └── utils.ts              # cn() and shared utilities
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

Token resolution order:

1. **ADMIN** — `sf_admin_token` HTTP-only cookie
2. **PARENT** — `session.backendAccessToken` from login
3. **Fallback** — `mintBackendJwt()` using shared `JWT_SECRET`

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
| `PATCH /api/parent/profile` | `/api/parent/profile` | Session JWT |
| `DELETE /api/parent/favourites` | `/api/parent/favourites?schoolId=` | Session JWT |
| `PATCH /api/school/profile` | `/api/schools/:id` | Session JWT |
| `GET/POST /api/school/gallery` | `/api/schools/my-school/images` | Session JWT |
| `DELETE /api/school/gallery/[id]` | `/api/schools/images/:id` | Session JWT |
| `PATCH /api/school/inquiries/[id]/status` | `/api/inquiries/:id/status` | Session JWT |
| `PATCH /api/admin/schools/[id]/approve` | `/api/admin/schools/:id/approve` | Admin cookie |
| `PATCH /api/admin/users/[id]/role` | `/api/admin/users/:id/role` | Admin cookie |

### Domain Data Modules

| Module | Backend endpoints |
|--------|-------------------|
| `lib/data/schools-public.ts` | `GET /api/schools`, `GET /api/schools/:slug`, `GET /api/schools/search` |
| `lib/school/data.ts` | `GET /api/schools/my-school`, `GET /api/inquiries/school/:id` |
| `lib/parent/data.ts` | `GET/PATCH /api/parent/profile`, `GET /api/parent/favourites`, `GET /api/parent/inquiries` |
| `lib/admin/data.ts` | `GET /api/admin/stats`, `/schools`, `/users`, `/inquiries` |

### Type Definitions

Shared enums live in `src/lib/types/database.ts` (not generated from Prisma):

```typescript
export type Role = "PARENT" | "SCHOOL_ADMIN" | "ADMIN";
export type SchoolStatus = "PENDING" | "APPROVED" | "REJECTED";
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
| Providers | Google, Credentials (parent/school/admin contexts) |
| Secret | `AUTH_SECRET` or `NEXTAUTH_SECRET` |

**No PrismaAdapter.** OAuth Account/Session tables exist in the backend schema but are not used by the frontend.

### Parent (`PARENT`)

| Route | Purpose |
|-------|---------|
| `/login` | Google or email/password (`authContext: parent`) |
| `/register` | Create parent account |
| `/forgot-password` | Calls backend `POST /api/auth/forgot-password` |
| `/reset-password` | Calls backend `POST /api/auth/reset-password` |

- Google sign-in calls backend `POST /api/auth/google-sync`; only `PARENT` role allowed.
- Credentials login calls backend `POST /api/auth/login` with `expectedRole: "PARENT"`.
- Backend JWT stored as `session.backendAccessToken`.

### School Administrator (`SCHOOL_ADMIN`)

| Route | Purpose |
|-------|---------|
| `/school-login` | Credentials sign-in (`authContext: school`) |
| `/school-register` | Multi-step registration wizard |

- Login via backend with `expectedRole: "SCHOOL_ADMIN"`.
- Server-side API calls use minted JWT when backend token not in session.

### Platform Administrator (`ADMIN`)

| Route | Purpose |
|-------|---------|
| `/admin-login` | Hidden — not in public navigation |

**Flow:**

1. POST to backend `POST /api/auth/login` with `expectedRole: "ADMIN"`.
2. Store JWT in HTTP-only cookie `sf_admin_token` via `POST /api/admin/session`.
3. NextAuth credentials sign-in syncs session for middleware.
4. Admin data fetching uses `adminFetch()` with cookie token.

### Session Model

- **NextAuth JWT fields:** `id`, `role`, `backendAccessToken` (parents)
- **Role refresh:** JWT callback calls `GET /api/auth/me` to sync role from backend
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

**School detail (public):** `InquiryModal` and `FavouriteButton` call backend favourites/inquiries endpoints (direct or via BFF).

### School Dashboard (`/dashboard/school`)

| Route | Description | Data source |
|-------|-------------|-------------|
| `/dashboard/school` | Overview, status card, inquiry summary | `GET /api/schools/my-school` |
| `/dashboard/school/inquiries` | Inquiry list with filters | `GET /api/inquiries/school/:id` |
| `/dashboard/school/profile` | Profile editor, logo, gallery | BFF `/api/school/*` |

**Inquiry status updates:** `PATCH /api/school/inquiries/[id]/status` → backend `/api/inquiries/:id/status`.

### Admin Dashboard (`/admin`)

| Route | Description | Data source |
|-------|-------------|-------------|
| `/admin` | Platform stats | `GET /api/admin/stats` |
| `/admin/schools` | School moderation | `GET /api/admin/schools` |
| `/admin/users` | User management | `GET /api/admin/users` |
| `/admin/inquiries` | Cross-school inquiries | `GET /api/admin/inquiries` |
| `/admin/add-school` | Manual school creation | `POST /api/admin/add-school` |

**Moderation:** Approve/reject via BFF routes → `PATCH /api/admin/schools/:id/approve|reject`.

Only `APPROVED` schools appear in public listings and sitemap.

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

## 16. Future Improvements

| Area | Direction |
|------|-----------|
| **Unified client API layer** | Consolidate direct backend calls and BFF routes |
| **AI recommendations** | Personalized school suggestions |
| **Inquiry notifications** | Real-time or email alerts |
| **Mobile app** | React Native companion using the same API |

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

*Last updated: Post-Prisma migration — frontend uses backend REST API exclusively; NextAuth JWT-only strategy; no database dependency.*
