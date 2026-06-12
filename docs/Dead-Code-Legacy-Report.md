# Dead Code & Legacy Architecture Report

> Generated: June 12, 2026  
> Source of truth: current codebase audit

This report identifies unused modules, legacy endpoints, stale artifacts, and partially implemented features that can potentially be removed or completed.

---

## Summary

| Category | Count | Risk if Removed |
|----------|-------|-----------------|
| Unused frontend components | 4 | Low |
| Unused frontend lib exports | 3 | Low |
| Unused npm dependencies | 8 | Low (after verification) |
| Legacy backend endpoints (still registered) | 6 | Medium (external clients unknown) |
| Legacy frontend routes/cookies | 3 | Low–Medium |
| Stale build artifacts | 2 | Low |
| Schema fields never written | 3 | Medium (migration required) |
| Partially implemented features | 3 | N/A — needs completion or removal |

---

## 1. Unused Frontend Components

| File | Status | Recommendation |
|------|--------|----------------|
| `frontend/src/components/motion/fade-in.tsx` | Never imported | Remove or integrate into home pages |
| `frontend/src/components/motion/stagger-grid.tsx` | Never imported | Remove or integrate into listings |
| `frontend/src/components/ui/stat-card.tsx` | Never imported | Remove or use in admin/parent dashboards |
| `frontend/src/components/ui/empty-state.tsx` | Never imported | `schools/page.tsx` defines inline empty state instead |

---

## 2. Unused Frontend Lib / Config

| File / Export | Status | Recommendation |
|---------------|--------|----------------|
| `frontend/src/lib/admin/session.ts` — `requireAdminSession()` | Defined, never called | Remove file or wire into admin layouts |
| `auth-config.ts` — `GUEST_AUTH_ROUTES` | Exported, never imported | Remove or use in middleware |
| `auth-config.ts` — `ROUTE_ALLOWED_ROLE` | Exported, never imported | Remove or use in `AuthRoleGuard` |

---

## 3. Unused Frontend API Route

| Route | File | Status |
|-------|------|--------|
| `DELETE /api/admin/schools/[id]` | `src/app/api/admin/schools/[id]/route.ts` | Registered but no UI caller found |

Backend supports `DELETE /api/schools/:id` (ADMIN only). Consider adding admin UI or removing the BFF route.

---

## 4. Legacy Frontend Routes & Cookies

| Item | Current State | Recommendation |
|------|---------------|----------------|
| `/reset-password` | Redirect stub → `/forgot-password?role=…` | Keep redirect for bookmarked URLs or remove after grace period |
| `sf_school_token` cookie | Set at school login via `/api/school/session`; cleared on logout; **not read** by `resolveBackendToken` | Remove cookie set/clear logic and `/api/school/session` route |
| `next.config.mjs` | Entire file commented out | Delete file; `next.config.js` is active |

---

## 5. Unused npm Dependencies

### Frontend (`frontend/package.json`)

| Package | Reason |
|---------|--------|
| `jose` | Replaced by `jsonwebtoken` in `backend-jwt.ts` |
| `@radix-ui/react-accordion` | No component imports |
| `@radix-ui/react-avatar` | No component imports |
| `@radix-ui/react-checkbox` | No component imports |
| `@radix-ui/react-dropdown-menu` | No component imports |
| `@radix-ui/react-separator` | No component imports |
| `@radix-ui/react-tabs` | No component imports |
| `@radix-ui/react-toast` | No component imports |

### Backend (`backend/package.json`)

| Package | Reason |
|---------|--------|
| `resend` | Not imported; mailer uses Brevo HTTPS API |
| `axios` | Not imported anywhere in `src/` |
| `@getbrevo/brevo` | Not imported; mailer uses raw `https` module |

---

## 6. Legacy Backend Endpoints (Still Registered)

These endpoints remain active but are superseded by newer routes. Frontend does not call them.

| Endpoint | Replacement | Deprecation Status |
|----------|-------------|-------------------|
| `GET/POST/DELETE /api/favourites` | `/api/parent/favourites` | `Deprecation` header set on responses |
| `POST /api/admin/approve` | `PATCH /api/admin/schools/:id/approve` | Legacy body format; delegates internally |
| `POST /api/admin/reject` | `PATCH /api/admin/schools/:id/reject` | Legacy body format; delegates internally |
| `GET /api/schools/search` | `GET /api/schools?search=` | No frontend caller |
| `POST /api/schools` (createSchool) | `POST /api/auth/register-school` | No frontend caller |
| `POST /api/auth/send-otp` | — | Phone OTP; no frontend UI |
| `POST /api/auth/verify-otp` | — | Phone OTP; no frontend UI |

**Recommendation:** Add sunset timeline for legacy favourites and admin approve/reject POST routes. Remove search and createSchool if confirmed unused.

---

## 7. Frontend Using Legacy Backend Paths

| Frontend Caller | Backend Path Used | Preferred Path |
|-----------------|-------------------|----------------|
| `parent/inquiries/page.tsx` | `GET /api/inquiries/my` | `GET /api/parent/inquiries` |

Both work; parent inquiries page bypasses the preferred parent API namespace.

---

## 8. Stale Build Artifacts

| File | Issue |
|------|-------|
| `backend/dist/lib/cloudinary.js` | No corresponding `src/lib/cloudinary.ts` |
| `backend/dist/middleware/upload.js` | No corresponding `src/middleware/upload.ts` |

These are leftover from a removed upload implementation. Safe to delete from `dist/` on next clean build.

---

## 9. Unused Backend Exports

| Export | File | Status |
|--------|------|--------|
| `getListenHost()` | `backend/src/config/production.ts` | Never imported; server hardcodes `"0.0.0.0"` |
| `formatZodErrors()` | `backend/src/middleware/validate.ts` | Never imported |

---

## 10. Database Schema — Unused Fields & Models

| Item | Status | Notes |
|------|--------|-------|
| `User.resetToken` / `resetTokenExpiry` | Never set in code | Legacy token-based reset; OTP flow used instead |
| `SchoolStatus.DRAFT` | Never assigned by backend | Frontend checks for DRAFT and redirects; status unreachable via current flows |
| `Facility` / `SchoolFacility` models | Read-only via relations | No API to create/update facilities |
| `Account`, `Session`, `VerificationToken` | Schema exists | NextAuth-shaped tables; backend routes never query them |
| `User.phone` (non-disable) | Field exists | Phone OTP auth backend-only; no frontend registration with phone |

---

## 11. Partially Implemented Features

| Feature | Backend | Frontend | Gap |
|---------|---------|----------|-----|
| **DRAFT school flow** | Enum exists; never assigned | Layout redirects DRAFT → `/school-complete-registration` | No backend path creates DRAFT schools |
| **Phone OTP auth** | `send-otp` + `verify-otp` endpoints | No UI | Complete frontend or remove endpoints |
| **Facility display** | Schema + read via `_count` | Not displayed on detail pages | Add facility seeding/display or remove schema |
| **Email provider** | Brevo (`BREVO_API_KEY`) | Docs previously said Resend | Align `.env.example`, startup validation, and mailer |

---

## 12. Known Auth Gap

| Issue | Location | Impact |
|-------|----------|--------|
| `GET /api/schools/:slug` has no auth middleware | `schools.routes.ts` | Controller checks `req.user` for non-APPROVED visibility, but `req.user` is always undefined without optional auth middleware. Owner/admin preview of pending schools does not work. |

---

## 13. Recommended Cleanup Priority

### High Priority (correctness)

1. Align email provider: update `.env.example` and `validateStartupEnv()` to use `BREVO_API_KEY` instead of `RESEND_API_KEY`
2. Fix or remove DRAFT status flow (either assign DRAFT in backend or remove frontend checks)
3. Add optional auth to `GET /api/schools/:slug` or remove dead visibility logic

### Medium Priority (maintenance)

4. Remove unused npm dependencies (frontend Radix packages, `jose`, backend `resend`/`axios`)
5. Remove `sf_school_token` cookie flow and `/api/school/session` route
6. Delete `next.config.mjs` stub
7. Migrate `parent/inquiries/page.tsx` to `GET /api/parent/inquiries`
8. Remove unused frontend components and lib exports

### Low Priority (legacy sunset)

9. Deprecate and remove `/api/favourites` legacy router
10. Remove `POST /api/admin/approve|reject` legacy endpoints
11. Remove `/reset-password` redirect page after grace period
12. Remove unused schema fields (`resetToken*`) via migration
13. Remove or implement Facility model and phone OTP endpoints

---

## 14. Files Safe to Delete (After Verification)

```
frontend/next.config.mjs
frontend/src/components/motion/fade-in.tsx
frontend/src/components/motion/stagger-grid.tsx
frontend/src/components/ui/stat-card.tsx
frontend/src/components/ui/empty-state.tsx
frontend/src/lib/admin/session.ts
backend/dist/lib/cloudinary.js          (regenerated on build)
backend/dist/middleware/upload.js       (regenerated on build)
```

**Do not delete without team confirmation:** legacy API routes (may have external consumers), `/reset-password` redirect (bookmarked URLs), NextAuth schema tables (may be needed for future adapter).
