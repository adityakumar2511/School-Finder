import { Router } from "express";
import {
  getStats,
  getAdminSchools,
  approveSchool,
  rejectSchool,
  approveSchoolById,
  rejectSchoolById,
  addSchoolDirect,
  getAdminUsers,
  getAdminInquiries,
  updateUserRole,
  updateUserStatus,
} from "../controllers/admin.controller";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roleCheck";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(auth, requireRole("ADMIN"));

router.get("/stats", asyncHandler(getStats));
router.get("/schools", asyncHandler(getAdminSchools));
router.get("/users", asyncHandler(getAdminUsers));
router.get("/inquiries", asyncHandler(getAdminInquiries));

router.patch("/schools/:id/approve", asyncHandler(approveSchoolById));
router.patch("/schools/:id/reject", asyncHandler(rejectSchoolById));

router.post("/approve", asyncHandler(approveSchool));
router.post("/reject", asyncHandler(rejectSchool));
router.post("/add-school", asyncHandler(addSchoolDirect));

router.patch("/users/:id/role", asyncHandler(updateUserRole));
router.patch("/users/:id/status", asyncHandler(updateUserStatus));

export default router;
