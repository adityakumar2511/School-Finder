# SchoolFinder / SchoolSetu — Future Features

> Last updated: June 23, 2026  
> Purpose: This file contains features intentionally skipped or planned for later versions. Current implemented documentation lives in `Frontend.md`, `Backend.md`, and `plan.md`.

---

## Future Feature Summary

| Feature | Priority | Status |
|---|---:|---|
| Blog CMS | High | Skipped Phase 4, add later |
| Razorpay payments | High | On hold |
| Direct WhatsApp routing | Medium | On hold |
| Real AI recommendation engine | Medium | Placeholder route exists, AI logic pending |
| Reviews and ratings | Medium | Add later |
| Parent current-location nearby search | Medium | Add later |
| Admin bulk coordinate import | Low/Medium | Add later |
| Map preview in school profile form | Low/Medium | Add later |
| Facility management API | Low/Medium | Add later |
| Phone OTP frontend login/register flow | Low/Medium | Add later if needed |
| Advanced analytics dashboard | Medium | Add later |

---

## 1. Blog CMS — Skipped Phase 4

### Goal

Admin-managed blog system jisme public SEO blog pages bhi ho.

### Planned backend work

- Add `Blog` Prisma model.
- Add blog status enum:
  - `DRAFT`
  - `PUBLISHED`
- Add slug generation and uniqueness checks.
- Add admin-only blog CRUD APIs.
- Add public blog listing/detail APIs.
- Add optional cover image URL field.
- Add author relation with admin user.

### Suggested Prisma model

```prisma
model Blog {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String?
  content     String
  coverImage  String?
  status      BlogStatus @default(DRAFT)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status, createdAt])
  @@index([authorId])
}

enum BlogStatus {
  DRAFT
  PUBLISHED
}
```

### Planned frontend work

```txt
frontend/src/app/blog/page.tsx
frontend/src/app/blog/[slug]/page.tsx
frontend/src/app/admin/blogs/page.tsx
frontend/src/app/admin/blogs/new/page.tsx
frontend/src/app/admin/blogs/[id]/edit/page.tsx
frontend/src/app/api/admin/blogs/route.ts
frontend/src/app/api/admin/blogs/[id]/route.ts
frontend/src/components/admin/blogs/BlogEditor.tsx
frontend/src/components/public/blog/BlogCard.tsx
```

### Navbar / SEO changes

- Add Blog link in public navbar after implementation.
- Add `/blog` and `/blog/[slug]` to sitemap.
- Add BlogPosting JSON-LD on blog detail page.
- Add noindex for draft/admin blog pages.

---

## 2. Razorpay Payment Integration

### Goal

Featured listings, subscriptions, or paid school upgrades ko online payment ke through enable karna.

### Planned behaviour

- School admin selects package.
- Razorpay checkout opens.
- Payment success creates/updates featured listing.
- Backend verifies Razorpay signature.
- Payment record stored in DB.
- Admin can see payment status.

### Suggested backend models

```prisma
model Payment {
  id                 String   @id @default(cuid())
  schoolId           String
  userId             String
  razorpayOrderId    String   @unique
  razorpayPaymentId  String?
  amount             Int
  currency           String   @default("INR")
  status             PaymentStatus
  purpose            PaymentPurpose
  metadata           Json?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

enum PaymentStatus {
  CREATED
  PAID
  FAILED
  REFUNDED
}

enum PaymentPurpose {
  FEATURED_LISTING
  SUBSCRIPTION
}
```

### Planned APIs

```txt
POST /api/payments/create-order
POST /api/payments/verify
GET  /api/payments/my-school
GET  /api/admin/payments
```

### Planned env variables

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

---

## 3. Direct WhatsApp Routing

### Goal

Current inquiry form flow ke alawa, optional direct WhatsApp lead routing add karna.

### Planned behaviour

- School profile me WhatsApp number already supported hai.
- Public school detail page par “WhatsApp School” button add ho sakta hai.
- Click tracking add ki ja sakti hai.
- Admin can enable/disable direct WhatsApp per school.

### Safety / business notes

- Direct WhatsApp routing se platform ke tracked inquiries kam ho sakte hain.
- Isliye better approach:
  - Inquiry form primary rahe.
  - WhatsApp button optional ho.
  - Click tracking mandatory ho.

---

## 4. Real AI Recommendation Engine

### Current state

- `/ai-recommend` page exists as Coming Soon placeholder.
- No OpenAI/API cost currently.

### Future goal

Parents ko budget, location, board, medium, class, facilities, and preferences ke basis par recommended schools show karna.

### Possible implementation

- Rule-based recommendation first.
- AI explanation layer later.
- OpenAI only for explanation/ranking text, not for raw search.
- Backend endpoint can filter schools first, then AI can summarize top matches.

### Planned APIs

```txt
POST /api/recommendations/schools
```

### Suggested request body

```json
{
  "city": "Prayagraj",
  "board": "CBSE",
  "budgetMax": 80000,
  "className": "6",
  "preferredFacilities": ["Transport", "Sports", "Hostel"],
  "medium": "ENGLISH"
}
```

---

## 5. Reviews and Ratings

### Goal

Parents ke verified experience ke basis par school reviews add karna.

### Planned backend work

- Add `Review` model.
- Parent can review only after inquiry or verified interaction.
- Admin moderation required.
- Public detail page shows approved reviews only.

### Suggested model

```prisma
model Review {
  id        String   @id @default(cuid())
  schoolId  String
  parentId  String
  rating    Int
  title     String?
  comment   String
  status    ReviewStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([schoolId, parentId])
  @@index([schoolId, status])
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## 6. Parent Current-Location Nearby Search

### Current state

- Nearby Schools works from saved school coordinates.
- Public detail page can show nearby schools around current school.

### Future goal

Parent clicks “Use my current location” and sees nearby schools around their own location.

### Planned frontend work

- Browser geolocation permission.
- Nearby page or filter mode.
- Radius selector.
- Results sorted by distance.

### Possible route

```txt
/schools/nearby
```

---

## 7. Admin Bulk Coordinate Import

### Goal

Admin ko multiple schools ke latitude/longitude bulk update karne ka option dena.

### Planned formats

- CSV upload.
- Columns:
  - schoolId or slug
  - latitude
  - longitude

### Planned validation

- Latitude range: `-90` to `90`
- Longitude range: `-180` to `180`
- Invalid rows return downloadable error report.

---

## 8. Map Preview in School Profile Form

### Current state

- School admin can enter latitude/longitude.
- Public detail page uses coordinates for map embed.

### Future goal

Profile form me coordinate enter karte hi map preview show ho.

### Planned frontend work

```txt
frontend/src/components/school/profile/MapPreview.tsx
frontend/src/components/school/profile/formSections/20_ContactSection.tsx
```

---

## 9. Facility Management API

### Current state

- Facility/SchoolFacility models exist historically.
- Current profile uses string-array facilities list.

### Future goal

Admin-managed master facility list.

### Planned APIs

```txt
GET    /api/facilities
POST   /api/admin/facilities
PATCH  /api/admin/facilities/:id
DELETE /api/admin/facilities/:id
```

---

## 10. Phone OTP Frontend Integration

### Current state

- Backend has phone OTP endpoints.

### Future goal

Phone OTP login/register flow expose karna if business needs mobile-first auth.

### Planned frontend routes/components

```txt
frontend/src/components/auth/PhoneOtpLogin.tsx
frontend/src/app/login/page.tsx
frontend/src/app/register/page.tsx
```

---

## 11. Advanced Analytics Dashboard

### Goal

Admin and school dashboards ko more useful business metrics dena.

### Future metrics

- Leads by month.
- Leads by status.
- Conversion rate.
- Featured listing performance.
- School profile views.
- Inquiry source tracking.
- WhatsApp click tracking if WhatsApp routing added.

---

## Notes

- Current production docs should not include future items as implemented features.
- When any future feature is implemented, move it from this file into `plan.md`, `Frontend.md`, and/or `Backend.md`.
