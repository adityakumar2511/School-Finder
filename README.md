# SchoolFinder

> Last updated: June 12, 2026

A full-stack school discovery and inquiry platform for **Tier-2 and Tier-3 cities in India**. Parents search and compare schools; school administrators manage listings and inquiries; platform administrators verify listings and maintain quality.

| Layer | Technology | Port (local) |
|-------|------------|--------------|
| Frontend | Next.js 14, NextAuth v5 (JWT) | `3000` |
| Backend | Express.js 5, JWT, Prisma 5 | `4000` |
| Database | PostgreSQL (Neon) | — |
| Media | Cloudinary (frontend upload route) | — |

**Detailed docs:** [frontend/Frontend.md](frontend/Frontend.md) · [backend/Backend.md](backend/Backend.md)

---

## Features

### Parents
- Search and filter schools by city, board, type, and medium
- View school detail pages with fees, facilities, and gallery
- Save favourites and send inquiries to approved schools
- Dashboard: profile, favourites, recently viewed schools, inquiry history
- Google OAuth and email/password authentication
- OTP-based password reset

### School Administrators
- 4-step registration wizard with draft persistence
- Dashboard: inquiry management, profile and gallery editing
- Inquiry status workflow (NEW → CONTACTED → CLOSED)
- Listing status visibility (PENDING, APPROVED, REJECTED)

### Platform Administrators
- School moderation (approve/reject listings)
- Direct school creation wizard (APPROVED status)
- User management (roles, account disable)
- Cross-platform inquiry monitoring and dashboard stats

---

## Tech Stack

### Frontend
Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · NextAuth v5 · Zod · React Hook Form · Cloudinary · Framer Motion

### Backend
Express.js 5 · TypeScript · Prisma 5 · PostgreSQL · JWT · Zod · bcryptjs · Brevo (email OTP) · Fast2SMS (phone OTP) · Helmet · express-rate-limit

**Frontend has no database driver.** PostgreSQL is accessed only by the backend.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Parent / School Admin / Platform Admin)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Vercel) — port 3000                               │
│  Next.js 14 App Router · NextAuth v5 (JWT, no DB adapter)   │
│  backendFetch / adminFetch / BFF /api/* → Express API       │
│  POST /api/upload → Cloudinary (server-side only)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + Bearer JWT
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend API (Render) — port 4000                            │
│  Express · JWT (HS256) · Prisma · Zod · Rate limits         │
│  Single source of truth for all database operations          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Neon PostgreSQL                                             │
│  Schema: backend/prisma/schema.prisma                        │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Model

Three roles with separate login entry points — no shared login page.

| Role | Login Route | Home | Token Storage |
|------|-------------|------|---------------|
| `PARENT` | `/login` | `/` | NextAuth session + sessionStorage |
| `SCHOOL_ADMIN` | `/school-login` | `/dashboard/school` | NextAuth session + mintBackendJwt fallback |
| `ADMIN` | `/admin-login` | `/admin` | HTTP-only `sf_admin_token` cookie |

Two-layer tokens: NextAuth JWT (30 min, UI/middleware) + Backend Bearer JWT (7 days, API auth).

---

## Folder Structure

```
.
├── frontend/                 Next.js UI, NextAuth, BFF proxies, Cloudinary upload
│   ├── src/app/              App Router pages and API routes
│   ├── src/components/       UI components by domain
│   ├── src/lib/              Auth, API clients, data modules, types
│   └── middleware.ts         Role-based route protection
├── backend/                  Express REST API, Prisma schema, JWT auth
│   ├── src/                  Routes, controllers, middleware, lib
│   ├── prisma/               Schema and migrations
│   └── render.yaml           Render deployment blueprint
├── docs/                     Audit reports and artifacts
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 18+
- Neon PostgreSQL (or compatible Postgres)
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional, for parent Google login)
- Brevo API key (for password reset emails in production)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, FRONTEND_URL, BREVO_API_KEY, EMAIL_FROM

npm install
npx prisma generate
npm run migrate:dev
npm run dev
```

API: [http://localhost:4000](http://localhost:4000)  
Health: `GET http://localhost:4000/health`

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

### 3. First Admin User

```bash
cd backend
# Set ADMIN_EMAIL and ADMIN_PASSWORD in .env
npm run seed:admin
```

Sign in at `/admin-login` with those credentials.

Run both services in separate terminals (frontend `:3000`, backend `:4000`).

---

## Environment Setup

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO |
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXTAUTH_URL` / `AUTH_URL` | NextAuth canonical URL |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Session encryption |
| `AUTH_TRUST_HOST` | Required on Vercel (`true`) |
| `JWT_SECRET` | Must match backend |
| `GOOGLE_CLIENT_ID/SECRET` | Parent Google OAuth |
| `CLOUDINARY_*` | Server upload route only |

No `DATABASE_URL` on the frontend.

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL with `sslmode=require` |
| `JWT_SECRET` | API token signing (must match frontend) |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `FRONTEND_URL` | CORS allowlist |
| `BREVO_API_KEY` | Password reset OTP email |
| `EMAIL_FROM` | Verified Brevo sender |
| `FAST2SMS_API_KEY` | Phone OTP SMS (optional) |
| `ADMIN_EMAIL/PASSWORD` | Initial admin seeder |
| `BCRYPT_ROUNDS` | Password hashing cost (default `12`) |

See [backend/Backend.md](backend/Backend.md) for the full variable reference.

---

## Development Workflow

1. Start backend with `npm run dev` in `backend/`
2. Start frontend with `npm run dev` in `frontend/`
3. Schema changes: edit `backend/prisma/schema.prisma` → `npm run migrate:dev` → `npx prisma generate`
4. Type check: `npx tsc --noEmit` in both projects
5. Build: `npm run build` in frontend, `npm run build` in backend

---

## Build & Deployment

### Database (Neon)

```bash
cd backend
npx prisma migrate deploy
```

Set `DATABASE_URL` on Render only. Frontend does not need it.

### Backend (Render)

Use `backend/render.yaml` or manual Web Service:

- **Build:** `npm ci && npx prisma generate && npm run build`
- **Pre-deploy:** `npx prisma migrate deploy`
- **Start:** `npm start`
- **Health:** `/health`

Set `FRONTEND_URL` to your Vercel domain (exact match, HTTPS, no trailing slash).

### Frontend (Vercel)

1. Connect repository; set root directory to `frontend`
2. Add all variables from `frontend/.env.example`
3. Set `NEXT_PUBLIC_API_URL` to deployed API HTTPS URL
4. Set `JWT_SECRET` to match backend
5. Add Google OAuth redirect: `https://your-domain.com/api/auth/callback/google`

### Post-Deploy Verification

| Check | Expected |
|-------|----------|
| `GET /health` | `{ "status": "ok", "database": "connected" }` |
| Public school listing | Loads on `/schools` |
| CORS | Browser requests from Vercel origin succeed |
| Auth | Parent and admin login work on production URLs |
| Sitemap | `/sitemap.xml` includes approved schools |

---

## API Overview

| Prefix | Purpose | Auth |
|--------|---------|------|
| `/health`, `/ready` | Health checks | None |
| `/api/auth` | Registration, login, OTP reset, profile | Mixed |
| `/api/schools` | Public discovery + school admin CRUD | Mixed |
| `/api/admin` | Moderation, users, stats | ADMIN |
| `/api/inquiries` | Parent inquiries + school status | PARENT / SCHOOL_ADMIN |
| `/api/parent` | Parent profile, favourites, inquiries | PARENT |
| `/api/favourites` | Legacy favourites (deprecated) | PARENT |

Full endpoint reference: [backend/Backend.md](backend/Backend.md)

---

## Security

| Feature | Implementation |
|---------|----------------|
| JWT auth | HS256, issuer `schoolfinder-api`, jti blacklist on logout |
| Role protection | Middleware (frontend) + `requireRole` (backend) |
| Rate limiting | 100/15min general; 10/15min auth; 3/h forgot; 5/h reset |
| Brute-force guard | 5 failures / 15 min per IP+email on login |
| Upload validation | MIME, size (5MB), magic-byte checks (frontend route) |
| CORS | Restricted to `FRONTEND_URL` in production |
| Helmet | Security headers + HSTS on API |
| Hidden admin login | `/admin-login` not in public navigation |
| Secrets | JWT, DB, Cloudinary credentials server-side only |
| No frontend DB | Database credentials never on Vercel |

---

## Current Roadmap

| Item | Status |
|------|--------|
| School discovery and filtering | Complete |
| Parent favourites and inquiries | Complete |
| School registration and dashboard | Complete |
| Admin moderation and user management | Complete |
| OTP password reset (email) | Complete |
| Phone OTP auth (SMS) | Backend only — no frontend UI |
| DRAFT school status flow | Partial — frontend checks exist, backend never assigns DRAFT |
| Facility management API | Not implemented (schema exists) |
| Email provider alignment | Brevo in code, Resend in env validation — needs cleanup |

See [docs/Dead-Code-Legacy-Report.md](docs/Dead-Code-Legacy-Report.md) for cleanup candidates.

---

## Documentation

| Document | Contents |
|----------|----------|
| [frontend/Frontend.md](frontend/Frontend.md) | App Router, auth, API integration, dashboards, SEO, deployment |
| [backend/Backend.md](backend/Backend.md) | API routes, middleware, schema, caching, security |
| [docs/Dead-Code-Legacy-Report.md](docs/Dead-Code-Legacy-Report.md) | Unused code and legacy endpoints |
| [docs/Architecture-Consistency-Report.md](docs/Architecture-Consistency-Report.md) | Documentation vs code alignment |

---

## Contributing

1. Fork the repository and create a feature branch
2. Follow existing patterns: TypeScript strict mode, role-separated auth
3. Run `npm run build` in frontend and `npx tsc --noEmit` in both projects before PR
4. Do not commit `.env`, `.env.local`, or secrets
5. Schema changes: update `backend/prisma/schema.prisma`, run `npm run migrate:dev`, then `npx prisma generate`

---

**SchoolFinder** — practical school discovery for families and administrators across India.
