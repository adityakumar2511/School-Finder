# SchoolFinder Codebase Audit

**Date:** June 5, 2026  
**Scope:** Full audit of `frontend/` and `backend/`  
**Stack:** Next.js 14, NextAuth v5, Express 5, Prisma 5, PostgreSQL, Cloudinary, Resend, Fast2SMS

---

## AUTH & SESSIONS

| Feature | Status | File(s) | Notes |
|---------|--------|---------|-------|
| Parent login (email/password) | ✅ | `frontend/src/components/auth/ParentLoginContent.tsx`, `frontend/src/lib/auth.ts`, `backend/src/controllers/auth.controller.ts` | Backend login with `expectedRole: "PARENT"` → NextAuth credentials → `storeParentBackendToken()` |
| Parent login (Google OAuth) | ✅ | `frontend/src/lib/auth.ts`, `backend/src/controllers/auth.controller.ts` (`syncGoogleUser`) | Rejects non-`PARENT` roles at sync |
| Parent registration | ✅ | `frontend/src/app/register/page.tsx`, `backend/src/controllers/auth.controller.ts` (`registerParent`) | Auto sign-in after `POST /api/auth/register-parent` |
| School admin login | ✅ | `frontend/src/components/auth/SchoolLoginContent.tsx`, `frontend/src/app/school-login/page.tsx` | Credentials only; no Google button |
| School admin registration | ⚠️ | `frontend/src/components/school/SchoolRegisterWizard.tsx`, `backend/src/controllers/auth.controller.ts` (`registerSchool`) | 4-step wizard works; backend returns JWT but frontend redirects to login without auto sign-in |
| Admin login (`/admin-login`) | ✅ | `frontend/src/app/admin-login/page.tsx`, `frontend/src/app/admin-login/layout.tsx` | Hidden route; backend login → `POST /api/admin/session` → NextAuth; noindex in robots + headers |
| Forgot password 3-step OTP | ⚠️ | `frontend/src/app/forgot-password/page.tsx`, `backend/src/controllers/auth.controller.ts` | UI wired (email → OTP → reset); OTP never emailed — only `console.log` in controller |
| OTP email delivery (Brevo) | ❌ | `backend/src/lib/mailer.ts` | `sendOtpEmail()` is a stub; Brevo block commented; never called from `forgotPassword` |
| Resend password reset | ❌ | `backend/src/lib/mailer.ts` | Resend SDK implemented but `mailer.ts` is not imported anywhere |
| Phone OTP backend | ✅ | `backend/src/controllers/auth.controller.ts`, `backend/src/lib/otp.ts` | Fast2SMS with dev console fallback |
| Phone OTP frontend UI | ❌ | — | No pages/components call `/send-otp` or `/verify-otp` |
| JWT blacklist on logout | ⚠️ | `backend/src/controllers/auth.controller.ts` (`logout`), `frontend/src/lib/logout.ts` | Backend blacklists `jti`; frontend never calls `POST /api/auth/logout` |
| Role-based middleware (frontend) | ✅ | `frontend/middleware.ts`, role layouts under `admin/`, `dashboard/school/`, `parent/` | Edge + server layout guards |
| Role-based middleware (backend) | ✅ | `backend/src/middleware/auth.ts`, `backend/src/middleware/roleCheck.ts` | `auth` + `requireRole()` on protected routes |
| SessionHeartbeat mounted | ✅ | `frontend/src/components/SessionHeartbeat.tsx`, `frontend/src/app/providers.tsx` | Global mount; syncs `sf_parent_token` |
| `sf_admin_token` cookie flow | ⚠️ | `frontend/src/lib/admin-auth.ts`, `frontend/src/app/api/admin/session/route.ts` | Login → httpOnly cookie → BFF works; logout clears cookie but does not blacklist JWT |

**Critical auth gap — school admin backend token bridge:**  
`frontend/src/lib/auth.ts` strips `backendAccessToken` for non-PARENT roles. SSR/BFF fall back to `mintBackendJwt()` which uses `@auth/core/jwt` encode — produces encrypted JWE tokens, not HS256 JWTs with `issuer: "schoolfinder-api"`. Backend auth middleware cannot verify them. School dashboard SSR and school BFF routes are likely broken in production.

---

## SCHOOL FEATURES

| Feature | Status | File(s) | Notes |
|---------|--------|---------|-------|
| Public school listing + filters | ✅ | `frontend/src/app/schools/page.tsx`, `frontend/src/components/SchoolFilters.tsx` | Search, city, board, type, medium, pagination. Gap: multi-select filters send multiple params but backend treats each as single value |
| School detail (slug) | ✅ | `frontend/src/app/schools/[slug]/page.tsx` | Non-APPROVED → 404; JSON-LD + metadata |
| School registration wizard | ✅ | `frontend/src/components/school/SchoolRegisterWizard.tsx` | 4 steps; creates `PENDING` school + `SCHOOL_ADMIN` user |
| School dashboard: profile | ⚠️ | `frontend/src/app/dashboard/school/profile/page.tsx` | UI complete; edits reset status to `PENDING`. Token bridge issue may block data load/save |
| School dashboard: gallery | ⚠️ | `frontend/src/components/school/SchoolGalleryManager.tsx`, `frontend/src/app/api/upload/route.ts` | Upload → URL → POST gallery BFF. Same token concern |
| School dashboard: inquiries | ⚠️ | `frontend/src/app/dashboard/school/inquiries/page.tsx` | Filters, status select, stats. Token concern applies |
| Dynamic city/state dropdown | ❌ | `frontend/src/components/SchoolFilters.tsx` | Free-text city input only; no distinct-cities/states API |
| Custom sections builder | ❌ | — | Detail page uses hardcoded sections; no `SchoolSection` model |
| Moderation flow | ✅ | `frontend/src/app/admin/schools/page.tsx`, `backend/src/controllers/admin.controller.ts` | `PENDING` → approve/reject; profile edits re-trigger moderation |

---

## PARENT FEATURES

| Feature | Status | File(s) | Notes |
|---------|--------|---------|-------|
| Parent dashboard: profile | ✅ | `frontend/src/app/parent/profile/page.tsx` | SSR read via `backendFetch`; PATCH via BFF |
| Parent dashboard: favourites | ⚠️ | `frontend/src/app/parent/favourites/page.tsx` | Read: direct backend GET. Write (remove): BFF DELETE only |
| Parent dashboard: inquiries | ⚠️ | `frontend/src/app/parent/inquiries/page.tsx` | Uses `GET /api/inquiries/my`, not `GET /api/parent/inquiries` |
| FavouriteButton API | ⚠️ | `frontend/src/components/schools/FavouriteButton.tsx` | Toggle: legacy `/api/favourites`. Initial state: `/api/parent/favourites` |
| InquiryModal | ✅ | `frontend/src/components/schools/InquiryModal.tsx` | Requires PARENT + `sf_parent_token` |
| School comparison | ❌ | — | Mentioned in README/marketing only; no `/compare` route or UI |

---

## ADMIN FEATURES

| Feature | Status | File(s) | Notes |
|---------|--------|---------|-------|
| Admin dashboard stats | ✅ | `frontend/src/app/admin/page.tsx`, `backend/src/controllers/admin.controller.ts` | 6 stat cards, recent activity |
| School moderation list | ✅ | `frontend/src/app/admin/schools/page.tsx` | Tabs, search, pagination, approve/reject via BFF |
| Add school wizard (4 steps) | ⚠️ | `frontend/src/app/admin/add-school/page.tsx` | Zod validation, duplicate check, owner check. Bug: `checkOwnerEmail` selects `user.school` but schema has `ownedSchools` |
| User management | ✅ | `frontend/src/app/admin/users/page.tsx` | Role + status (disabled via sentinel phone) |
| Inquiry monitoring | ✅ | `frontend/src/app/admin/inquiries/page.tsx` | Read-only global list |
| Featured listings management | ❌ | `frontend/src/components/home/FeaturedSchools.tsx` | Homepage shows first 6 approved schools; no admin UI |
| SEO management panel | ❌ | `frontend/src/lib/seo.ts` | Code-driven SEO only; no admin panel |

---

## API & BFF ROUTES

16 route files under `frontend/src/app/api/` — none empty; 2 partial.

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/auth/[...nextauth]` | GET, POST | ✅ | NextAuth v5 |
| `/api/upload` | POST | ✅ | Cloudinary upload with auth + rate limit |
| `/api/admin/session` | POST, DELETE | ✅ | Set/delete `sf_admin_token` cookie |
| `/api/admin/schools` | GET | ✅ | Duplicate check in add-school wizard |
| `/api/admin/schools/[id]/approve` | PATCH | ✅ | |
| `/api/admin/schools/[id]/reject` | PATCH | ✅ | |
| `/api/admin/check-owner` | GET | ✅ | Prisma relation bug on backend |
| `/api/admin/add-school` | POST | ✅ | Reads admin cookie server-side |
| `/api/admin/users/[id]/role` | PATCH | ✅ | |
| `/api/admin/users/[id]/status` | PATCH | ✅ | |
| `/api/parent/profile` | PATCH only | ⚠️ | GET uses SSR `backendFetch` |
| `/api/parent/favourites` | DELETE only | ⚠️ | GET/POST bypass BFF |
| `/api/school/profile` | PATCH | ✅ | |
| `/api/school/gallery` | GET, POST | ✅ | |
| `/api/school/gallery/[id]` | DELETE | ✅ | |
| `/api/school/inquiries/[id]/status` | PATCH | ✅ | |

Admin endpoints with no BFF (SSR direct): `GET /api/admin/stats`, `/users`, `/inquiries`.

---

## BACKEND API COMPLETENESS

| Feature | Status | Notes |
|---------|--------|-------|
| Route modules (6 files) | ✅ | All mounted; real Prisma implementations |
| `GET /api/schools` + filters/pagination | ✅ | Offset + cursor modes; cached |
| `GET /api/schools/search` | ✅ | Min 2 chars; approved only |
| `POST /api/admin/add-school` | ✅ | Creates school with `status: "APPROVED"` directly |
| Inquiry create/list/update | ✅ | No delete or get-by-id |
| Legacy `/api/favourites` | ✅ | Functional; Deprecation header present |
| `/api/parent/favourites` | ✅ | Richer response + pagination |
| Routes with TODO/stub | ⚠️ | Only `mailer.ts` stub |

---

## DATABASE & PRISMA

| Feature | Status | Notes |
|---------|--------|-------|
| Schema ↔ controllers sync | ✅ | Core models aligned |
| Migrations | ⚠️ | Single baseline migration; missing `migration_lock.toml` |
| OTP fields | ✅ | `otpCode`, `otpExpiry`, `otpVerified` — actively used |
| `resetToken`, `resetTokenExpiry` | 🧹 | In schema; only cleared, never set — legacy |
| NextAuth tables | 🧹 | Present but unused (JWT-only NextAuth) |
| `Facility` / `SchoolFacility` | ⚠️ | Read in queries; no write API |
| Prisma bug | ❌ | `checkOwnerEmail` uses `school:`; schema has `ownedSchools` |

---

## THIRD-PARTY INTEGRATIONS

| Integration | Status | Notes |
|-------------|--------|-------|
| Resend | ❌ | Implemented but orphaned (never imported) |
| Brevo | ❌ | TODO + commented stub |
| Fast2SMS | ✅ | Dev: logs OTP when API key unset |
| Cloudinary frontend `/api/upload` | ✅ | Working upload route |
| Cloudinary backend SDK | 🧹 | No route imports it |
| Google OAuth | ✅ parent only | School/admin have no Google button |
| Razorpay, OpenAI, Google Maps, PostHog, Sentry | ❌ | No integration started |

---

## CLEANUP & DEAD CODE

| Item | Path |
|------|------|
| `nodemailer` unused | `backend/package.json` |
| `multer` / upload middleware unmounted | `backend/src/middleware/upload.ts` |
| Backend cloudinary unused | `backend/src/lib/cloudinary.ts` |
| `bcryptjs` unused (frontend) | `frontend/package.json` |
| Legacy `/reset-password` page broken | `frontend/src/app/reset-password/page.tsx` |
| `CredentialsLoginForm` unused | `frontend/src/components/auth/CredentialsLoginForm.tsx` |
| `ApproveRejectButtons` unused | `frontend/src/components/ApproveRejectButtons.tsx` |
| `mailer.ts` orphaned | `backend/src/lib/mailer.ts` |
| Only TODO in source | `backend/src/lib/mailer.ts:86` |

---

## SEO & PERFORMANCE

| Feature | Status | Notes |
|---------|--------|-------|
| `sitemap.ts` | ✅ | Static routes + approved schools; revalidate 3600s |
| `robots.ts` | ✅ | Disallows admin, dashboard, parent, auth, `/api/` |
| JSON-LD | ✅ | Home: WebSite; school detail: EducationalOrganization + BreadcrumbList |
| ISR revalidation | ⚠️ | Listing 60s; detail 3600s. No `revalidateTag` on moderation |
| Suspense + skeletons | ✅ | Home, schools, admin pages |
| Route `loading.tsx` | ⚠️ | Only 3 routes |

---

## ENVIRONMENT & DEPLOYMENT

| Feature | Status | Notes |
|---------|--------|-------|
| `frontend/.env.example` | ✅ | Complete |
| `backend/.env.example` | ✅ | Complete; no `BREVO_API_KEY` |
| `render.yaml` | ⚠️ | Missing Resend, Fast2SMS in blueprint |
| `vercel.json` | ✅ | Next.js, bom1, security headers |
| `validateStartupEnv` | ⚠️ | Requires Cloudinary on backend (never uploads); Resend warn-only |

---

## PRIORITY TODO LIST

### P0 — Blocking core functionality

1. Fix school admin backend token bridge — persist real JWT or mint proper HS256 tokens with `issuer: "schoolfinder-api"` + `jti`.
2. Wire forgot-password OTP email — call `sendOtpEmail()` (Brevo or Resend).
3. Fix `checkOwnerEmail` Prisma bug — change `school:` to `ownedSchools:`.

### P1 — Partially done, easy to finish

4. Call `POST /api/auth/logout` on frontend logout.
5. Migrate `FavouriteButton` to BFF `/api/parent/favourites`.
6. Remove or fix legacy `/reset-password` page.
7. School registration auto sign-in.
8. Add `revalidateTag('schools')` on approve/reject.
9. Backend duplicate/owner validation on `addSchoolDirect`.

### P2 — Nice to have

10. Dynamic city/state filter dropdown.
11. Phone OTP login UI.
12. School comparison page.
13. Featured listings admin.
14. SEO admin panel.
15. Custom sections builder.
16. Facility management API.
17. Admin inquiry status updates.
18. On-demand ISR via webhooks.

---

## CLEANUP LIST

- `nodemailer`, `@types/nodemailer` — backend/package.json
- `multer` — backend/package.json
- `bcryptjs` — frontend/package.json
- `backend/src/middleware/upload.ts`
- `backend/src/lib/cloudinary.ts`
- `backend/src/lib/mailer.ts` (wire up or delete)
- `frontend/src/components/auth/CredentialsLoginForm.tsx`
- `frontend/src/components/ApproveRejectButtons.tsx`
- `frontend/src/app/reset-password/page.tsx`
- NextAuth DB tables (if staying JWT-only)
- `resetToken` / `resetTokenExpiry` columns
- Add `backend/prisma/migration_lock.toml`

---

## QUESTIONS FOR OWNER

1. School admin token strategy — HTTP-only cookie, persist backend JWT, or fix `mintBackendJwt`?
2. OTP email provider — Brevo or Resend?
3. Phone OTP login — build UI or defer/remove endpoints?
4. Featured schools — manual curation or keep "newest 6 approved"?
5. Legacy `/api/favourites` — migrate and remove, or keep during transition?
6. Facilities — build school-admin picker or drop from public UI?
7. School comparison — build or remove "compare" from marketing copy?
8. Backend Cloudinary env requirement — remove from `validateStartupEnv`?
9. User disable mechanism — keep sentinel phone or add `isActive` column?
10. ISR staleness — accept 1-hour cache or add webhook revalidation?

---

## Overall Summary

Public discovery (listing, detail, search), parent flows (login, register, profile, favourites, inquiries), and admin panel (stats, moderation, users, add-school) are largely built. The largest risks are the **school admin JWT bridge** (likely broken SSR/BFF), **non-functional password reset email**, and the **`checkOwnerEmail` Prisma bug**. Several planned features (comparison, dynamic filters, custom sections, featured/SEO admin) are documented but not implemented.
