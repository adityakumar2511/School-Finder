# SchoolFinder — Frontend Documentation

> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · NextAuth v5 · Prisma · Cloudinary  
> **Default port:** `3000` · **Repository path:** `frontend/`

This document describes the production-ready SchoolFinder frontend: architecture, authentication, routing, performance, deployment, and security. It reflects the current implementation after performance hardening (FIX-19) and deployment readiness (FIX-20).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Authentication Architecture](#4-authentication-architecture)
5. [Route Protection](#5-route-protection)
6. [Dashboard Architecture](#6-dashboard-architecture)
7. [Upload System](#7-upload-system)
8. [SEO Architecture](#8-seo-architecture)
9. [Performance Optimizations](#9-performance-optimizations)
10. [Environment Variables](#10-environment-variables)
11. [Local Development Setup](#11-local-development-setup)
12. [Production Deployment](#12-production-deployment)
13. [Security Notes](#13-security-notes)
14. [UI/UX System](#14-uiux-system)
15. [Future Improvements](#15-future-improvements)

---

## 1. Project Overview

### Purpose

SchoolFinder is a school discovery platform for India. The frontend enables:

- **Parents** to browse, compare, and inquire about CBSE, ICSE, and state board schools
- **School administrators** to manage profiles, galleries, and parent inquiries
- **Platform administrators** to moderate schools, users, and inquiries

Public marketing and listing pages are SEO-optimized. Authenticated areas are role-isolated and excluded from search indexing.

### Next.js 14 Architecture

The application uses the **App Router** with:

- **Server Components** by default for data fetching, SEO metadata, and layout composition
- **Client Components** only where interactivity is required (forms, uploads, filters, session actions)
- **Route handlers** under `app/api/` for uploads, profile mutations, and admin proxies
- **ISR / caching** via `fetch(..., { next: { revalidate } })` for public school data

### Role-Based Authentication

Three distinct roles are enforced at the middleware and layout level:

| Role | Primary entry | Home after login |
|------|---------------|------------------|
| `PARENT` | `/login`, `/register` | `/` (public home; parent area at `/parent`) |
| `SCHOOL_ADMIN` | `/school-login`, `/school-register` | `/dashboard/school` |
| `ADMIN` | `/admin-login` (hidden) | `/admin` |

Authentication is **not** a single shared login page. Each role has dedicated routes and redirect rules.

---

## 2. Tech Stack

| Technology | Usage |
|------------|--------|
| **Next.js 14** | App Router, SSR, API routes, image optimization |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS** | Utility-first styling, design tokens |
| **shadcn/ui** | Accessible primitives (`Button`, `Card`, `Table`, `Dialog`, etc.) |
| **NextAuth v5** | JWT sessions, Google OAuth, credentials provider |
| **Prisma** | Database ORM (shared Neon PostgreSQL with backend) |
| **Zod** | Form and API validation |
| **React Hook Form** | Client form state and validation |
| **Cloudinary** | Image storage and delivery (via server upload route) |
| **Lucide React** | Icon system |

**External API:** Express backend at `NEXT_PUBLIC_API_URL` for public school listings, admin JWT auth, and some mutations.

---

## 3. Folder Structure

```
frontend/
├── middleware.ts                 # Edge middleware — role-based redirects
├── vercel.json                   # Vercel build and region config
├── .env.example                  # Environment template (no secrets)
├── prisma/
│   └── schema.prisma             # Shared database schema
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout, fonts, Navbar, Footer
│   │   ├── page.tsx              # Homepage
│   │   ├── providers.tsx         # Session provider
│   │   ├── robots.ts             # Crawler rules
│   │   ├── sitemap.ts            # Dynamic sitemap (approved schools)
│   │   ├── globals.css           # CSS variables, Tailwind layers
│   │   │
│   │   ├── login/                # Parent sign-in (links to forgot-password)
│   │   ├── register/             # Parent registration
│   │   ├── forgot-password/      # Request password reset email
│   │   ├── reset-password/       # Set new password via reset token
│   │   ├── school-login/         # School admin sign-in (links to forgot-password)
│   │   ├── school-register/      # School registration wizard
│   │   ├── admin-login/          # Hidden admin sign-in
│   │   ├── not-found.tsx         # Global 404 page
│   │   ├── error.tsx             # Runtime error boundary
│   │   ├── global-error.tsx      # Root layout error boundary
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
│   │   │   └── inquiries/        # Sent inquiries with status badges
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
│   │   └── api/                  # Next.js route handlers
│   │       ├── auth/[...nextauth]/
│   │       ├── upload/
│   │       ├── school/           # Profile, gallery, inquiry status
│   │       ├── parent/           # Profile, favourites
│   │       └── admin/            # Session cookie, approve/reject proxies
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── auth/                 # CredentialsLoginForm, AuthRoleGuard
│   │   ├── admin/                # AdminNav, moderation actions, pagination
│   │   ├── school/               # Dashboard nav, profile, inquiries, wizard
│   │   ├── parent/               # ParentNav, profile, recent schools
│   │   ├── home/                 # FeaturedSchools (+ skeleton)
│   │   ├── schools/              # School discovery UI
│   │   │   ├── InquiryModal.tsx  # Parent inquiry modal (school detail)
│   │   │   └── FavouriteButton.tsx # Parent bookmark toggle (school detail)
│   │   ├── upload/               # ImageUploadField
│   │   ├── SessionHeartbeat.tsx  # Keeps session alive while tab is open
│   │   ├── seo/                  # JsonLd
│   │   ├── SchoolCard.tsx
│   │   ├── SchoolFilters.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   └── lib/
│       ├── auth.ts               # NextAuth configuration
│       ├── auth-config.ts        # Route constants, role homes, redirects
│       ├── middleware-auth.ts    # Middleware redirect resolution
│       ├── logout.ts             # Centralized sign-out
│       ├── admin-auth.ts         # Admin JWT cookie name, API base
│       ├── admin/                # Admin server data helpers
│       ├── school/               # School dashboard data, gallery
│       ├── parent/               # Parent data, recent schools
│       ├── data/schools-public.ts # Public API fetchers + ISR
│       ├── api/pagination.ts     # Paginated response parser
│       ├── seo.ts                # Metadata, JSON-LD builders
│       ├── upload-security.ts    # MIME, size, magic-byte validation
│       ├── upload-client.ts      # Client upload with progress
│       ├── cloudinary.ts         # Server-side Cloudinary upload
│       ├── image-placeholder.ts  # Blur placeholder for next/image
│       └── utils.ts              # cn() and shared utilities
```

### Middleware

- **File:** `middleware.ts` (project root, not under `src/`)
- **Logic:** Delegates to `src/lib/middleware-auth.ts`
- **Matcher:** Admin, dashboard, parent, and all role-specific auth routes

### Auth Structure

| Concern | Location |
|---------|----------|
| NextAuth config | `src/lib/auth.ts` |
| Route constants | `src/lib/auth-config.ts` |
| Middleware rules | `src/lib/middleware-auth.ts` |
| Admin backend JWT | `src/lib/admin-auth.ts`, `app/api/admin/session/` |
| Sign-out | `src/lib/logout.ts` |

### Upload System

| Layer | Location |
|-------|----------|
| Client UI | `components/upload/ImageUploadField.tsx` |
| Client API | `lib/upload-client.ts` |
| Server route | `app/api/upload/route.ts` |
| Validation | `lib/upload-security.ts` |
| Cloudinary | `lib/cloudinary.ts` |

---

## 4. Authentication Architecture

### Parent (`PARENT`)

| Route | Purpose |
|-------|---------|
| `/login` | Sign in with Google or email/password (`authContext: parent`) |
| `/register` | Create parent account |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password using a reset token from email |

- Google sign-in is restricted to **parent** accounts only (existing non-parent emails are rejected).
- Credentials use NextAuth `CredentialsProvider` with `AUTH_CONTEXT_ROLE.parent`.
- `/login` and `/school-login` link to `/forgot-password`.

### School Administrator (`SCHOOL_ADMIN`)

| Route | Purpose |
|-------|---------|
| `/school-login` | School admin credentials sign-in |
| `/school-register` | Multi-step school registration wizard |

- Credentials provider expects `authContext: school`.
- After approval, admins manage the school at `/dashboard/school`.

### Platform Administrator (`ADMIN`)

| Route | Purpose |
|-------|---------|
| `/admin-login` | **Hidden** — not linked in public navigation |

**Flow:**

1. POST credentials to backend `POST /api/auth/login` with `expectedRole: "ADMIN"`.
2. Backend returns JWT; frontend stores it in HTTP-only cookie `sf_admin_token`.
3. NextAuth credentials sign-in syncs session (`authContext: admin`) for middleware compatibility.
4. Admin API routes use the backend token via `lib/admin/session.ts`.

### Role Separation

- Each role has dedicated login/register URLs.
- `auth-config.ts` defines `ROLE_HOME` and `ROLE_LOGOUT_REDIRECT` per role.
- Cross-role access to another role’s auth or dashboard routes triggers middleware redirects.

### Session Model

- **Strategy:** JWT (not database sessions for middleware speed).
- **Token fields:** `id`, `role` (refreshed from DB on each JWT callback).
- **Max age:** 1800 seconds (30 minutes) on both session and JWT.
- **Secret:** `AUTH_SECRET` or `NEXTAUTH_SECRET`.
- **Production:** `trustHost: true` for Vercel; HTTPS enables secure cookies automatically.

### Post-Login Redirect (`callbackUrl`)

When middleware or a layout redirects an unauthenticated user to a login page, the original path is preserved as a `callbackUrl` query parameter. After successful sign-in, login pages redirect to that URL when it is safe (same-origin, non-auth route); otherwise they fall back to the role’s `ROLE_HOME`. This restores the page the user was trying to access instead of always sending them to a fixed home route.

---

## 5. Route Protection

### Middleware Flow

```
Request → getToken (JWT) → resolveMiddlewareRedirect(pathname, role)
         → redirect OR NextResponse.next()
         → no-store headers on protected dashboard responses
```

### Rules Summary

| Area | Allowed role | Unauthenticated redirect |
|------|--------------|--------------------------|
| `/parent/*` | `PARENT` | `/login?callbackUrl=…` |
| `/dashboard/school/*` | `SCHOOL_ADMIN` | `/school-login?callbackUrl=…` |
| `/admin/*` | `ADMIN` | `/admin-login?callbackUrl=…` |

All other routes remain public unless explicitly protected elsewhere.

**Cross-role behavior:**

- `ADMIN` visiting school dashboard → `/admin`
- `SCHOOL_ADMIN` visiting `/admin` → `/dashboard/school`
- `PARENT` visiting admin or school dashboard → `/`
- Signed-in users hitting another role’s login page → their `ROLE_HOME`

### Protected Dashboards

All dashboard layouts set `robots: { index: false }` and rely on middleware for access control. Server layouts may also call `auth()` for defense in depth.

### Noindex Routes

Applied via `next.config.ts` headers and `robots.ts` disallow:

- `/admin`, `/admin/*`
- `/dashboard/*`
- `/parent/*`
- `/admin-login`, `/school-login`
- `/login`, `/register`
- `/api/*`

Public school pages (`/`, `/schools`, `/schools/[slug]`) remain indexable.

---

## 6. Dashboard Architecture

### Parent Dashboard (`/parent`)

| Route | Description |
|-------|-------------|
| `/parent` | Overview, recently viewed schools |
| `/parent/profile` | Edit parent profile |
| `/parent/favourites` | Saved schools with pagination |
| `/parent/inquiries` | Sent inquiries with status badges and pagination |

**Permissions:** `PARENT` only. Data via Prisma server components and `/api/parent/*` routes.

**Features:** Favourites CRUD, profile update, optional `TrackSchoolView` on school detail pages.

**School detail page (public):** `InquiryModal` lets signed-in parents send inquiries to approved schools. `FavouriteButton` toggles bookmarks via `POST`/`DELETE` `/api/favourites`. Both components are role-gated to `PARENT` only.

---

### School Dashboard (`/dashboard/school`)

| Route | Description |
|-------|-------------|
| `/dashboard/school` | Overview, status card, inquiry summary |
| `/dashboard/school/inquiries` | Inquiry list with filters, search, pagination |
| `/dashboard/school/profile` | School profile editor, logo upload, gallery manager |

**Permissions:** `SCHOOL_ADMIN` only. Data via `lib/school/data.ts` and `/api/school/*`.

**Inquiry management:** Status updates (`NEW`, `CONTACTED`, `CLOSED`) via PATCH `/api/school/inquiries/[id]/status` with ownership checks on the backend.

---

### Admin Dashboard (`/admin`)

| Route | Description |
|-------|-------------|
| `/admin` | Platform overview stats |
| `/admin/schools` | School moderation (approve/reject), search, pagination |
| `/admin/users` | User management (role, disable) |
| `/admin/inquiries` | Cross-school inquiry oversight |
| `/admin/add-school` | Manual school creation |

**Permissions:** `ADMIN` only. Uses backend admin API with JWT from `sf_admin_token`.

**Moderation flow:**

1. Schools register as `PENDING`.
2. Admin reviews listing at `/admin/schools`.
3. Approve/reject via `/api/admin/schools/[id]/approve` or `reject`.
4. Only `APPROVED` schools appear in public listings and sitemap.

---

## 7. Upload System

### Cloudinary Integration

- Uploads go through **`POST /api/upload`** (Next.js server route only).
- **Authentication required:** valid NextAuth session with role `PARENT`, `SCHOOL_ADMIN`, or `ADMIN`.
- **Rate limit:** 10 uploads per hour per user (in-memory counter on the server route; returns `429` when exceeded).
- Credentials (`CLOUDINARY_*`) never reach the browser.
- Folders: `school-platform/logos`, `school-platform/gallery`, `school-platform/profiles`.

### Restrictions

| Rule | Value |
|------|--------|
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Max file size | **5 MB** |
| Blocked types | SVG, PDF, executables, scripts, HTML, etc. |
| Magic-byte check | Server validates actual file content vs declared MIME |

### Client Behavior

- `ImageUploadField` shows progress via `upload-client.ts`.
- Validation runs client-side first (`validateUploadFile`), then server-side again.
- Cloudinary delivery uses `quality: auto` and `fetch_format: auto` for optimized URLs.

### Usage

- School logo and gallery: profile dashboard, registration wizard
- Parent profile image: parent profile page
- Admin add-school: logo upload

---

## 8. SEO Architecture

### Metadata

- **Root:** `lib/seo.ts` → `rootMetadata`, `buildPageMetadata()`, `buildSchoolMetadata()`
- **Per page:** `export const metadata` or `generateMetadata()` on dynamic routes
- **School detail:** Dynamic title, description, canonical URL, Open Graph, Twitter cards

### Sitemap

- **File:** `app/sitemap.ts`
- **Source:** Prisma query for `APPROVED` schools
- **URL base:** `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`

### Robots

- **File:** `app/robots.ts`
- Allows public discovery routes; disallows private and auth routes
- Points to `/sitemap.xml`

### Open Graph

- Generated in `buildSchoolMetadata()` and root metadata
- Uses school logo or site default image when available

### Structured Data

- **Component:** `components/seo/JsonLd.tsx`
- **Types:** `WebSite` (home), `EducationalOrganization` + `BreadcrumbList` (school detail)
- Injected as JSON-LD script tags in Server Components

---

## 9. Performance Optimizations

### Suspense and Streaming

| Surface | Pattern |
|---------|---------|
| Homepage featured schools | `Suspense` + `FeaturedSchoolsSkeleton` |
| Schools listing | `Suspense` + `SchoolGridSkeleton` |
| Route transitions | `app/schools/loading.tsx`, `app/schools/[slug]/loading.tsx` |
| Filters sidebar | `Suspense` with pulse fallback |

### Lazy Loading

- `TrackSchoolView` — `dynamic()` import on school detail (parent-only)
- School card images — `loading="lazy"` below the fold
- Hero school logo — `priority` for LCP

### Image Optimization (`next/image`)

- Remote patterns: Cloudinary, Google avatars
- Formats: AVIF, WebP (via Next.js image pipeline)
- `sizes` attribute per layout breakpoint
- Shared blur placeholder: `lib/image-placeholder.ts`

### Re-render Control

- `SchoolCard` wrapped in `React.memo`
- Server Components pass stable props; minimal client state on listing pages

### Pagination Strategy

- **Public listings:** Backend default **12** schools per page; `lib/api/pagination.ts` normalizes `{ data, pagination }`
- **Admin tables:** Server-side pagination via query params
- **School inquiries / favourites:** Dedicated pagination components

### Data Fetching

- `lib/data/schools-public.ts` — centralized fetchers with ISR (`revalidate: 60` listing, `3600` featured)

### Session Heartbeat

- **Component:** `components/SessionHeartbeat.tsx`, mounted in `app/providers.tsx`
- **Behavior:** While the user is authenticated, pings `GET /api/auth/session` every **10 minutes** to refresh the JWT before the 30-minute `maxAge` expires
- **Purpose:** Keeps active tabs signed in without requiring manual re-login during normal use

---

## 10. Environment Variables

Copy `frontend/.env.example` to `.env.local`. Never commit real secrets.

| Variable | Required | Description | Production notes |
|----------|----------|-------------|------------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL for SEO and sitemap | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Yes | Express API base URL (browser-visible) | Must be **HTTPS** |
| `NEXTAUTH_URL` | Yes | NextAuth canonical URL | Same as public site URL |
| `AUTH_URL` | Yes | NextAuth v5 alias | Same as `NEXTAUTH_URL` |
| `NEXTAUTH_SECRET` | Yes | Session encryption secret | `openssl rand -base64 32` |
| `AUTH_SECRET` | Yes | NextAuth v5 alias | Same value as `NEXTAUTH_SECRET` |
| `AUTH_TRUST_HOST` | Yes (Vercel) | Trust deployment host for callbacks | `true` |
| `GOOGLE_CLIENT_ID` | Yes* | Google OAuth client ID | Add production redirect URI |
| `GOOGLE_CLIENT_SECRET` | Yes* | Google OAuth secret | Server-only |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string | Include `?sslmode=require` |
| `CLOUDINARY_CLOUD_NAME` | Yes** | Cloudinary cloud name | Server-only (upload route) |
| `CLOUDINARY_API_KEY` | Yes** | Cloudinary API key | Server-only |
| `CLOUDINARY_API_SECRET` | Yes** | Cloudinary API secret | Server-only |

\* Required if Google sign-in is enabled.  
\** Required for image uploads.

### What must not be exposed

Only variables prefixed with `NEXT_PUBLIC_` are bundled for the browser. Keep `AUTH_SECRET`, `DATABASE_URL`, and `CLOUDINARY_API_SECRET` server-side only.

---

## 11. Local Development Setup

### Prerequisites

- Node.js 18+
- Neon PostgreSQL database (or local Postgres)
- Express backend running on port `4000`
- Cloudinary account (for uploads)
- Google OAuth credentials (optional, for parent Google login)

### Steps

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Push schema and generate Prisma client
npx prisma db push
npx prisma generate

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend dependency

Set `NEXT_PUBLIC_API_URL=http://localhost:4000` and ensure the backend is running. Public school pages degrade gracefully when the API is unavailable (empty states, no crash).

### First admin user

1. Sign in with Google or register as a parent.
2. In Neon SQL editor:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

3. Sign out and use `/admin-login`.

---

## 12. Production Deployment

### Target: Vercel

Configuration file: `vercel.json`

```json
{
  "buildCommand": "npx prisma generate && npm run build",
  "regions": ["bom1"]
}
```

### Deployment steps

1. Connect the repository to Vercel.
2. Set root directory to `frontend` (if monorepo).
3. Add all environment variables from [Section 10](#10-environment-variables) for **Production**.
4. Deploy. Vercel runs `prisma generate` then `next build`.

### Production build (local verify)

```bash
npx prisma generate
npm run build
npm start
```

### Domain setup

1. Add custom domain in Vercel → **Domains**.
2. Update `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL`, and `AUTH_URL` to the production domain.
3. Update Google OAuth authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`
4. Update backend `FRONTEND_URL` to match the Vercel domain (CORS).

### CSP and API URL

`next.config.ts` injects `NEXT_PUBLIC_API_URL` into Content-Security-Policy `connect-src` at **build time**. Redeploy the frontend after changing the API URL.

### Production checklist

| Step | Action |
|------|--------|
| 1 | Deploy backend (Render/Railway) with HTTPS |
| 2 | Set `NEXT_PUBLIC_API_URL` to backend HTTPS URL |
| 3 | Set canonical site and auth URLs on Vercel |
| 4 | Configure Neon `DATABASE_URL` with SSL |
| 5 | Configure Cloudinary and Google OAuth |
| 6 | Verify `/health` on backend and smoke-test auth + listings |
| 7 | Confirm sitemap and robots in production |

---

## 13. Security Notes

### Protected routes

- Middleware enforces role boundaries on all dashboard and admin paths.
- Layout-level `auth()` checks provide additional server-side guards.

### Hidden admin login

- `/admin-login` is not linked in `Navbar` or public UI.
- `HideOnAdminLogin` hides global chrome on the admin login page.
- Unauthenticated `/admin/*` requests redirect to `/admin-login`.

### Upload validation

- Client and server validation (MIME, extension, size, magic bytes).
- SVG and executable types explicitly blocked.
- Upload route runs on Node.js runtime only.

### Auth restrictions

- Google OAuth limited to parent role on sign-in.
- Credentials provider validates `authContext` against expected role.
- Disabled accounts (`phone = "__DISABLED__"`) cannot sign in.
- Admin uses separate backend JWT + HTTP-only cookie.

### Frontend security behavior

- Security headers via `next.config.ts` (HSTS, CSP, X-Frame-Options, etc.).
- `upgrade-insecure-requests` in production CSP.
- `poweredByHeader: false`.
- Protected responses use `Cache-Control: no-store` in middleware.
- Rate limiting on backend (frontend relies on API for brute-force protection).

---

## 14. UI/UX Design System (FIX-26)

### Design principles

- **Trust and clarity** — education-focused blue palette with amber CTAs
- **Mobile-first** — responsive grids and touch-friendly controls (min 44px tap targets on primary actions)
- **Consistency** — shared tokens in `tailwind.config.ts` and utility classes in `globals.css`
- **Accessibility** — WCAG-friendly contrast, visible `:focus-visible` rings, semantic HTML

### Typography

Fonts are loaded in `src/app/layout.tsx` via `next/font/google`.

| Role | Font | Weights | Tailwind |
|------|------|---------|----------|
| Headings, buttons, nav | Plus Jakarta Sans | 600, 700 | `font-heading` |
| Body, labels, meta | Inter | 400, 500 | `font-body` |

| Element | Spec | Tailwind classes |
|---------|------|------------------|
| H1 | Plus Jakarta Sans 700, 36–48px | `font-heading font-bold text-h1` |
| H2 | Plus Jakarta Sans 700, 28–32px | `font-heading font-bold text-h2` |
| H3 | Plus Jakarta Sans 600, 20–24px | `font-heading font-semibold text-h3` |
| Body | Inter 400, 15–16px, line-height 1.7 | `font-body text-body` or `text-body-lg` |
| Labels / meta | Inter 400, 12–13px | `font-body text-label` / `text-meta` |
| Buttons | Plus Jakarta Sans 600, 14px | `font-heading text-btn font-semibold` |

Base heading styles are applied in `globals.css` (`h1`–`h3`).

### Color palette

**Primary blue**

| Token | Hex |
|-------|-----|
| `blue-50` | `#E6F1FB` |
| `blue-200` | `#85B7EB` |
| `blue-400` | `#378ADD` |
| `blue-600` | `#185FA5` |
| `blue-800` | `#0C447C` |
| `blue-900` | `#042C53` |

**Accent amber**

| Token | Hex |
|-------|-----|
| `amber-50` | `#FAEEDA` |
| `amber-400` | `#EF9F27` |
| `amber-600` | `#BA7517` |
| `amber-800` | `#633806` |

**Neutral gray**

| Token | Hex |
|-------|-----|
| `gray-50` | `#F1EFE8` |
| `gray-100` | `#D3D1C7` |
| `gray-400` | `#888780` |
| `gray-900` | `#2C2C2A` |

**Semantic** (text on background)

| Role | Text | Background | Classes |
|------|------|------------|---------|
| Success | `#3B6D11` | `#EAF3DE` | `text-success-text bg-success-bg` |
| Warning | `#854F0B` | `#FAEEDA` | `text-warning-text bg-warning-bg` |
| Danger | `#A32D2D` | `#FCEBEB` | `text-danger-text bg-danger-bg` |
| Info | `#185FA5` | `#E6F1FB` | `text-info-text bg-info-bg` |

### Spacing and layout

| Token | Value | Usage |
|-------|-------|--------|
| `section` | 2.5rem (40px) | Vertical gap between dashboard sections (`.dashboard-section`) |
| `card` | 1.5rem (24px) | Default card padding reference |
| Page max width | `max-w-7xl` | Navbar, footer, main marketing layouts |

**Border radius**

| Token | Size | Usage |
|-------|------|--------|
| `rounded-xl` | 12px | Inputs, small controls |
| `rounded-2xl` | 16px | Cards, modals |
| `rounded-3xl` | 24px | Hero search bar |

### Button system

Defined in `src/components/ui/button.tsx` and mirrored as utilities in `globals.css`.

| Variant | Style | When to use |
|---------|-------|-------------|
| `default` (primary) | `bg-blue-600` + white text | Main actions (save, submit, approve) |
| `secondary` | `bg-blue-50` + `text-blue-800` | Secondary actions (cancel adjacent to primary) |
| `cta` | `bg-amber-400` + `text-amber-800` | High-intent CTAs (register school, search) |
| `destructive` | `bg-danger-text` + white | Delete, reject, disable |
| `outline` / `ghost` | Neutral borders / hover | Tertiary actions |

Utility classes: `.btn-primary`, `.btn-secondary`, `.btn-cta`.

### Card system

- Base: `rounded-2xl border border-gray-100 bg-white shadow-card`
- Hover (listings): `.card-premium` with `shadow-card-hover` on hover
- Titles: `CardTitle` uses `text-h3` + `text-blue-800`

### Form system

- Inputs / textareas: `.form-input` — `h-11`, `rounded-xl`, `border-gray-100`, focus ring `ring-blue-600`
- Labels: `.form-label` — `text-label`, `font-medium`
- Errors: `.form-input-error` + `.alert-danger` for messages
- Success feedback: `.alert-success`

### Component consistency rules

1. Use design tokens — avoid raw hex or default Tailwind palette colors (`green-*`, `red-*`).
2. Use `font-heading` / `font-body` — do not mix other font families.
3. Use semantic badges (`Badge` variants: `success`, `warning`, `danger`, `info`).
4. Primary actions use `blue-600`, not `blue-700`.
5. CTA actions use `amber-400` / `amber-800` text per spec.
6. Dashboard section headings use `.dashboard-section-title`.

### Accessibility notes

- Global `:focus-visible` — 2px `ring-blue-600` with offset on `gray-50` background
- Body text on white / `gray-50` uses `gray-900` for sufficient contrast
- CTA amber on white: use `text-amber-800` on `amber-400` backgrounds
- Prefer semantic HTML (`h1`–`h3`, `nav`, `main`, `button`, `label`)
- `prefers-reduced-motion` disables smooth scroll and shortens animations in `globals.css`
- Interactive icons include `aria-hidden` when decorative; forms use associated `<label>` elements

### Responsive behavior

- School grid: 1 column (mobile) → 2 (tablet) → 3 (desktop)
- Dashboards: stacked sidebar navigation on mobile, fixed nav on desktop
- School detail: single column on mobile, two-column layout on large screens

---

## 15. Future Improvements

Planned enhancements (not yet implemented):

| Area | Direction |
|------|-----------|
| **AI recommendations** | Personalized school suggestions based on parent preferences and location |
| **Payments** | Admission fee or inquiry deposit flows (Razorpay/Stripe) |
| **Inquiry notifications** | Email or SMS alerts when inquiry status changes or a school is approved |
| **Analytics** | Parent engagement dashboards, school performance metrics |
| **Mobile app** | React Native or Expo companion using the same API |

---

## Quick Reference

| Task | Command / Path |
|------|----------------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Prisma studio | `npm run db:studio` |
| Env template | `.env.example` |
| Auth config | `src/lib/auth.ts` |
| Middleware | `middleware.ts` |
| Public API fetch | `src/lib/data/schools-public.ts` |
| SEO helpers | `src/lib/seo.ts` |

---

*Last updated: FIX-26 global design system — typography, colors, buttons, cards, forms, and accessibility tokens enforced across the platform.*
