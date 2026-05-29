# SchoolFinder

A full-stack school discovery and inquiry platform built for **Tier-2 and Tier-3 cities in India**. Parents can search and compare schools; school administrators manage listings and inquiries; platform administrators verify listings and maintain quality.

This repository is a **monorepo** with a Next.js frontend, Express API, and shared PostgreSQL database (Neon).

| Layer | Technology | Port (local) |
|-------|------------|--------------|
| Frontend | Next.js 14, NextAuth v5 | `3000` |
| Backend | Express.js, JWT | `4000` |
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
│  Next.js 14 App Router · NextAuth · Prisma (server reads)        │
│  Public SEO pages · Dashboards · Upload route → Cloudinary        │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS
                                │ NEXT_PUBLIC_API_URL
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (Render / Railway)                                  │
│  Express · JWT · Zod validation · Rate limits · Helmet           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Neon PostgreSQL (shared)                                        │
│  Users · Schools · Inquiries · Favourites · NextAuth tables      │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend

- **Next.js 14** (App Router) for SSR, SEO, and role-based dashboards
- **NextAuth v5** for parent Google/credentials sessions (JWT strategy)
- **Prisma** on the server for dashboard data and sitemap generation
- Calls the **Express API** for public listings, admin JWT login, and some mutations

### Backend

- **Express.js** REST API with modular routes and controllers
- **JWT** for API authentication (especially admin and mobile-ready clients)
- **Prisma** with selective queries and pagination defaults

### Database

- **Neon PostgreSQL** (serverless-friendly, SSL)
- Schema is maintained from `frontend/prisma/schema.prisma`
- Backend runs `prisma generate` only; use `db push` from the frontend project

### Media

- **Cloudinary** for logos, gallery images, and profile photos
- Uploads validated server-side (MIME, size, magic bytes); secrets never exposed to the browser

---

## 3. Monorepo Structure

```
.
├── README.md                 # This file — ecosystem overview
├── frontend/                 # Next.js application (UI, auth, SEO)
│   ├── src/app/              # App Router pages and API routes
│   ├── src/components/       # UI and feature components
│   ├── src/lib/              # Auth, data fetchers, SEO, uploads
│   ├── prisma/schema.prisma  # Database schema (source of truth)
│   ├── Frontend.md           # Frontend architecture documentation
│   └── vercel.json           # Vercel build configuration
│
└── backend/                  # Express REST API
    ├── src/controllers/      # Business logic
    ├── src/routes/           # HTTP route definitions
    ├── src/middleware/       # Auth, security, validation
    ├── prisma/               # Schema mirror + client generate
    ├── Backend.md            # Backend architecture documentation
    └── render.yaml           # Render deployment blueprint
```

| Folder | Responsibility |
|--------|----------------|
| `frontend/` | User interface, NextAuth, middleware route protection, SEO, image upload route, Prisma schema ownership |
| `backend/` | Public and protected REST APIs, JWT issuance, admin moderation, inquiry and favourite APIs |

---

## 4. Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 14 | App Router, SSR, API routes |
| TypeScript | Type safety |
| Tailwind CSS | Styling and design tokens |
| shadcn/ui | Accessible UI primitives |
| NextAuth v5 | Authentication (Google + credentials) |
| Prisma | Database access on the server |
| Zod | Form and validation schemas |
| React Hook Form | Client forms |
| Cloudinary | Image delivery (via server upload route) |
| Framer Motion | Subtle UI motion (respects reduced motion) |

### Backend

| Technology | Purpose |
|------------|---------|
| Express.js 5 | HTTP API |
| TypeScript | Type safety |
| Prisma 7 | ORM (`generated/prisma` client) |
| JWT | API token auth |
| Zod | Request validation |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| bcryptjs | Password hashing |
| Cloudinary | Server-side image utilities |
| Multer | In-memory upload parsing |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL (Neon) | Primary data store, SSL in production |

---

## 5. Authentication System

Authentication is **split by role**. There is no single shared login page for all users.

### Parent (`PARENT`)

| Route | Purpose |
|-------|---------|
| `/login` | Sign in (Google or email/password) |
| `/register` | Create parent account |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password using a reset token |

Backend: `POST /api/auth/register-parent`, `POST /api/auth/login` (optional `expectedRole: "PARENT"`), `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.

### School administrator (`SCHOOL_ADMIN`)

| Route | Purpose |
|-------|---------|
| `/school-login` | School admin sign-in |
| `/school-register` | Register school + owner (status `PENDING` until approved) |

Backend: `POST /api/auth/register-school`, `POST /api/auth/login` with `expectedRole: "SCHOOL_ADMIN"`. Password reset uses the same forgot/reset endpoints as parents (`/forgot-password` linked from `/school-login`).

### Platform administrator (`ADMIN`)

| Route | Purpose |
|-------|---------|
| `/admin-login` | Hidden route (not linked in public navigation) |

Flow: backend login with `expectedRole: "ADMIN"` → JWT in HTTP-only cookie → NextAuth session sync for middleware.

### Role Separation and Protection

- **Middleware** (`frontend/middleware.ts`) enforces role-based redirects using JWT role from NextAuth
- **Backend** uses `auth` + `requireRole()` on protected routes
- Cross-role access to another dashboard redirects to the correct home route
- Unauthenticated dashboard access redirects to the role-specific login page with a `callbackUrl` query parameter; after sign-in, users return to the page they originally requested when safe

| Role | Default home | Unauthenticated dashboard redirect |
|------|----------------|-------------------------------------|
| `PARENT` | `/` (parent area: `/parent`) | `/login?callbackUrl=…` |
| `SCHOOL_ADMIN` | `/dashboard/school` | `/school-login?callbackUrl=…` |
| `ADMIN` | `/admin` | `/admin-login?callbackUrl=…` |

**Session:** JWT max age is 30 minutes. `SessionHeartbeat` refreshes the session every 10 minutes while the tab is open.

---

## 6. Core Features

### Parents

- Search and filter schools (city, board, medium, school type, text search)
- View school detail pages (fees, facilities, gallery, contact)
- Save schools to **favourites** (including bookmark toggle on school detail pages)
- Send **inquiries** to approved schools (modal on school detail; view sent inquiries at `/parent/inquiries`)
- **Parent dashboard**: saved schools, profile, recently viewed, sent inquiries with status

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
- Scale: display, `h1`–`h3`, body, label, meta, button text

### Color Palette

- **Primary blue** — trust, navigation, links (`blue-600`–`blue-800`)
- **Amber accent** — CTAs and highlights
- **Neutral gray** — surfaces and borders
- **Semantic** — success, warning, danger, info tokens in Tailwind config

### Responsive Approach

- Mobile-first layouts for search, cards, and dashboards
- Collapsible navigation and scrollable tables on small screens
- Touch-friendly controls (minimum tap targets, full-width forms on mobile)

### Accessibility

- Semantic HTML and ARIA labels on search, pagination, and empty states
- Visible focus rings (`focus-visible`)
- `prefers-reduced-motion` respected for animations
- Private routes use `noindex` headers and robots rules

---

## 8. Environment Variables

Copy from `.env.example` files. **Never commit real secrets.**

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO and sitemap |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (HTTPS in production) |
| `NEXTAUTH_URL` / `AUTH_URL` | NextAuth canonical URL |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Session encryption |
| `AUTH_TRUST_HOST` | Required on Vercel (`true`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Parent Google OAuth |
| `DATABASE_URL` | Neon connection (server-side Prisma) |
| `CLOUDINARY_*` | Server upload route only |

Only `NEXT_PUBLIC_*` variables are exposed to the browser.

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (injected on Render/Railway) |
| `DATABASE_URL` | Neon PostgreSQL with `sslmode=require` |
| `JWT_SECRET` | API token signing (server only) |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `FRONTEND_URL` | CORS allowlist (comma-separated for multiple origins) |
| `CLOUDINARY_*` | Image upload utilities |
| `BCRYPT_ROUNDS` | Password hashing cost (default `12`) |
| `TRUST_PROXY` | Behind reverse proxy in production |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin account for `npm run seed:admin` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Nodemailer SMTP for password reset emails |

---

## 9. Local Development Setup

### Prerequisites

- Node.js 18+
- Neon PostgreSQL (or compatible Postgres)
- Cloudinary account (for uploads)
- Google OAuth credentials (optional, for parent Google login)

### 1. Database and schema

Schema is owned by the frontend:

```bash
cd frontend
cp .env.example .env.local
# Edit DATABASE_URL and other variables

npm install
npx prisma db push
npx prisma generate
```

### 2. Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_API_URL=http://localhost:4000`.

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL (same as frontend), JWT_SECRET, FRONTEND_URL

npm install
npx prisma generate
npm run dev
```

API: [http://localhost:4000](http://localhost:4000)  
Health check: `GET http://localhost:4000/health`

### 4. First admin user

**Option A — seeder (recommended):**

```bash
cd backend
# Set ADMIN_EMAIL and ADMIN_PASSWORD in .env
npm run seed:admin
```

Sign in at `/admin-login` with those credentials.

**Option B — manual role update:**

1. Sign in or register as a parent.
2. In the Neon SQL editor:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

3. Sign out and use `/admin-login`.

### Run both services

Use two terminals: frontend on port `3000`, backend on port `4000`.

---

## 10. Deployment Guide

### Database (Neon)

1. Create a Neon project and copy `DATABASE_URL` with `?sslmode=require`.
2. Run `npx prisma db push` from **frontend** once.
3. Use the same `DATABASE_URL` on Vercel and Render/Railway.

### Frontend (Vercel)

1. Connect the repository; set root directory to `frontend` if needed.
2. Add all variables from `frontend/.env.example` for Production.
3. Build uses `vercel.json`: `npx prisma generate && npm run build`.
4. Set `NEXT_PUBLIC_API_URL` to your deployed API HTTPS URL.
5. Add Google OAuth redirect: `https://your-domain.com/api/auth/callback/google`.

See [frontend/Frontend.md](frontend/Frontend.md) for the full production checklist.

### Backend (Render or Railway)

**Render:** use `backend/render.yaml` or manual Web Service:

- Build: `npm ci && npx prisma generate && npm run build`
- Start: `npm start`
- Health: `/health`

Set `FRONTEND_URL` to your Vercel domain (exact match, HTTPS, no trailing slash).

See [backend/Backend.md](backend/Backend.md) for server behavior and CORS notes.

### Post-deploy verification

| Check | Expected |
|-------|----------|
| `GET /health` | `{ "status": "ok", "database": "connected" }` |
| Public school listing | Loads on `/schools` |
| CORS | Browser requests from Vercel origin succeed |
| Auth | Parent login and admin login work on production URLs |

---

## 11. Security Features

| Feature | Implementation |
|---------|----------------|
| **JWT auth** | Bearer tokens; malformed/expired tokens rejected |
| **Role protection** | Middleware (frontend) + `requireRole` (backend) |
| **Hidden admin login** | `/admin-login` not in public nav; `expectedRole: ADMIN` on API |
| **Upload validation** | MIME, extension, 5MB limit, magic-byte checks |
| **Rate limiting** | 100 req/15 min general; 10 req/15 min on auth routes |
| **Upload rate limiting** | 10 uploads/hour/user on `POST /api/upload` (authenticated roles only) |
| **Session heartbeat** | Client pings session every 10 min; JWT max age 30 min |
| **Brute-force guard** | Login attempt throttling per IP + email |
| **CORS** | Restricted to `FRONTEND_URL` in production |
| **Helmet** | Security headers on API |
| **Validation** | Zod on mutating routes; sanitized request bodies |
| **Secrets** | JWT, DB, Cloudinary secrets server-side only |
| **Error responses** | No stack traces in production |

---

## 12. SEO and Performance

### SEO

- Dynamic metadata per page (`lib/seo.ts`)
- `robots.ts` and `sitemap.ts` (approved schools from Prisma)
- JSON-LD structured data on home and school detail
- Private dashboards excluded from indexing

### Performance

- **Pagination** — schools default 12 per page; admin tables default 20
- **ISR** — public school fetches with `revalidate`
- **next/image** — AVIF/WebP, lazy loading, blur placeholders
- **Suspense** — skeleton loaders on listings and featured schools
- **Selective Prisma queries** — minimal fields on list endpoints
- **Cache layer** — Redis-ready abstraction on backend (`withCache` pass-through today)

---

## 13. Future Roadmap

Planned product directions (architecture allows extension without rewrites):

| Area | Direction |
|------|-----------|
| **Inquiry notifications** | Email or WhatsApp for inquiry status and school approval updates |
| **Multilingual** | Hindi and regional language UI |
| **AI recommendations** | School suggestions from parent preferences |
| **Fee comparison** | Side-by-side fee tables across saved schools |
| **Analytics** | School and platform engagement dashboards |
| **Reviews** | Moderated parent reviews post-verification |
| **Mobile app** | React Native or Expo consuming the same API |
| **Redis** | Enable listing and stats caching on the backend |

---

## 14. License and Contribution

### License

This project is provided as an educational and production-oriented codebase. Add your chosen license file (for example, MIT) before public distribution if you open-source the repository.

### Contributing

1. Fork the repository and create a feature branch.
2. Follow existing patterns: TypeScript strict mode, role-separated auth, professional English in UI and API messages.
3. Run `npm run build` in `frontend` and `npx tsc --noEmit` in `backend` before opening a pull request.
4. Do not commit `.env`, `.env.local`, or secrets.
5. Schema changes: update `frontend/prisma/schema.prisma`, run `db push` from frontend, then `prisma generate` in both projects.

### Documentation

| Document | Contents |
|----------|----------|
| [frontend/Frontend.md](frontend/Frontend.md) | App Router, auth, dashboards, SEO, deployment |
| [backend/Backend.md](backend/Backend.md) | API routes, middleware, pagination, security |

### Support and setup notes

- **Backend offline:** public pages degrade gracefully when `NEXT_PUBLIC_API_URL` is unreachable.
- **CORS errors:** ensure `FRONTEND_URL` on the API matches the Vercel domain exactly.
- **Prisma client:** backend imports from `generated/prisma` (Prisma 7); run `npx prisma generate` after schema changes.

---

**SchoolFinder** — practical school discovery for families and administrators across India.
