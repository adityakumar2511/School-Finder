import { Router } from "express";
import {
  createInquiry,
  getMyInquiries,
  getSchoolInquiries,
  updateInquiryStatus,
} from "../controllers/inquiry.controller";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roleCheck";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", auth, requireRole("PARENT"), asyncHandler(createInquiry));

router.get("/my", auth, requireRole("PARENT"), asyncHandler(getMyInquiries));

router.get(
  "/school/:schoolId",
  auth,
  requireRole("SCHOOL_ADMIN", "ADMIN"),
  asyncHandler(getSchoolInquiries)
);

router.patch(
  "/:id/status",
  auth,
  requireRole("SCHOOL_ADMIN", "ADMIN"),
  asyncHandler(updateInquiryStatus)
);

export default router;
