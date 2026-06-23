# SchoolSetu — Frontend Documentation

> Last updated: June 23, 2026  
> Stack: Next.js 14 App Router · TypeScript · Tailwind CSS · NextAuth v5 · Cloudinary · Sentry  
> Default port: `3000`  
> Repository path: `frontend/`  
> Database: None — all data comes from Express REST API using `NEXT_PUBLIC_API_URL`

The frontend is a role-separated Next.js application for public school discovery, parent dashboard, school dashboard, admin panel, contact form, compare flow, featured listings, SEO pages, maps/nearby discovery, and error monitoring.

Future-only modules such as Blog CMS, Razorpay, real AI recommendations, reviews, and direct WhatsApp routing are documented separately in `Future-Features.md`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Route Structure](#4-route-structure)
5. [Component Structure](#5-component-structure)
6. [Authentication Flow](#6-authentication-flow)
7. [API Integration](#7-api-integration)
8. [Data Fetching and Caching](#8-data-fetching-and-caching)
9. [Forms and Validation](#9-forms-and-validation)
10. [Upload System](#10-upload-system)
11. [SEO](#11-seo)
12. [Featured Listings](#12-featured-listings)
13. [Compare Schools](#13-compare-schools)
14. [Maps and Nearby Schools](#14-maps-and-nearby-schools)
15. [Contact Page Integrations](#15-contact-page-integrations)
16. [Sentry Error Monitoring](#16-sentry-error-monitoring)
17. [Environment Variables](#17-environment-variables)
18. [Build and Deployment](#18-build-and-deployment)
19. [Current Features](#19-current-features)
20. [Quick Reference](#20-quick-reference)

---

## 1. Architecture Overview

### Principles

| Principle | Implementation |
|---|---|
| No direct database access | No Prisma or `DATABASE_URL` in frontend |
| Backend as source of truth | All business data comes from Express API |
| JWT sessions | NextAuth uses JWT strategy |
| BFF pattern | Client mutations go through `/api/*` route handlers |
| Role-separated UI | Public, Parent, School Admin, Platform Admin areas are separated |
| Server Components first | Public pages and dashboards fetch data server-side where possible |
| Client Components where needed | Forms, compare localStorage, filters, uploads, interactive actions |

### Execution flow

```txt
Browser / Server Component
    │
    ├─ Public fetch ───────► NEXT_PUBLIC_API_URL
    ├─ Auth dashboards ────► backendFetch() / adminFetch()
    ├─ Client mutation ────► Next.js BFF route /api/*
    ├─ Upload ─────────────► /api/upload → Cloudinary
    └─ Auth ───────────────► NextAuth + backend auth endpoints
```

---

## 2. Tech Stack

| Technology | Usage |
|---|---|
| Next.js 14 App Router | SSR, routing, BFF API routes, SEO |
| React 18 | UI |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI primitives |
| NextAuth v5 | Auth/session management |
| React Hook Form | Forms |
| Zod | Validation |
| Cloudinary | Image upload/delivery |
| Framer Motion | Home/page animations |
| Lucide React | Icons |
| Sentry Next.js SDK | Error monitoring |

Not used:

- Prisma
- Database drivers
- `@auth/prisma-adapter`

---

## 3. Folder Structure

```txt
frontend/
├── .env
├── .env.example
├── .env.local
├── .eslintrc.json
├── .gitignore
├── Frontend.md
├── middleware.ts
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── sentry.client.config.ts              # Sentry browser/client initialization
├── sentry.edge.config.ts                # Sentry edge runtime initialization
├── sentry.server.config.ts              # Sentry server runtime initialization
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── src/
    ├── instrumentation.ts               # Runtime-based Sentry registration
    ├── app/
    │   ├── about/
    │   │   └── page.tsx                 # Static About page
    │   ├── admin/
    │   │   ├── add-admin/
    │   │   │   └── page.tsx
    │   │   ├── add-parent/
    │   │   │   └── page.tsx
    │   │   ├── add-school/
    │   │   │   └── page.tsx
    │   │   ├── inquiries/
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── schools/
    │   │   │   ├── [id]/
    │   │   │   │   └── edit/
    │   │   │   │       └── page.tsx
    │   │   │   └── page.tsx
    │   │   └── users/
    │   │       └── page.tsx
    │   ├── admin-login/
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── ai-recommend/
    │   │   └── page.tsx                 # Coming Soon placeholder, no AI integration yet
    │   ├── api/
    │   │   ├── admin/
    │   │   │   ├── add-admin/
    │   │   │   │   └── route.ts
    │   │   │   ├── add-parent/
    │   │   │   │   └── route.ts
    │   │   │   ├── add-school/
    │   │   │   │   └── route.ts
    │   │   │   ├── check-owner/
    │   │   │   │   └── route.ts
    │   │   │   ├── schools/
    │   │   │   │   ├── [id]/
    │   │   │   │   │   ├── approve/
    │   │   │   │   │   │   └── route.ts
    │   │   │   │   │   ├── featured/
    │   │   │   │   │   │   └── route.ts    # PATCH — mark/unmark featured
    │   │   │   │   │   ├── reject/
    │   │   │   │   │   │   └── route.ts
    │   │   │   │   │   ├── visibility/
    │   │   │   │   │   │   └── route.ts    # PATCH — list/unlist public visibility
    │   │   │   │   │   └── route.ts        # DELETE + PATCH handlers
    │   │   │   │   └── route.ts
    │   │   │   ├── session/
    │   │   │   │   └── route.ts
    │   │   │   └── users/
    │   │   │       └── [id]/
    │   │   │           ├── role/
    │   │   │           │   └── route.ts
    │   │   │           ├── status/
    │   │   │           │   └── route.ts
    │   │   │           └── route.ts        # DELETE handler
    │   │   ├── auth/
    │   │   │   ├── [...nextauth]/
    │   │   │   │   └── route.ts
    │   │   │   └── logout/
    │   │   │       └── route.ts
    │   │   ├── contact/
    │   │   │   └── route.ts                # Contact form BFF proxy
    │   │   ├── parent/
    │   │   │   ├── favourites/
    │   │   │   │   └── route.ts
    │   │   │   └── profile/
    │   │   │       └── route.ts
    │   │   ├── school/
    │   │   │   ├── gallery/
    │   │   │   │   ├── [id]/
    │   │   │   │   │   └── route.ts
    │   │   │   │   └── route.ts
    │   │   │   ├── inquiries/
    │   │   │   │   └── [id]/
    │   │   │   │       └── status/
    │   │   │   │           └── route.ts
    │   │   │   └── profile/
    │   │   │       └── route.ts
    │   │   └── upload/
    │   │       └── route.ts
    │   ├── compare/
    │   │   ├── CompareClient.tsx          # localStorage compare logic
    │   │   └── page.tsx                   # Compare page wrapper
    │   ├── contact/
    │   │   ├── ContactForm.tsx            # DB + EmailJS + Sheets submit flow
    │   │   └── page.tsx
    │   ├── dashboard/
    │   │   └── school/
    │   │       ├── inquiries/
    │   │       │   └── page.tsx
    │   │       ├── layout.tsx
    │   │       ├── page.tsx
    │   │       └── profile/
    │   │           └── page.tsx
    │   ├── error.tsx
    │   ├── favicon.ico
    │   ├── fonts/
    │   │   ├── GeistMonoVF.woff
    │   │   └── GeistVF.woff
    │   ├── forgot-password/
    │   │   └── page.tsx
    │   ├── global-error.tsx               # Sentry-aware global fallback UI
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   ├── not-found.tsx
    │   ├── page.tsx
    │   ├── parent/
    │   │   ├── favourites/
    │   │   │   ├── FavouritesPagination.tsx
    │   │   │   ├── RemoveFavouriteButton.tsx
    │   │   │   ├── loading.tsx
    │   │   │   └── page.tsx
    │   │   ├── inquiries/
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── profile/
    │   │       └── page.tsx
    │   ├── providers.tsx
    │   ├── register/
    │   │   └── page.tsx
    │   ├── reset-password/
    │   │   └── page.tsx
    │   ├── robots.ts
    │   ├── school-complete-registration/
    │   │   └── page.tsx
    │   ├── school-login/
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── school-register/
    │   │   └── page.tsx
    │   ├── schools/
    │   │   ├── [slug]/
    │   │   │   ├── loading.tsx
    │   │   │   └── page.tsx               # Detail, map embed, nearby schools
    │   │   ├── board/
    │   │   │   └── [board]/
    │   │   │       ├── loading.tsx
    │   │   │       └── page.tsx           # SEO board page
    │   │   ├── city/
    │   │   │   └── [city]/
    │   │   │       ├── loading.tsx
    │   │   │       └── page.tsx           # SEO city page
    │   │   ├── state/
    │   │   │   └── [state]/
    │   │   │       ├── loading.tsx
    │   │   │       └── page.tsx           # SEO state page
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── sitemap.ts                     # Includes school/city/state/board URLs
    │   └── template.tsx
    │
    ├── components/
    │   ├── shared/                        # Used by 2+ roles or no role
    │   │   ├── layout/
    │   │   │   ├── Footer.tsx
    │   │   │   ├── HideOnAdminLogin.tsx
    │   │   │   ├── Navbar.tsx             # Home, Schools, Compare, About, Contact
    │   │   │   └── SessionHeartbeat.tsx
    │   │   ├── ui/                        # shadcn primitives
    │   │   │   ├── PasswordInput.tsx
    │   │   │   ├── badge.tsx
    │   │   │   ├── button.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── label.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── skeleton.tsx
    │   │   │   ├── table.tsx
    │   │   │   ├── tabs.tsx
    │   │   │   └── textarea.tsx
    │   │   ├── form/                      # Shared form primitives
    │   │   │   ├── FormField.tsx
    │   │   │   ├── FormGrid.tsx
    │   │   │   ├── FormSection.tsx
    │   │   │   └── index.ts
    │   │   ├── seo/
    │   │   │   └── JsonLd.tsx
    │   │   └── upload/
    │   │       └── ImageUploadField.tsx
    │   │
    │   ├── public/                        # No-auth pages
    │   │   ├── home/
    │   │   │   ├── FeaturedSchools.tsx     # Real featured schools API data
    │   │   │   ├── FeaturedSchoolsSkeleton.tsx
    │   │   │   ├── HomeHero.tsx
    │   │   │   └── HomeStats.tsx
    │   │   └── schools/
    │   │       ├── FavouriteButton.tsx
    │   │       ├── InquiryModal.tsx
    │   │       ├── SchoolCard.tsx          # Featured badge + compare button
    │   │       ├── SchoolCardSkeleton.tsx
    │   │       ├── SchoolFilters.tsx
    │   │       └── SchoolGridSkeleton.tsx
    │   │
    │   ├── auth/                          # Login / register content
    │   │   ├── AuthRoleGuard.tsx
    │   │   ├── ParentLoginContent.tsx
    │   │   └── SchoolLoginContent.tsx
    │   │
    │   ├── parent/                        # PARENT role only
    │   │   ├── ParentNav.tsx
    │   │   ├── ProfileForm.tsx
    │   │   ├── RecentViewedSchools.tsx
    │   │   └── TrackSchoolView.tsx
    │   │
    │   ├── school/                        # SCHOOL_ADMIN role only
    │   │   ├── SchoolStatusCard.tsx
    │   │   ├── gallery/
    │   │   │   └── SchoolGalleryManager.tsx
    │   │   ├── inquiries/
    │   │   │   ├── InquiryFilters.tsx
    │   │   │   ├── InquiryPagination.tsx
    │   │   │   ├── InquiryStatusBadge.tsx  # NEW/CONTACTED/INTERESTED/CONVERTED/CLOSED
    │   │   │   └── InquiryStatusSelect.tsx # Updated lead statuses
    │   │   ├── nav/
    │   │   │   └── SchoolDashboardNav.tsx
    │   │   ├── profile/
    │   │   │   ├── SchoolProfileForm.tsx   # Coordinates + admin submitEndpoint support
    │   │   │   ├── SchoolProfileSidebar.tsx
    │   │   │   └── formSections/
    │   │   │       ├── 01_BasicInfoSection.tsx
    │   │   │       ├── 02_AboutSchoolSection.tsx
    │   │   │       ├── 03_AcademicsSection.tsx
    │   │   │       ├── 04_AdmissionsSection.tsx
    │   │   │       ├── 05_FeeStructureSection.tsx
    │   │   │       ├── 06_FacilitiesSection.tsx
    │   │   │       ├── 07_SportsSection.tsx
    │   │   │       ├── 08_InfrastructureSection.tsx
    │   │   │       ├── 09_FacultySection.tsx
    │   │   │       ├── 10_ProgramsSection.tsx
    │   │   │       ├── 11_StudentLifeSection.tsx
    │   │   │       ├── 12_AchievementsSection.tsx
    │   │   │       ├── 13_BoardResultsSection.tsx
    │   │   │       ├── 14_ScholarshipsSection.tsx
    │   │   │       ├── 15_HostelSection.tsx
    │   │   │       ├── 16_TransportSection.tsx
    │   │   │       ├── 17_SafetySection.tsx
    │   │   │       ├── 18_GallerySection.tsx
    │   │   │       ├── 19_DownloadsSection.tsx
    │   │   │       ├── 20_ContactSection.tsx   # Phone, social, mapUrl, latitude, longitude
    │   │   │       ├── 21_ReviewsSection.tsx
    │   │   │       ├── 22_FAQsSection.tsx
    │   │   │       ├── index.ts
    │   │   │       └── types.ts
    │   │   └── registration/
    │   │       └── SchoolRegisterWizard.tsx
    │   │
    │   └── admin/                         # ADMIN role only
    │       ├── moderation/
    │       │   ├── SchoolDetailModal.tsx
    │       │   ├── SchoolModerationActions.tsx  # Edit, Delete, View Inquiries, List/Unlist, Featured
    │       │   └── SchoolStatusBadge.tsx        # Status + hidden + featured indicators
    │       ├── nav/
    │       │   └── AdminNav.tsx                 # Access-level gated links
    │       ├── search-pagination/
    │       │   ├── AdminPagination.tsx
    │       │   └── AdminSearchBar.tsx           # State + City dependent selects
    │       └── users/
    │           ├── AdminAccessBadge.tsx
    │           ├── RoleBadge.tsx                # Super Admin tag
    │           └── UserManagementActions.tsx    # Delete/status/role actions gated
    │
    └── lib/
        ├── admin/
        │   ├── constants.ts                     # Indian states/UTs list
        │   ├── data.ts                          # Admin fetchers and typed responses
        │   └── session.ts
        ├── api/
        │   ├── error.ts
        │   ├── pagination.ts
        │   ├── proxy.ts
        │   ├── resolve-backend-token.ts
        │   └── server.ts
        ├── auth/
        │   ├── admin-auth.ts
        │   ├── auth-config.ts
        │   ├── auth.ts                          # Session includes accessLevel/isSuperAdmin
        │   ├── backend-jwt.ts
        │   ├── logout.ts
        │   ├── middleware-auth.ts
        │   └── parent-token.ts
        ├── data/
        │   └── schools-public.ts                # Public, featured, city/state/board, nearby fetchers
        ├── parent/
        │   ├── data.ts
        │   └── recent-schools.ts
        ├── school/
        │   ├── data.ts
        │   └── gallery.ts
        ├── seo/
        │   ├── revalidate-schools.ts
        │   └── seo.ts
        ├── types/
        │   └── database.ts                      # Enums, school list/detail, GeoCoordinates
        ├── ui/
        │   └── motion.ts
        ├── upload/
        │   ├── cloudinary-url.ts
        │   ├── cloudinary.ts
        │   ├── image-placeholder.ts
        │   ├── upload-client.ts
        │   └── upload-security.ts
        └── utils.ts
```

---

## 4. Route Structure

### Public routes

| Route | Purpose |
|---|---|
| `/` | Homepage with hero, stats, featured schools |
| `/about` | About page |
| `/contact` | Contact page with DB save + EmailJS + Google Sheets webhook |
| `/schools` | School listing with filters |
| `/schools/[slug]` | Public school detail page with inquiry, favourites, map, nearby schools |
| `/schools/city/[city]` | SEO city school page |
| `/schools/state/[state]` | SEO state school page |
| `/schools/board/[board]` | SEO board school page |
| `/compare` | Compare up to 3 schools |
| `/ai-recommend` | Coming Soon placeholder page |
| `/login` | Parent login |
| `/register` | Parent registration |
| `/forgot-password` | OTP password reset |
| `/school-login` | School admin login |
| `/school-register` | School registration wizard |
| `/admin-login` | Hidden admin login |

### Parent dashboard

| Route | Purpose |
|---|---|
| `/parent` | Parent overview and recently viewed schools |
| `/parent/profile` | Parent profile edit |
| `/parent/favourites` | Saved schools |
| `/parent/inquiries` | Sent inquiries and status |

### School dashboard

| Route | Purpose |
|---|---|
| `/dashboard/school` | School overview, status, lead summary |
| `/dashboard/school/profile` | Full school profile editor with 22 sections |
| `/dashboard/school/inquiries` | Inquiry/lead management |

### Admin panel

| Route | Purpose |
|---|---|
| `/admin` | Admin stats dashboard |
| `/admin/schools` | Moderation, filters, approve/reject/edit/delete, list/unlist, featured toggle |
| `/admin/schools/[id]/edit` | Admin full school profile edit |
| `/admin/users` | School admins, parents, admins management |
| `/admin/inquiries` | Cross-school inquiry monitoring |
| `/admin/add-school` | Admin creates approved school |
| `/admin/add-parent` | Admin creates parent |
| `/admin/add-admin` | Full access admin creates admin |

### BFF API routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/auth/logout` | POST | Backend logout + cookie cleanup |
| `/api/contact` | POST | Contact form proxy to backend |
| `/api/upload` | POST | Cloudinary upload |
| `/api/admin/session` | POST, DELETE | Admin token cookie set/clear |
| `/api/admin/schools` | GET | Admin school list proxy |
| `/api/admin/schools/[id]` | PATCH, DELETE | Admin edit/delete school |
| `/api/admin/schools/[id]/approve` | PATCH | Approve school |
| `/api/admin/schools/[id]/reject` | PATCH | Reject school |
| `/api/admin/schools/[id]/visibility` | PATCH | List/unlist school |
| `/api/admin/schools/[id]/featured` | PATCH | Mark/unmark featured |
| `/api/admin/users/[id]` | DELETE | Delete user |
| `/api/admin/users/[id]/role` | PATCH | Update user role |
| `/api/admin/users/[id]/status` | PATCH | Enable/disable user |
| `/api/admin/add-school` | POST | Create approved school |
| `/api/admin/add-parent` | POST | Create parent |
| `/api/admin/add-admin` | POST | Create admin |
| `/api/admin/check-owner` | GET | Duplicate email/owner check |
| `/api/parent/profile` | PATCH | Update parent profile |
| `/api/parent/favourites` | GET, POST, DELETE | Parent favourites |
| `/api/school/profile` | PATCH | Update school profile |
| `/api/school/gallery` | GET, POST | Gallery list/add |
| `/api/school/gallery/[id]` | DELETE | Delete gallery image |
| `/api/school/inquiries/[id]/status` | PATCH | Update inquiry status |

---

## 5. Component Structure

```txt
components/
├── shared/
│   ├── layout/Navbar.tsx
│   ├── layout/Footer.tsx
│   ├── layout/SessionHeartbeat.tsx
│   ├── ui/
│   ├── form/
│   ├── seo/JsonLd.tsx
│   └── upload/ImageUploadField.tsx
├── public/
│   ├── home/FeaturedSchools.tsx
│   └── schools/
│       ├── SchoolCard.tsx
│       ├── SchoolFilters.tsx
│       ├── InquiryModal.tsx
│       └── FavouriteButton.tsx
├── auth/
├── parent/
├── school/
│   ├── SchoolStatusCard.tsx
│   ├── gallery/SchoolGalleryManager.tsx
│   ├── inquiries/InquiryStatusBadge.tsx
│   ├── inquiries/InquiryStatusSelect.tsx
│   └── profile/
│       ├── SchoolProfileForm.tsx
│       └── formSections/01-22
└── admin/
    ├── nav/AdminNav.tsx
    ├── moderation/SchoolModerationActions.tsx
    ├── moderation/SchoolStatusBadge.tsx
    ├── search-pagination/
    └── users/
```

---

## 6. Authentication Flow

### Parent

- Login at `/login` using Google OAuth or email/password.
- Backend JWT stored in NextAuth session.
- Parent token also stored in sessionStorage for direct inquiry calls.
- Parent routes protected by middleware and layout guard.

### School admin

- Login at `/school-login`.
- Register at `/school-register` using 4-step wizard.
- Dashboard routes require `SCHOOL_ADMIN` role.
- School profile uses backend school owner authorization.

### Platform admin

- Login at hidden `/admin-login`.
- Backend token stored in HTTP-only `sf_admin_token` cookie.
- Admin routes require `ADMIN` role.
- UI supports admin access levels:
  - `READ_ONLY`
  - `READ_WRITE`
  - `FULL_ACCESS`
- Super admin row actions are hidden in user management.

---

## 7. API Integration

| Pattern | Usage |
|---|---|
| Public fetch | Home, listings, SEO pages, sitemap |
| Server dashboard fetch | Parent, school, admin dashboards |
| BFF proxy | Authenticated client mutations |
| Direct backend fetch | Login/register/reset/inquiry where needed |
| Upload route | Cloudinary uploads |

Main modules:

```txt
frontend/src/lib/api/server.ts
frontend/src/lib/api/proxy.ts
frontend/src/lib/api/error.ts
frontend/src/lib/api/resolve-backend-token.ts
frontend/src/lib/data/schools-public.ts
frontend/src/lib/admin/data.ts
frontend/src/lib/parent/data.ts
frontend/src/lib/school/data.ts
```

---

## 8. Data Fetching and Caching

### Public data

| Data | Revalidation |
|---|---:|
| School listing | 60 seconds |
| City/state/board pages | 60 seconds |
| School detail | 3600 seconds |
| Featured schools | 3600 seconds |
| Sitemap | 3600 seconds |

### Authenticated data

- Uses `cache: "no-store"`.
- Admin and dashboard pages fetch fresh data.

### Client-side storage

| Storage | Purpose |
|---|---|
| NextAuth JWT | Auth session |
| HTTP-only `sf_admin_token` | Admin backend JWT |
| sessionStorage `sf_parent_token` | Parent direct inquiry calls |
| localStorage `sf_school_draft_{email}` | School registration draft |
| localStorage recent schools | Parent recently viewed schools |
| localStorage `schoolfinder_compare_schools` | Compare selected schools |

---

## 9. Forms and Validation

| Form | Validation |
|---|---|
| Parent login/register | React Hook Form + Zod |
| School registration wizard | Per-step validation |
| School profile editor | 22-section schema validation |
| Admin add-school | Multi-step validation + duplicate checks |
| Admin add-parent | Email duplicate check |
| Admin add-admin | Access-level validation |
| Contact form | Client validation + backend validation |
| Inquiry modal | Client validation + spam protection fields |

Shared form primitives:

```txt
frontend/src/components/shared/form/FormField.tsx
frontend/src/components/shared/form/FormGrid.tsx
frontend/src/components/shared/form/FormSection.tsx
```

---

## 10. Upload System

All image uploads go through:

```txt
POST /api/upload
```

Rules:

- Auth required.
- Allowed MIME:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- Max size: 5 MB.
- Server validates magic bytes.
- Cloudinary credentials stay server-side.

Upload utilities:

```txt
frontend/src/lib/upload/cloudinary.ts
frontend/src/lib/upload/cloudinary-url.ts
frontend/src/lib/upload/upload-client.ts
frontend/src/lib/upload/upload-security.ts
```

---

## 11. SEO

Implemented SEO features:

- Root metadata.
- Dynamic school metadata.
- City/state/board SEO pages.
- Dynamic sitemap.
- Robots file.
- JSON-LD for website and school detail.
- Optimized `next/image` usage.
- Public routes indexed.
- Private/auth/admin/dashboard/API routes noindexed/disallowed.

Main files:

```txt
frontend/src/lib/seo/seo.ts
frontend/src/lib/seo/revalidate-schools.ts
frontend/src/app/sitemap.ts
frontend/src/app/robots.ts
frontend/src/components/shared/seo/JsonLd.tsx
```

---

## 12. Featured Listings

Frontend featured support:

- Homepage uses real featured schools.
- Public school cards show featured badge.
- `/schools` listing keeps featured schools first through backend ordering.
- Admin can mark/unmark featured school.
- Admin can select featured duration.
- Admin can see active/expired featured state.

Main files:

```txt
frontend/src/components/public/home/FeaturedSchools.tsx
frontend/src/components/public/schools/SchoolCard.tsx
frontend/src/components/admin/moderation/SchoolModerationActions.tsx
frontend/src/components/admin/moderation/SchoolStatusBadge.tsx
frontend/src/app/api/admin/schools/[id]/featured/route.ts
frontend/src/lib/data/schools-public.ts
frontend/src/lib/admin/data.ts
```

---

## 13. Compare Schools

Implemented behaviour:

- Route: `/compare`
- User can compare up to 3 schools.
- Selection stored in `localStorage` key:

```txt
schoolfinder_compare_schools
```

- School cards include compare button.
- Compare page supports add/remove.
- Compare table includes:
  - Board
  - School type
  - Medium
  - Classes
  - City/state
  - Tuition fee
  - Facilities count
  - Featured status

Main files:

```txt
frontend/src/app/compare/page.tsx
frontend/src/app/compare/CompareClient.tsx
frontend/src/components/public/schools/SchoolCard.tsx
```

---

## 14. Maps and Nearby Schools

Implemented behaviour:

- School profile contact section accepts latitude/longitude.
- Latitude validation: `-90` to `90`.
- Longitude validation: `-180` to `180`.
- Public school detail page shows map iframe when coordinates or map URL exists.
- Coordinates are preferred for map embed.
- Existing Google Maps embed URL remains fallback.
- “View on Map” button added.
- Nearby Schools section appears when current school has coordinates and nearby results exist.
- Nearby school items show distance in km.

Main files:

```txt
frontend/src/components/school/profile/formSections/20_ContactSection.tsx
frontend/src/components/school/profile/SchoolProfileForm.tsx
frontend/src/app/schools/[slug]/page.tsx
frontend/src/lib/data/schools-public.ts
```

---

## 15. Contact Page Integrations

Contact page fields:

- Name
- Email
- Phone
- Message

Flow:

1. User submits contact form.
2. Frontend BFF posts data to backend `/api/contact`.
3. Backend saves `ContactSubmission`.
4. EmailJS sends notification from browser.
5. Google Sheets webhook logs submission.

Frontend env variables:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_CONTACT_SHEET_URL=
```

Main files:

```txt
frontend/src/app/contact/page.tsx
frontend/src/app/contact/ContactForm.tsx
frontend/src/app/api/contact/route.ts
```

---

## 16. Sentry Error Monitoring

Implemented:

- Browser/client error capture.
- Server runtime error capture.
- Edge runtime error capture.
- Global error boundary UI.
- Safe DSN guard.
- Sensitive header cleanup.
- Source map upload config guarded by Sentry env vars.

Main files:

```txt
frontend/sentry.client.config.ts
frontend/sentry.server.config.ts
frontend/sentry.edge.config.ts
frontend/src/instrumentation.ts
frontend/src/app/global-error.tsx
frontend/next.config.js
```

---

## 17. Environment Variables

```env
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_API_URL=
NEXTAUTH_URL=
AUTH_URL=
NEXTAUTH_SECRET=
AUTH_SECRET=
AUTH_TRUST_HOST=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_CONTACT_SHEET_URL=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

Important:

- `JWT_SECRET` must match backend.
- `DATABASE_URL` is not required in frontend.
- Only `NEXT_PUBLIC_*` variables are exposed to browser.

---

## 18. Build and Deployment

### Local

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open:

```txt
http://localhost:3000
```

### Build

```bash
npm run build
npx tsc --noEmit
```

### Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Add env vars from Section 17.
- Backend `FRONTEND_URL` must include production frontend URL.
- Google OAuth redirect must point to:

```txt
https://your-domain.com/api/auth/callback/google
```

---

## 19. Current Features

### Public users

- Homepage.
- About page.
- Contact page.
- School listing.
- School filters.
- School detail page.
- Featured school badges.
- Inquiry modal.
- Map embed.
- Nearby schools.
- Compare schools.
- SEO city/state/board pages.
- AI recommendation Coming Soon page.

### Parents

- Login/register.
- Google OAuth.
- OTP password reset.
- Parent dashboard.
- Profile update.
- Favourites.
- Recently viewed schools.
- Sent inquiry tracking.
- Inquiry statuses:
  - NEW
  - CONTACTED
  - INTERESTED
  - CONVERTED
  - CLOSED

### School admins

- School login/register.
- 4-step registration wizard.
- Dashboard overview.
- Monthly lead stat.
- Inquiry/lead management.
- Status update workflow.
- Full 22-section profile editor.
- Gallery image management.
- Latitude/longitude fields.

### Platform admins

- Admin login.
- Stats dashboard.
- School moderation.
- Approve/reject schools.
- Edit/delete schools.
- List/unlist schools.
- Mark/unmark featured schools.
- Add school.
- Add parent.
- Add admin with access level.
- User management.
- Super admin protection UI.
- Cross-school inquiry monitoring.

---

## 20. Quick Reference

| Task | Command / Path |
|---|---|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Type check | `npx tsc --noEmit` |
| Auth config | `src/lib/auth/auth.ts` |
| Middleware | `middleware.ts` |
| API proxy | `src/lib/api/proxy.ts` |
| Public data | `src/lib/data/schools-public.ts` |
| Upload route | `src/app/api/upload/route.ts` |
| Contact page | `src/app/contact/page.tsx` |
| Compare page | `src/app/compare/page.tsx` |
| School detail | `src/app/schools/[slug]/page.tsx` |
| Sentry configs | `sentry.*.config.ts` |
