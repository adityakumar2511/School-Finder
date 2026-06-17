// import { Router } from "express";
// import {
//   getStats,
//   getAdminSchools,
//   getAdminStates,
//   getAdminCities,
//   approveSchool,
//   rejectSchool,
//   approveSchoolById,
//   rejectSchoolById,
//   addSchoolDirect,
//   addParentDirect,          // ← add karo
//   getAdminUsers,
//   getAdminInquiries,
//   updateUserRole,
//   updateUserStatus,
//   checkOwnerEmail,
//   getAdminSchoolById,
// } from "../controllers/admin.controller";
// import { auth } from "../middleware/auth";
// import { requireRole } from "../middleware/roleCheck";
// import { validate } from "../middleware/validate";
// import { asyncHandler } from "../utils/asyncHandler";
// import { addParentSchema } from "../validators/auth.validator";  // ← add karo

// const router = Router();

// router.use(auth, requireRole("ADMIN"));

// router.get("/stats", asyncHandler(getStats));
// router.get("/schools", asyncHandler(getAdminSchools));
// router.get("/schools/states", asyncHandler(getAdminStates));
// router.get("/schools/cities", asyncHandler(getAdminCities));
// router.get("/schools/:id", asyncHandler(getAdminSchoolById));
// router.get("/users", asyncHandler(getAdminUsers));
// router.get("/inquiries", asyncHandler(getAdminInquiries));
// router.get("/check-owner", asyncHandler(checkOwnerEmail));

// router.patch("/schools/:id/approve", asyncHandler(approveSchoolById));
// router.patch("/schools/:id/reject", asyncHandler(rejectSchoolById));

// router.post("/approve", asyncHandler(approveSchool));
// router.post("/reject", asyncHandler(rejectSchool));
// router.post("/add-school", asyncHandler(addSchoolDirect));
// router.post("/add-parent", validate(addParentSchema), asyncHandler(addParentDirect));  // ← add karo

// router.patch("/users/:id/role", asyncHandler(updateUserRole));
// router.patch("/users/:id/status", asyncHandler(updateUserStatus));

// export default router;




import { Router } from "express";
import {
  getStats,
  getAdminSchools,
  getAdminStates,
  getAdminCities,
  approveSchool,
  rejectSchool,
  approveSchoolById,
  rejectSchoolById,
  addSchoolDirect,
  addParentDirect,
  addAdminDirect,
  getAdminUsers,
  getAdminInquiries,
  updateUserRole,
  updateUserStatus,
  checkOwnerEmail,
  getAdminSchoolById,
} from "../controllers/admin.controller";
import { auth } from "../middleware/auth";
import { requireRole, requireAdminLevel } from "../middleware/roleCheck";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { addParentSchema, addAdminSchema } from "../validators/auth.validator";

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(auth, requireRole("ADMIN"));

// ── READ_ONLY and above ────────────────────────────────────────────────────────
// These are safe read operations — all three tiers can access them.

router.get(
  "/stats",
  requireAdminLevel("READ_ONLY"),
  asyncHandler(getStats),
);

router.get(
  "/schools",
  requireAdminLevel("READ_ONLY"),
  asyncHandler(getAdminSchools),
);

router.get(
  "/schools/states",
  requireAdminLevel("READ_ONLY"),
  asyncHandler(getAdminStates),
);

router.get(
  "/schools/cities",
  requireAdminLevel("READ_ONLY"),
  asyncHandler(getAdminCities),
);

router.get(
  "/schools/:id",
  requireAdminLevel("READ_ONLY"),
  asyncHandler(getAdminSchoolById),
);

router.get(
  "/users",
  requireAdminLevel("READ_ONLY"),
  asyncHandler(getAdminUsers),
);

router.get(
  "/inquiries",
  requireAdminLevel("READ_ONLY"),
  asyncHandler(getAdminInquiries),
);

router.get(
  "/check-owner",
  requireAdminLevel("READ_ONLY"),
  asyncHandler(checkOwnerEmail),
);

// ── READ_WRITE and above ───────────────────────────────────────────────────────
// Mutations that don't involve deletion or privilege escalation.

router.patch(
  "/schools/:id/approve",
  requireAdminLevel("READ_WRITE"),
  asyncHandler(approveSchoolById),
);

router.patch(
  "/schools/:id/reject",
  requireAdminLevel("READ_WRITE"),
  asyncHandler(rejectSchoolById),
);

// Legacy approve/reject — kept for backward compat
router.post(
  "/approve",
  requireAdminLevel("READ_WRITE"),
  asyncHandler(approveSchool),
);

router.post(
  "/reject",
  requireAdminLevel("READ_WRITE"),
  asyncHandler(rejectSchool),
);

router.post(
  "/add-school",
  requireAdminLevel("READ_WRITE"),
  asyncHandler(addSchoolDirect),
);

router.post(
  "/add-parent",
  requireAdminLevel("READ_WRITE"),
  validate(addParentSchema),
  asyncHandler(addParentDirect),
);

// ── FULL_ACCESS only ───────────────────────────────────────────────────────────
// Destructive or privilege-escalating operations.

router.patch(
  "/users/:id/role",
  requireAdminLevel("FULL_ACCESS"),
  asyncHandler(updateUserRole),
);

router.patch(
  "/users/:id/status",
  requireAdminLevel("FULL_ACCESS"),
  asyncHandler(updateUserStatus),
);

router.post(
  "/add-admin",
  requireAdminLevel("FULL_ACCESS"),
  validate(addAdminSchema),
  asyncHandler(addAdminDirect),
);

export default router;