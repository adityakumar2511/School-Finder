# SchoolFinder / SchoolSetu

> Last updated: June 25, 2026  
> Status: All implemented phases completed. **Phase 4 Blog CMS and granular fee-structure expansion are intentionally skipped for now.**  
> Latest sync: 22-section school profile frontend + backend update completed, including custom facilities/sports groups, admission coordinators, and additional phone numbers.

SchoolFinder / SchoolSetu is a full-stack school discovery, comparison, inquiry, and admin-management platform for **Tier-2 and Tier-3 cities in India**. Parents can discover and compare schools, school administrators can manage listings and leads, and platform administrators can verify, moderate, feature, and manage the platform.

| Layer | Technology | Local Port | Responsibility |
|---|---|---:|---|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · NextAuth v5 | `3000` | UI, auth sessions, BFF proxy routes, Cloudinary uploads, SEO, 22-section school profile editor |
| Backend | Express.js 5 · TypeScript · Prisma · JWT | `4000` | REST API, auth, validation, database operations, school profile persistence, business rules |
| Database | PostgreSQL on Neon | — | Users, schools, inquiries, favourites, contacts, audit logs, extended school profile JSON fields |
| Media | Cloudinary | — | School logos, gallery images, profile uploads |
| Monitoring | Sentry | — | Frontend and backend error tracking |

**Detailed documentation:**

- [Frontend documentation](frontend/Frontend.md)
- [Backend documentation](backend/Backend.md)
- [Feature plan](plan.md)
- [Future features](Future-Features.md)

---

## Current Project Status

| Phase | Feature Area | Status |
|---|---|---|
| Phase 1 | Navbar, static pages, contact page | ✅ Complete |
| Phase 2 | Inquiry spam protection | ✅ Complete |
| Phase 3 | Inquiry / lead system upgrade | ✅ Complete |
| Phase 4 | Blog CMS | ⏸️ Skipped for now |
| Phase 5 | SEO dynamic pages | ✅ Complete |
| Phase 6 | Featured listings | ✅ Complete |
| Phase 7 | Sentry reliability/error monitoring | ✅ Complete |
| Phase 8 | Compare, maps, nearby schools, AI placeholder | ✅ Complete |
| Profile Sync Update | 22-section school profile frontend/backend sync | ✅ Complete |
| Future Fee Update | Granular fee-structure expansion | ⏸️ Skipped for now |

---

## Core Features

### Public / Parent-Facing Features

- Home page with featured schools and public discovery flow
- School listing page with filters by city, state, board, type, medium, and search text
- Dynamic SEO pages for city, state, and board based discovery
- School detail pages with profile sections, fees, facilities, gallery, contact details, map, and nearby schools
- Extended school profile data support for:
  - School categories and classes offered
  - Languages offered
  - School timings and working days
  - Uniform policy and canteen/tiffin availability
  - Facilities and sports lists with custom group persistence
  - Board results with Class 10 / Class 12 support
  - Admission coordinators and labelled phone numbers
- Compare Schools page with up to **3 schools** stored in `localStorage`
- AI Recommendation route available as a **Coming Soon** placeholder
- About page and Contact page
- Contact form with database save, EmailJS notification, and Google Sheets webhook support
- Mobile-first responsive UI
- Sitemap, robots.txt, metadata, and JSON-LD structured data

### Parent Account Features

- Parent registration and login with email/password
- Google OAuth for parent login
- OTP-based password reset via email
- Parent dashboard with:
  - Profile management
  - Favourite schools
  - Recently viewed schools
  - Sent inquiries and inquiry status tracking
- Save/remove favourite schools
- Send inquiries to approved schools
- Inquiry spam protection through duplicate checks, rate limits, and honeypot filtering

### School Administrator Features

- School admin login and registration
- 4-step school registration wizard with draft persistence
- School dashboard with listing status and inquiry summary
- Full school profile editor with 22 profile sections
- Expanded school profile form fields:
  - Indian school categories
  - Classes offered from daycare/creche to Class 12
  - Languages offered with custom add support
  - School timing, working days, uniform policy, canteen/tiffin support
  - Student-teacher ratio and total students
  - Recognition number and affiliated-since fields
  - Facilities and sports custom add with correct group save/reload
  - Programs and academic streams custom add
  - Board results using `classLevel` and `passPercent`
  - Repeatable admission coordinators
  - Additional labelled contact numbers
- Gallery/logo/cover image upload through Cloudinary
- Latitude and longitude fields for map and nearby school discovery
- Inquiry management with expanded lead statuses:
  - `NEW`
  - `CONTACTED`
  - `INTERESTED`
  - `CONVERTED`
  - `CLOSED`
- Monthly lead count/stat from existing inquiry data

### Platform Administrator Features

- Hidden admin login at `/admin-login`
- Admin dashboard with platform stats
- School moderation:
  - Approve/reject schools
  - Edit full school profile
  - Delete schools
  - List/unlist public visibility
  - Mark/unmark featured listings
- Featured listing control with `isFeatured` and `featuredUntil`
- User management:
  - School admins
  - Parents
  - Admins
  - Delete users
  - Enable/disable users
  - Access-level based controls
- Admin access levels:
  - `READ_ONLY`
  - `READ_WRITE`
  - `FULL_ACCESS`
- Super admin support:
  - Single DB-only super admin
  - Protected from delete, role change, status change, and access-level changes
- Add school wizard
- Add parent form
- Add admin form
- Cross-platform inquiry monitoring with filters
- Admin audit logs for sensitive mutations

### Backend / System Features

- Stateless REST API with Express.js
- Prisma ORM with PostgreSQL / Neon
- JWT authentication with role-based authorization
- Separate role flows for Parent, School Admin, and Platform Admin
- Brute-force login protection
- Rate limiting for auth, forgot password, OTP, contact, and inquiry flows
- Zod validation and request sanitization
- Public school cache and cache invalidation after mutations
- Contact submission model and endpoint
- Featured listing API and public featured filtering
- Nearby schools API using coordinates and distance calculation
- 22-section school profile validation and persistence
- Board results normalized with `classLevel` and `passPercent`
- JSON persistence for custom facilities/sports groups, admission coordinators, and additional phones
- Sentry error capture for frontend and backend
- Cloudinary upload handled by frontend route only; backend stores image URLs

---

## Architecture Overview

```txt
Browser
  │
  ▼
Frontend: Next.js 14 on Vercel
  ├─ Public pages and dashboards
  ├─ NextAuth JWT sessions
  ├─ BFF routes under /api/*
  ├─ Cloudinary upload route
  ├─ 22-section school profile editor
  └─ SEO / sitemap / metadata
  │
  │ HTTPS + Bearer JWT
  ▼
Backend: Express API on Render
  ├─ Security middleware
  ├─ JWT auth and role checks
  ├─ Zod validation
  ├─ Controllers and business rules
  ├─ School profile query/controller sync
  ├─ Cache and Sentry
  └─ Prisma client
  │
  ▼
Neon PostgreSQL
```

**Frontend has no direct database access.** All database operations go through the backend API.

---

## Short Folder Structure

```txt
.
├── frontend/                 # Next.js app, pages, dashboards, BFF routes, uploads, SEO
│   ├── src/app/              # App Router pages and API routes
│   ├── src/components/       # Shared, public, auth, parent, school, admin components
│   ├── src/lib/              # Auth, API clients, data modules, upload, SEO, types
│   ├── middleware.ts         # Frontend route protection
│   ├── Frontend.md           # Full frontend documentation
│   └── package.json
│
├── backend/                  # Express REST API, Prisma, auth, validation, business logic
│   ├── src/routes/           # API route definitions
│   ├── src/controllers/      # Request handlers and business logic
│   ├── src/middleware/       # Auth, security, validation, error handling
│   ├── src/validators/       # Zod schemas
│   ├── src/lib/              # Prisma, cache, mailer, OTP, queries, helpers
│   ├── prisma/               # Schema and migrations
│   ├── Backend.md            # Full backend documentation
│   └── package.json
│
├── plan.md                   # Completed phase summary
├── Future-Features.md        # Blog, Razorpay, and future expansion list
└── README.md                 # Root project overview
```

For full detailed file trees, see `frontend/Frontend.md` and `backend/Backend.md`.

---

## Main Frontend Routes

| Route | Purpose |
|---|---|
| `/` | Home page |
| `/schools` | Public school listing |
| `/schools/[slug]` | Public school detail page |
| `/schools/city/[city]` | Dynamic city SEO pages |
| `/schools/state/[state]` | Dynamic state SEO pages |
| `/schools/board/[board]` | Dynamic board SEO pages |
| `/compare` | Compare up to 3 schools |
| `/ai-recommend` | AI recommendation placeholder page |
| `/about` | About page |
| `/contact` | Contact page |
| `/login` | Parent login |
| `/register` | Parent registration |
| `/forgot-password` | OTP password reset |
| `/school-login` | School admin login |
| `/school-register` | School admin registration |
| `/parent/*` | Parent dashboard |
| `/dashboard/school/*` | School admin dashboard |
| `/admin/*` | Platform admin panel |
| `/admin-login` | Hidden admin login |

---

## Main Backend API Areas

| Prefix | Purpose | Auth |
|---|---|---|
| `/health`, `/ready` | Health checks | Public |
| `/api/auth` | Register, login, logout, OTP, profile, Google sync | Mixed |
| `/api/schools` | Public discovery, school CRUD, nearby schools, profile update persistence | Mixed |
| `/api/admin` | Moderation, users, featured listings, stats | `ADMIN` |
| `/api/inquiries` | Parent inquiries and lead status updates | Parent / School / Admin |
| `/api/parent` | Parent profile and favourites | `PARENT` |
| `/api/favourites` | Legacy favourites API | `PARENT` |
| `/api/contact` | Public contact form submission | Public |

Full endpoint details are available in [backend/Backend.md](backend/Backend.md).

---

## Authentication Model

The project uses separate role flows instead of one shared login screen.

| Role | Login Route | Main Area | Token Usage |
|---|---|---|---|
| `PARENT` | `/login` | `/parent` | NextAuth session + backend JWT |
| `SCHOOL_ADMIN` | `/school-login` | `/dashboard/school` | NextAuth session + backend JWT |
| `ADMIN` | `/admin-login` | `/admin` | HTTP-only `sf_admin_token` + NextAuth session |

Backend JWT payload includes user role. For admins, it also includes `adminAccessLevel` and `isSuperAdmin` for frontend UI gating. Backend always re-checks permissions from the database for sensitive operations.

---

## Environment Setup

### Frontend Environment Variables

Create `frontend/.env.local` from `frontend/.env.example`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO |
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXTAUTH_URL` / `AUTH_URL` | NextAuth site URL |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | NextAuth session secret |
| `AUTH_TRUST_HOST` | Required on Vercel |
| `JWT_SECRET` | Must match backend JWT secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Parent Google OAuth |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Server-side upload route |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Contact form EmailJS service |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Contact form EmailJS template |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Contact form EmailJS public key |
| `NEXT_PUBLIC_CONTACT_SHEET_URL` | Google Sheets Apps Script webhook |
| `NEXT_PUBLIC_SENTRY_DSN` | Frontend Sentry DSN |
| `SENTRY_AUTH_TOKEN` | Sentry source map upload token |
| `SENTRY_ORG` | Sentry org slug |
| `SENTRY_PROJECT` | Sentry frontend project slug |

No `DATABASE_URL` is used on the frontend.

### Backend Environment Variables

Create `backend/.env` from `backend/.env.example`.

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Backend port, default `4000` |
| `DATABASE_URL` | Neon/PostgreSQL connection string |
| `JWT_SECRET` | API token signing secret; must match frontend |
| `JWT_EXPIRES_IN` | Backend token lifetime |
| `FRONTEND_URL` | CORS allowlist |
| `BREVO_API_KEY` | Email OTP sender |
| `EMAIL_FROM` | Verified Brevo sender email |
| `FAST2SMS_API_KEY` | SMS OTP provider key |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin seeder |
| `SUPER_ADMIN_EMAIL` | Super admin seeder |
| `BCRYPT_ROUNDS` | Password hash cost |
| `TRUST_PROXY` | Production proxy support |
| `SENTRY_DSN` | Backend Sentry DSN |

---

## Local Development

### 1. Start Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run migrate:dev
npm run dev
```

Backend runs at:

```txt
http://localhost:4000
```

Health check:

```txt
GET http://localhost:4000/health
```

### 2. Start Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:3000
```

### 3. Seed Admin Users

```bash
cd backend
npm run seed:admin
npm run seed:super-admin
```

Use `/admin-login` for platform admin access.

---

## Database and Prisma Workflow

Run commands from `backend/`.

```bash
# After changing schema.prisma
npx prisma migrate dev --name your_migration_name
npx prisma generate

# Production migration
npx prisma migrate deploy
```

Important Prisma owner file:

```txt
backend/prisma/schema.prisma
```

Latest profile-sync schema additions include:

```txt
languagesOffered
recognitionNumber
affiliatedSince
uniformPolicy
canteenAvailable
facilityCustomGroups
sportsCustomGroups
admissionCoordinators
additionalPhones
BoardResult.classLevel
BoardResult.passPercent
```

Important migration safety rule:

```txt
If Prisma asks to reset the public schema and says all data will be lost, do not continue unless you intentionally want to wipe data.
```

---

## Build Commands

### Frontend

```bash
cd frontend
npm run build
npx tsc --noEmit
```

### Backend

```bash
cd backend
npm run build
npx tsc --noEmit
```

After Prisma schema changes, also run:

```bash
cd backend
npx prisma generate
```

---

## Deployment

### Frontend: Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Add all frontend environment variables
- Set `NEXT_PUBLIC_API_URL` to the deployed backend URL
- Set `JWT_SECRET` to match backend
- Add Google OAuth redirect URL:

```txt
https://your-domain.com/api/auth/callback/google
```

### Backend: Render

- Root directory: `backend`
- Build command:

```bash
npm ci && npx prisma generate && npm run build
```

- Pre-deploy command:

```bash
npx prisma migrate deploy
```

- Start command:

```bash
npm start
```

- Health path:

```txt
/health
```

Set `FRONTEND_URL` to the exact Vercel domain.

---

## Security and Reliability

| Area | Implementation |
|---|---|
| Authentication | JWT + NextAuth session model |
| Authorization | Backend `requireRole` and admin access-level guards |
| Admin protection | Hidden admin login, super admin guard, audit logs |
| Rate limits | General, auth, forgot password, OTP, contact, inquiry |
| Spam control | Duplicate inquiry protection, phone/email/IP limits, honeypot |
| Upload safety | MIME check, size limit, magic-byte validation |
| CORS | Restricted by `FRONTEND_URL` |
| Security headers | Helmet on backend, security headers on frontend |
| Error monitoring | Sentry on frontend and backend |
| Data security | Frontend has no direct DB access |
| Profile data safety | Extended school profile payloads are validated with Zod and sanitized before Prisma writes |

---

## Documentation Map

| File | Purpose |
|---|---|
| `README.md` | Root overview for setup and project understanding |
| `frontend/Frontend.md` | Detailed frontend architecture, routes, components, env, deployment |
| `backend/Backend.md` | Detailed backend architecture, API, DB schema, middleware, env, deployment |
| `plan.md` | Completed phase summary |
| `Future-Features.md` | Future items such as Blog CMS, Razorpay, granular fee structure, real AI recommendation, WhatsApp routing |

---

## Future Scope

Current build keeps **Phase 4 Blog CMS skipped for now**. Granular fee-structure expansion is also skipped because the current frontend fee UI has not been expanded yet. Future additions are tracked separately in `Future-Features.md`, including:

- Blog CMS
- Granular fee structure expansion
- Razorpay payment flow
- Direct WhatsApp routing
- Real AI school recommendation system
- Reviews system
- Parent current-location based nearby search
- Admin bulk coordinate import

---

## Contributing / Development Rules

- Keep frontend and backend docs updated after schema, route, or feature changes.
- Do not commit `.env`, `.env.local`, secrets, or generated Prisma client output.
- Keep `JWT_SECRET` identical in frontend and backend env files.
- Keep frontend enum/types synced with backend Prisma enums.
- Keep school profile form fields synced across frontend schema, backend validator, Prisma schema, controller, and query layer.
- Run build/type-check before deployment.
- For database changes, always create a Prisma migration and regenerate Prisma client.

---

**SchoolFinder / SchoolSetu** — a practical school discovery and lead-management platform for Indian parents, schools, and platform administrators.
