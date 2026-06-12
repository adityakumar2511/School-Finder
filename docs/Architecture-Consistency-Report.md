# Architecture Consistency Report

> Generated: June 12, 2026  
> Audit scope: Frontend + Backend + Database + APIs + Documentation

This report verifies alignment between documentation and the current codebase, and records inconsistencies found during the audit.

---

## Executive Summary

| Area | Status | Notes |
|------|--------|-------|
| Frontend architecture docs | **Updated** | `frontend/Frontend.md` rewritten to match code |
| Backend architecture docs | **Updated** | `backend/Backend.md` rewritten to match code |
| README | **Updated** | Removed 400-line file dump; corrected email provider |
| Auth flow documentation | **Aligned** | Three-role separation accurately documented |
| API endpoint documentation | **Aligned** | All active routes documented; legacy routes marked |
| Environment variables | **Mismatch found** | Brevo vs Resend discrepancy (see Section 4) |
| Database schema docs | **Aligned** | Partial implementations flagged |

**Overall:** Documentation now reflects the current implementation. Five code-level inconsistencies remain that require code changes (not doc changes).

---

## 1. Documentation Updates Completed

| Deliverable | Path | Action |
|-------------|------|--------|
| Frontend documentation | `frontend/Frontend.md` | Complete rewrite |
| Backend documentation | `backend/Backend.md` | Complete rewrite |
| Project README | `README.md` | Rewritten with concise structure |
| Dead code report | `docs/Dead-Code-Legacy-Report.md` | New |
| This report | `docs/Architecture-Consistency-Report.md` | New |

### Removed from Old Documentation

- 400+ line per-file directory dumps (replaced with logical folder trees)
- References to Resend as the active email provider (code uses Brevo)
- Claims that Cloudinary is required at backend startup (not validated)
- Reference to `nodemailer` as unused dependency (not in package.json)
- Statement that `/reset-password` is the active reset page (it's a redirect stub)
- Implication that `sf_school_token` is fully deprecated without noting it's still set
- Listing `backend/scripts/` directory (does not exist; seeder is in `src/scripts/`)

---

## 2. Verified Architecture Flows

### Frontend → Backend → Database

| Flow | Documented | Verified | Path |
|------|------------|----------|------|
| Public school listing | ISR fetch to `/api/schools` | Yes | `lib/data/schools-public.ts` → `schools.controller.ts` → Prisma |
| School detail | ISR fetch to `/api/schools/:slug` | Yes | Same chain |
| Parent login | NextAuth → backend `/api/auth/login` | Yes | `lib/auth.ts` |
| Parent favourites | BFF → `/api/parent/favourites` | Yes | `FavouriteButton.tsx` → BFF → `parent.controller.ts` |
| Parent inquiry | Direct fetch → `/api/inquiries` | Yes | `InquiryModal.tsx` (not BFF) |
| School profile update | BFF → `/api/schools/:id` | Yes | `SchoolProfileForm.tsx` → BFF |
| Admin moderation | BFF → `/api/admin/schools/:id/approve` | Yes | `SchoolModerationActions.tsx` |
| Image upload | `/api/upload` → Cloudinary → URL to backend | Yes | Upload route → PATCH with URL |
| Password reset | 3-step OTP on `/forgot-password` | Yes | Direct backend auth endpoints |
| Admin login | Backend login → cookie → NextAuth | Yes | `admin-login/page.tsx` |

### Authentication Token Flow

```
Login → Backend JWT issued
    │
    ├─ PARENT: stored in NextAuth session.backendAccessToken + sessionStorage
    ├─ SCHOOL_ADMIN: mintBackendJwt() fallback (session token stripped)
    └─ ADMIN: sf_admin_token HTTP-only cookie (adminFetch only)
```

Verified against: `resolve-backend-token.ts`, `auth.ts`, `admin-auth.ts`.

---

## 3. Dependency Map

### Frontend Dependencies (Runtime)

```
Next.js App
├── next-auth (JWT sessions)
├── jsonwebtoken (server Bearer minting)
├── cloudinary (upload route)
├── react-hook-form + zod (forms)
├── framer-motion (animations)
├── tailwindcss + shadcn/ui (styling)
└── lucide-react (icons)

External Services
├── Express API (NEXT_PUBLIC_API_URL) — all data
├── Google OAuth — parent sign-in
└── Cloudinary — image storage
```

### Backend Dependencies (Runtime)

```
Express Server
├── prisma + @prisma/adapter-pg + pg (database)
├── jsonwebtoken (API auth)
├── bcryptjs (password hashing)
├── zod (validation)
├── helmet + cors + express-rate-limit (security)
└── compression (response gzip)

External Services
├── Neon PostgreSQL (DATABASE_URL)
├── Brevo HTTPS API (password reset email)
└── Fast2SMS HTTPS API (phone OTP SMS)
```

### Cross-Cutting

| Shared Config | Frontend | Backend | Must Match |
|---------------|----------|---------|------------|
| `JWT_SECRET` | Server-side minting | Token signing | Yes |
| `FRONTEND_URL` | — | CORS allowlist | Vercel domain |
| Enums | `lib/types/database.ts` | `prisma/schema.prisma` | Manual sync |

---

## 4. Code-Level Inconsistencies (Require Code Changes)

These are real mismatches in the codebase, documented accurately in the updated docs and reports.

### 4.1 Email Provider Mismatch

| Layer | Says | Does |
|-------|------|------|
| `backend/.env.example` | `RESEND_API_KEY` | — |
| `validateStartupEnv()` | Requires `RESEND_API_KEY` in production | — |
| `mailer.ts` | — | Uses `BREVO_API_KEY` via Brevo HTTPS API |
| `package.json` | Has `resend` dependency | Never imported |

**Impact:** Production startup can pass validation with `RESEND_API_KEY` set while emails only send if `BREVO_API_KEY` is configured separately.

**Fix:** Update `.env.example`, `production.ts`, and remove `resend` dependency; or switch mailer to Resend SDK.

### 4.2 DRAFT Status Partial Implementation

| Layer | Behavior |
|-------|----------|
| Prisma schema | `DRAFT` in `SchoolStatus` enum |
| Backend | Never assigns `DRAFT` status |
| Frontend | `dashboard/school/layout.tsx` redirects DRAFT → `/school-complete-registration` |
| Frontend | `school-complete-registration/page.tsx` checks for DRAFT status |

**Impact:** DRAFT redirect logic is unreachable through normal registration (schools created as `PENDING`).

**Fix:** Either implement DRAFT assignment in backend or remove frontend DRAFT handling.

### 4.3 School Slug Auth Gap

| Layer | Behavior |
|-------|----------|
| `GET /api/schools/:slug` route | No `auth` middleware |
| `getSchool` controller | Checks `req.user` for non-APPROVED access |
| Result | `req.user` always undefined; only APPROVED schools visible |

**Fix:** Add optional auth middleware or remove dead visibility check.

### 4.4 Legacy Cookie Still Set

| Layer | Behavior |
|-------|----------|
| School login | Sets `sf_school_token` via `/api/school/session` |
| Token resolution | Does not read `sf_school_token` |
| API auth | Uses `mintBackendJwt()` fallback |

**Fix:** Remove cookie set/clear and `/api/school/session` route.

### 4.5 Startup Validation vs Runtime

| Variable | Validated at Startup | Used at Runtime |
|----------|---------------------|-----------------|
| `RESEND_API_KEY` | Required in production | Not used |
| `BREVO_API_KEY` | Not validated | Used by mailer |
| `CLOUDINARY_*` | Not validated | Not used by backend |

---

## 5. Documentation vs Code — Post-Update Verification

All items below were verified after documentation rewrite.

| Topic | Docs | Code | Match |
|-------|------|------|-------|
| Next.js 14 App Router | Yes | Yes | Yes |
| NextAuth JWT (no DB adapter) | Yes | Yes | Yes |
| Three role-separated logins | Yes | Yes | Yes |
| BFF proxy pattern | Yes | Yes | Yes |
| Cloudinary upload on frontend | Yes | Yes | Yes |
| Backend in-memory cache TTLs | Yes | Yes | Yes |
| JWT issuer `schoolfinder-api` | Yes | Yes | Yes |
| Rate limit values | Yes | Yes | Yes |
| School registration creates PENDING | Yes | Yes | Yes |
| Admin add-school creates APPROVED | Yes | Yes | Yes |
| Legacy `/api/favourites` deprecated | Yes | Yes | Yes |
| Phone OTP endpoints exist | Yes (marked backend-only) | Yes | Yes |
| `next.config.js` active | Yes | Yes | Yes |
| `/reset-password` is redirect stub | Yes | Yes | Yes |
| Brevo for email OTP | Yes | Yes | Yes |
| Prisma client in `generated/prisma` | Yes | Yes | Yes |
| No background jobs | Yes | Yes | Yes |
| Facility model read-only | Yes | Yes | Yes |

---

## 6. API Coverage Matrix

### Backend Endpoints vs Frontend Usage

| Endpoint | Frontend Uses | Via |
|----------|---------------|-----|
| `POST /api/auth/register-parent` | Yes | `register/page.tsx` |
| `POST /api/auth/register-school` | Yes | `SchoolRegisterWizard.tsx` |
| `POST /api/auth/login` | Yes | All login pages |
| `POST /api/auth/google-sync` | Yes | `lib/auth.ts` |
| `POST /api/auth/forgot-password` | Yes | `forgot-password/page.tsx` |
| `POST /api/auth/verify-reset-otp` | Yes | `forgot-password/page.tsx` |
| `POST /api/auth/reset-password` | Yes | `forgot-password/page.tsx` |
| `POST /api/auth/logout` | Yes | `lib/logout.ts` |
| `GET /api/auth/me` | Yes | NextAuth JWT callback |
| `POST /api/auth/send-otp` | **No** | — |
| `POST /api/auth/verify-otp` | **No** | — |
| `GET /api/schools` | Yes | `schools-public.ts`, sitemap |
| `GET /api/schools/cities` | Yes | `SchoolFilters.tsx` |
| `GET /api/schools/:slug` | Yes | Detail page |
| `GET /api/schools/search` | **No** | — |
| `POST /api/schools` | **No** | — |
| `GET /api/schools/my-school` | Yes | School dashboard |
| `PATCH /api/schools/:id` | Yes | BFF school profile |
| `POST /api/schools/my-school/images` | Yes | BFF gallery |
| `DELETE /api/schools/images/:id` | Yes | BFF gallery |
| `GET /api/admin/stats` | Yes | Admin dashboard |
| `GET /api/admin/schools` | Yes | Admin schools + wizard |
| `GET /api/admin/check-owner` | Yes | Add-school wizard |
| `POST /api/admin/add-school` | Yes | Add-school wizard |
| `PATCH /api/admin/schools/:id/approve` | Yes | BFF moderation |
| `PATCH /api/admin/schools/:id/reject` | Yes | BFF moderation |
| `POST /api/admin/approve` | **No** | Legacy |
| `POST /api/admin/reject` | **No** | Legacy |
| `GET /api/admin/users` | Yes | Admin users page |
| `PATCH /api/admin/users/:id/role` | Yes | BFF |
| `PATCH /api/admin/users/:id/status` | Yes | BFF |
| `GET /api/admin/inquiries` | Yes | Admin inquiries page |
| `POST /api/inquiries` | Yes | `InquiryModal.tsx` |
| `GET /api/inquiries/my` | Yes | Parent inquiries page |
| `GET /api/inquiries/school/:id` | Yes | School inquiries page |
| `PATCH /api/inquiries/:id/status` | Yes | BFF |
| `GET /api/parent/profile` | Yes | Server-side only |
| `PATCH /api/parent/profile` | Yes | BFF |
| `GET/POST/DELETE /api/parent/favourites` | Yes | BFF |
| `GET /api/parent/inquiries` | **No** | Frontend uses `/api/inquiries/my` |
| `GET/POST/DELETE /api/favourites` | **No** | Legacy — uses `/api/parent/favourites` |

---

## 7. Infrastructure Consistency

| Component | Documented Target | Config File | Verified |
|-----------|-------------------|-------------|----------|
| Frontend hosting | Vercel | `frontend/vercel.json` | Yes — region `bom1` |
| Backend hosting | Render | `backend/render.yaml` | Yes — health check, migrate deploy |
| Database | Neon PostgreSQL | `prisma/schema.prisma` | Yes — SSL via adapter |
| Media | Cloudinary | Frontend upload route | Yes — backend stores URLs only |
| Email | Brevo | `lib/mailer.ts` | Yes — env docs now corrected |
| SMS | Fast2SMS | `lib/otp.ts` | Yes — optional |

---

## 8. Recommendations

### Immediate (documentation complete; code fixes needed)

1. **Email alignment:** Update `backend/.env.example` and `production.ts` to validate `BREVO_API_KEY` instead of `RESEND_API_KEY`
2. **Remove unused deps:** `resend`, `axios`, `@getbrevo/brevo` (backend); `jose` + unused Radix (frontend)

### Short-term (architecture cleanup)

3. Resolve DRAFT status — implement or remove
4. Remove `sf_school_token` legacy cookie flow
5. Add optional auth to school slug endpoint or remove dead code
6. Migrate parent inquiries to `/api/parent/inquiries`

### Long-term (legacy sunset)

7. Remove `/api/favourites` legacy router
8. Remove legacy admin POST approve/reject
9. Schema migration to drop unused `resetToken*` fields
10. Decide on Facility model and phone OTP — implement UI or remove

---

## 9. Conclusion

Documentation has been refactored to match the current implementation. The codebase is a functional monorepo with clear separation: Next.js frontend (UI + BFF + uploads) and Express backend (API + database). Five code-level inconsistencies remain, primarily around the email provider configuration and partially implemented features (DRAFT status, phone OTP, legacy cookies). These are documented in this report and in [Dead-Code-Legacy-Report.md](Dead-Code-Legacy-Report.md) for prioritized cleanup.
