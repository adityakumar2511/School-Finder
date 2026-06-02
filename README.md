# SchoolFinder

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
13. [Future Roadmap](#13-future-roadmap)
14. [License and Contribution](#14-license-and-contribution)

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
.
├── README.md                 # This file — ecosystem overview
├── frontend/                 # Next.js application (UI, auth, SEO)
│   ├── src/app/              # App Router pages and BFF API routes
│   ├── src/components/       # UI and feature components
│   ├── src/lib/              # Auth, API clients, data fetchers, SEO
│   ├── Frontend.md           # Frontend architecture documentation
│   └── vercel.json           # Vercel build configuration
│
└── backend/                  # Express REST API + database owner
    ├── prisma/
    │   ├── schema.prisma     # Database schema (source of truth)
    │   └── migrations/       # Prisma migration history
    ├── generated/prisma/     # Generated Prisma client
    ├── src/controllers/      # Business logic
    ├── src/routes/           # HTTP route definitions
    ├── src/middleware/       # Auth, security, validation
    ├── Backend.md            # Backend architecture documentation
    └── render.yaml           # Render deployment blueprint
```

| Folder | Responsibility |
|--------|----------------|
| `frontend/` | User interface, NextAuth sessions, middleware route protection, SEO, image upload route, BFF proxies to backend |
| `backend/` | All REST APIs, JWT issuance, Prisma/database access, admin moderation, inquiries, favourites, parent APIs |

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
| Resend | Password reset and OTP emails |
| Cloudinary | Server-side image utilities |
| Multer | In-memory upload parsing (available, not mounted on routes) |

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

Parents receive a backend token on login (`backendAccessToken` in session). School admins and admins receive tokens from backend login; admins also store JWT in HTTP-only cookie `sf_admin_token`. When no backend token is in session, the frontend can mint a short-lived compatible JWT using shared `JWT_SECRET`.

### Parent (`PARENT`)

| Route | Purpose |
|-------|---------|
| `/login` | Sign in (Google or email/password) |
| `/register` | Create parent account |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password using a reset token |

Backend: `POST /api/auth/register-parent`, `POST /api/auth/login` (`expectedRole: "PARENT"`), `POST /api/auth/google-sync`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.

### School administrator (`SCHOOL_ADMIN`)

| Route | Purpose |
|-------|---------|
| `/school-login` | School admin sign-in |
| `/school-register` | Register school + owner (status `PENDING` until approved) |

Backend: `POST /api/auth/register-school`, `POST /api/auth/login` with `expectedRole: "SCHOOL_ADMIN"`.

### Platform administrator (`ADMIN`)

| Route | Purpose |
|-------|---------|
| `/admin-login` | Hidden route (not linked in public navigation) |

Flow: backend login with `expectedRole: "ADMIN"` → JWT in HTTP-only cookie `sf_admin_token` → NextAuth session sync for middleware.

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

- Search and filter schools (city, board, medium, school type, text search)
- View school detail pages (fees, facilities, gallery, contact)
- Save schools to **favourites** (toggle on school detail pages)
- Send **inquiries** to approved schools
- **Parent dashboard** (`/parent`): profile, favourites, recently viewed, sent inquiries

### Schools

- **Registration wizard** with profile, academics, and fees
- **School dashboard**: inquiry list with status (`NEW`, `CONTACTED`, `CLOSED`)
- **Profile management**: update listing, logo, gallery
- **Status visibility**: pending / approved / rejected with moderation messaging

### Administrators

- **School moderation**: approve, reject, direct add school
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
| `RESEND_API_KEY` / `EMAIL_FROM` | Password reset emails (Resend) |
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
| `GET /health` | `{ "status": "ok", "database": "connected" }` |
| Public school listing | Loads on `/schools` |
| CORS | Browser requests from Vercel origin succeed |
| Auth | Parent login and admin login work on production URLs |
| Sitemap | `/sitemap.xml` includes approved schools from API |

---

## 11. Security Features

| Feature | Implementation |
|---------|----------------|
| **JWT auth** | HS256, issuer `schoolfinder-api`, Bearer tokens; logout blacklist |
| **Role protection** | Middleware (frontend) + `requireRole` (backend) |
| **Hidden admin login** | `/admin-login` not in public nav; `expectedRole: ADMIN` on API |
| **Upload validation** | MIME, extension, 5MB limit, magic-byte checks |
| **Rate limiting** | 100 req/15 min general; 10 req/15 min auth; 3/h forgot; 5/h reset |
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

## 13. Future Roadmap

| Area | Direction |
|------|-----------|
| **Inquiry notifications** | Email or WhatsApp for inquiry status and school approval updates |
| **Multilingual** | Hindi and regional language UI |
| **AI recommendations** | School suggestions from parent preferences |
| **Fee comparison** | Side-by-side fee tables across saved schools |
| **Analytics** | School and platform engagement dashboards |
| **Reviews** | Moderated parent reviews post-verification |
| **Mobile app** | React Native or Expo consuming the same API |
| **Redis** | Replace in-memory cache on the backend |

---

## 14. License and Contribution

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
