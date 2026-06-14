import { Router } from "express";
// import me add karo
import {
  getStats,
  getAdminSchools,
  getAdminStates,    // ← not getAdminSchoolStates
  getAdminCities,   // ← not getAdminSchoolCities
  approveSchool,
  rejectSchool,
  approveSchoolById,
  rejectSchoolById,
  addSchoolDirect,
  getAdminUsers,
  getAdminInquiries,
  updateUserRole,
  updateUserStatus,
  checkOwnerEmail,
  getAdminSchoolById,
} from "../controllers/admin.controller";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roleCheck";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(auth, requireRole("ADMIN"));

router.get("/stats", asyncHandler(getStats));
router.get("/schools", asyncHandler(getAdminSchools));
router.get("/schools/states", asyncHandler(getAdminStates));
router.get("/schools/cities", asyncHandler(getAdminCities));
router.get("/schools/:id", asyncHandler(getAdminSchoolById));        // ← after states/cities
router.get("/users", asyncHandler(getAdminUsers));
router.get("/inquiries", asyncHandler(getAdminInquiries));
router.get("/check-owner", asyncHandler(checkOwnerEmail));

router.patch("/schools/:id/approve", asyncHandler(approveSchoolById));
router.patch("/schools/:id/reject", asyncHandler(rejectSchoolById));

router.post("/approve", asyncHandler(approveSchool));
router.post("/reject", asyncHandler(rejectSchool));
router.post("/add-school", asyncHandler(addSchoolDirect));

router.patch("/users/:id/role", asyncHandler(updateUserRole));
router.patch("/users/:id/status", asyncHandler(updateUserStatus));

export default router;