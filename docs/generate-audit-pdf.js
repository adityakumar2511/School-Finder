/**
 * Generates SchoolFinder-Codebase-Audit.pdf from structured content.
 * Run: node docs/generate-audit-pdf.js
 */
const fs = require("fs");
const path = require("path");

async function main() {
  const PDFDocument = require("pdfkit");
  const outPath = path.join(__dirname, "SchoolFinder-Codebase-Audit.pdf");
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const ok = "[OK]";
  const partial = "[PARTIAL]";
  const missing = "[MISSING]";
  const cleanup = "[CLEANUP]";

  function title(text) {
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor("#1e3a8a").text(text, { underline: true });
    doc.moveDown(0.3);
    doc.fillColor("#000000");
  }

  function section(text) {
    doc.moveDown(0.4);
    doc.fontSize(13).fillColor("#1e40af").text(text);
    doc.moveDown(0.2);
    doc.fillColor("#000000").fontSize(9);
  }

  function para(text) {
    doc.fontSize(9).text(text, { width: pageWidth, align: "justify" });
    doc.moveDown(0.15);
  }

  function bullet(text) {
    doc.fontSize(9).text(`  • ${text}`, { width: pageWidth - 10 });
    doc.moveDown(0.08);
  }

  function tableRow(cols, bold = false) {
    const widths = [0.22, 0.08, 0.32, 0.38].map((f) => f * pageWidth);
    const y = doc.y;
    let x = doc.page.margins.left;
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(7.5);
    for (let i = 0; i < cols.length; i++) {
      doc.text(cols[i], x, y, { width: widths[i] - 4, lineBreak: true });
      x += widths[i];
    }
    doc.moveDown(0.15);
    const lineY = doc.y;
    doc.moveTo(doc.page.margins.left, lineY).lineTo(doc.page.width - doc.page.margins.right, lineY).strokeColor("#e5e7eb").stroke();
    doc.moveDown(0.12);
  }

  function ensureSpace(h = 80) {
    if (doc.y + h > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }
  }

  // Cover
  doc.fontSize(24).fillColor("#1e3a8a").text("SchoolFinder", { align: "center" });
  doc.fontSize(16).fillColor("#374151").text("Full Codebase Audit", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#6b7280").text("Date: June 5, 2026", { align: "center" });
  doc.text("Scope: frontend/ and backend/", { align: "center" });
  doc.text("Stack: Next.js 14, NextAuth v5, Express 5, Prisma 5, PostgreSQL", { align: "center" });
  doc.moveDown(1);
  doc.fillColor("#000000").fontSize(9);
  para(
    "Legend: [OK] = Fully implemented | [PARTIAL] = Partial/stub | [MISSING] = Not implemented | [CLEANUP] = Dead code"
  );

  // AUTH
  doc.addPage();
  title("1. AUTH & SESSIONS");
  tableRow(["Feature", "Status", "File(s)", "Notes"], true);
  const authRows = [
    ["Parent login (email/password)", ok, "ParentLoginContent.tsx, auth.ts", "Backend login + NextAuth + sf_parent_token"],
    ["Parent login (Google OAuth)", ok, "auth.ts, auth.controller.ts", "Rejects non-PARENT roles"],
    ["Parent registration", ok, "register/page.tsx", "Auto sign-in after register-parent"],
    ["School admin login", ok, "SchoolLoginContent.tsx", "Credentials only"],
    ["School admin registration", partial, "SchoolRegisterWizard.tsx", "No auto sign-in after register"],
    ["Admin login (/admin-login)", ok, "admin-login/page.tsx", "Hidden route + httpOnly cookie"],
    ["Forgot password 3-step OTP", partial, "forgot-password/page.tsx", "UI wired; OTP console-only"],
    ["OTP email (Brevo)", missing, "lib/mailer.ts", "Stub; never called"],
    ["Resend password reset", missing, "lib/mailer.ts", "Orphaned; not imported"],
    ["Phone OTP backend", ok, "auth.controller.ts, otp.ts", "Fast2SMS + dev console fallback"],
    ["Phone OTP frontend UI", missing, "—", "No UI"],
    ["JWT blacklist on logout", partial, "logout.ts, auth.controller.ts", "Backend OK; frontend never calls"],
    ["Role middleware (FE+BE)", ok, "middleware.ts, roleCheck.ts", "Edge + server + Express guards"],
    ["SessionHeartbeat", ok, "SessionHeartbeat.tsx, providers.tsx", "Mounted globally"],
    ["sf_admin_token cookie", partial, "admin-auth.ts, api/admin/session", "Works; logout no blacklist"],
  ];
  authRows.forEach((r) => { ensureSpace(); tableRow(r); });
  section("Critical gap");
  para(
    "School admin: auth.ts strips backendAccessToken for non-PARENT. mintBackendJwt() produces JWE tokens incompatible with Express JWT auth (issuer: schoolfinder-api). School dashboard SSR/BFF likely broken."
  );

  // SCHOOL
  doc.addPage();
  title("2. SCHOOL FEATURES");
  tableRow(["Feature", "Status", "File(s)", "Notes"], true);
  [
    ["Public listing + filters", ok, "schools/page.tsx, SchoolFilters.tsx", "Multi-select filter backend gap"],
    ["School detail (slug)", ok, "schools/[slug]/page.tsx", "JSON-LD + metadata"],
    ["Registration wizard", ok, "SchoolRegisterWizard.tsx", "4 steps; PENDING status"],
    ["Dashboard: profile", partial, "dashboard/school/profile", "Token bridge concern"],
    ["Dashboard: gallery", partial, "SchoolGalleryManager.tsx", "Cloudinary URL flow"],
    ["Dashboard: inquiries", partial, "dashboard/school/inquiries", "Status updates via BFF"],
    ["Dynamic city/state dropdown", missing, "SchoolFilters.tsx", "Free-text only"],
    ["Custom sections builder", missing, "—", "Hardcoded sections"],
    ["Moderation flow", ok, "admin/schools, admin.controller.ts", "PENDING → approve/reject"],
  ].forEach((r) => { ensureSpace(); tableRow(r); });

  // PARENT
  title("3. PARENT FEATURES");
  tableRow(["Feature", "Status", "File(s)", "Notes"], true);
  [
    ["Dashboard: profile", ok, "parent/profile/page.tsx", "SSR + BFF PATCH"],
    ["Dashboard: favourites", partial, "parent/favourites", "BFF DELETE only; read direct"],
    ["Dashboard: inquiries", partial, "parent/inquiries", "Uses /api/inquiries/my"],
    ["FavouriteButton API", partial, "FavouriteButton.tsx", "Legacy /api/favourites for toggle"],
    ["InquiryModal", ok, "InquiryModal.tsx", "POST /api/inquiries"],
    ["School comparison", missing, "—", "Not implemented"],
  ].forEach((r) => { ensureSpace(); tableRow(r); });

  // ADMIN
  doc.addPage();
  title("4. ADMIN FEATURES");
  tableRow(["Feature", "Status", "File(s)", "Notes"], true);
  [
    ["Dashboard stats", ok, "admin/page.tsx", "6 stat cards"],
    ["School moderation", ok, "admin/schools/page.tsx", "Approve/reject via BFF"],
    ["Add school wizard", partial, "admin/add-school/page.tsx", "checkOwnerEmail Prisma bug"],
    ["User management", ok, "admin/users/page.tsx", "Role + status"],
    ["Inquiry monitoring", ok, "admin/inquiries/page.tsx", "Read-only"],
    ["Featured listings admin", missing, "FeaturedSchools.tsx", "Newest 6 only"],
    ["SEO management panel", missing, "lib/seo.ts", "Code-driven only"],
  ].forEach((r) => { ensureSpace(); tableRow(r); });

  // BFF
  title("5. API & BFF ROUTES (16 files)");
  para("All routes exist. Partial: /api/parent/profile (PATCH only), /api/parent/favourites (DELETE only).");
  para("Admin SSR bypasses BFF for: GET /api/admin/stats, /users, /inquiries.");
  bullet("POST /api/upload — Cloudinary, auth + rate limit");
  bullet("GET /api/admin/schools — duplicate check (GET only, no POST)");
  bullet("GET /api/admin/check-owner — owner validation");
  bullet("POST /api/admin/add-school — reads httpOnly cookie");

  // BACKEND
  title("6. BACKEND API");
  bullet("6 route modules — all real Prisma implementations");
  bullet("GET /api/schools — filters, pagination, cursor mode, cached");
  bullet("POST /api/admin/add-school — creates APPROVED directly");
  bullet("Inquiry CRUD — create/list/update OK; no delete/get-by-id");
  bullet("Legacy /api/favourites — functional with Deprecation header");

  // DB
  title("7. DATABASE & PRISMA");
  bullet("Schema aligned with controllers for core models");
  bullet("OTP fields present and used; resetToken legacy/unused");
  bullet("NextAuth tables (Account, Session, VerificationToken) unused");
  bullet("Facility models — read only, no write API");
  bullet("Missing migration_lock.toml");
  bullet("BUG: checkOwnerEmail uses user.school; schema has ownedSchools");

  // INTEGRATIONS
  doc.addPage();
  title("8. THIRD-PARTY INTEGRATIONS");
  tableRow(["Integration", "Status", "Notes"], true);
  [
    ["Resend", missing, "Implemented but never imported"],
    ["Brevo", missing, "Commented stub"],
    ["Fast2SMS", ok, "Dev console fallback"],
    ["Cloudinary (frontend)", ok, "/api/upload working"],
    ["Cloudinary (backend)", cleanup, "Stub; no routes use it"],
    ["Google OAuth", ok, "Parent only"],
    ["Razorpay, OpenAI, Maps, PostHog, Sentry", missing, "Not started"],
  ].forEach((r) => { ensureSpace(); tableRow(r); });

  // CLEANUP
  title("9. CLEANUP & DEAD CODE");
  ["nodemailer (backend)", "multer/upload.ts (unmounted)", "bcryptjs (frontend unused)",
   "mailer.ts (orphaned)", "CredentialsLoginForm.tsx", "ApproveRejectButtons.tsx",
   "reset-password/page.tsx (broken)", "Only TODO: mailer.ts:86"].forEach(bullet);

  // SEO
  title("10. SEO & PERFORMANCE");
  bullet("sitemap.ts + robots.ts — OK");
  bullet("JSON-LD on home + school detail");
  bullet("ISR: listing 60s, detail 3600s; no revalidateTag on moderation");
  bullet("Suspense/skeletons on key pages; 3 loading.tsx routes");

  // ENV
  title("11. ENVIRONMENT & DEPLOYMENT");
  bullet("frontend/.env.example + backend/.env.example — complete");
  bullet("render.yaml — missing Resend/Fast2SMS in blueprint");
  bullet("vercel.json — OK (bom1, security headers)");
  bullet("validateStartupEnv — requires Cloudinary on backend (unused); Resend warn-only");

  // PRIORITY
  doc.addPage();
  title("PRIORITY TODO LIST");
  section("P0 — Blocking");
  [
    "Fix school admin backend token bridge (JWE vs JWT)",
    "Wire forgot-password OTP email (Brevo or Resend)",
    "Fix checkOwnerEmail Prisma relation (ownedSchools)",
  ].forEach(bullet);
  section("P1 — Easy wins");
  [
    "Call POST /api/auth/logout on frontend logout",
    "Migrate FavouriteButton to BFF /api/parent/favourites",
    "Remove/fix legacy /reset-password page",
    "School registration auto sign-in",
    "revalidateTag on approve/reject",
    "Backend validation on addSchoolDirect",
  ].forEach(bullet);
  section("P2 — Nice to have");
  [
    "Dynamic city/state dropdown", "Phone OTP UI", "School comparison",
    "Featured listings admin", "SEO admin panel", "Custom sections builder",
    "Facility management API", "Admin inquiry status updates", "Webhook ISR",
  ].forEach(bullet);

  title("QUESTIONS FOR OWNER");
  [
    "School admin token strategy: cookie vs persist JWT vs fix mintBackendJwt?",
    "OTP email provider: Brevo or Resend?",
    "Phone OTP: build UI or remove endpoints?",
    "Featured schools: manual curation or newest 6?",
    "Remove legacy /api/favourites after migration?",
    "Facilities: build picker or drop from UI?",
    "School comparison: build or remove marketing copy?",
    "Remove Cloudinary from backend validateStartupEnv?",
    "User disable: sentinel phone vs isActive column?",
    "ISR: accept 1-hour cache or webhook revalidation?",
  ].forEach(bullet);

  section("Overall Summary");
  para(
    "Public discovery, parent flows, and admin panel are largely built. Largest risks: school admin JWT bridge (likely broken SSR/BFF), non-functional password reset email, and checkOwnerEmail Prisma bug. Comparison, dynamic filters, custom sections, and featured/SEO admin are planned but not implemented."
  );

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
  console.log("PDF written to:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
