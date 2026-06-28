import { Router } from "express";

import {
  getSchools,
  searchSchools,
  getCities,
  getNearbySchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  getMySchool,
  addSchoolImage,
  deleteSchoolImage,
} from "../controllers/schools.controller";

import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roleCheck";
import { validate } from "../middleware/validate";
import {
  generalRateLimiter,
  authenticatedRateLimiter,
} from "../middleware/security";

import {
  createSchoolBodySchema,
  updateSchoolBodySchema,
} from "../validators/school.validator";

import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// ── Public routes — generalRateLimiter (300/15min) ────────────────────────────

router.get("/", generalRateLimiter, asyncHandler(getSchools));

router.get("/search", generalRateLimiter, asyncHandler(searchSchools));

router.get("/cities", generalRateLimiter, asyncHandler(getCities));

// Important: keep /nearby before /:slug
router.get("/nearby", generalRateLimiter, asyncHandler(getNearbySchools));

// ── Authenticated routes — authenticatedRateLimiter (500/15min) ───────────────

router.post(
  "/my-school/images",
  auth,
  requireRole("SCHOOL_ADMIN"),
  authenticatedRateLimiter,
  asyncHandler(addSchoolImage),
);

router.delete(
  "/images/:id",
  auth,
  requireRole("SCHOOL_ADMIN"),
  authenticatedRateLimiter,
  asyncHandler(deleteSchoolImage),
);

router.get(
  "/my-school",
  auth,
  requireRole("SCHOOL_ADMIN"),
  authenticatedRateLimiter,
  asyncHandler(getMySchool),
);

// ── Public detail — generalRateLimiter ────────────────────────────────────────
// Must stay after /my-school and /nearby to avoid slug conflict

router.get("/:slug", generalRateLimiter, asyncHandler(getSchool));

// ── School mutations ──────────────────────────────────────────────────────────

router.post(
  "/",
  auth,
  requireRole("SCHOOL_ADMIN"),
  authenticatedRateLimiter,
  validate(createSchoolBodySchema),
  asyncHandler(createSchool),
);

router.patch(
  "/:id",
  auth,
  authenticatedRateLimiter,
  validate(updateSchoolBodySchema),
  asyncHandler(updateSchool),
);

router.delete(
  "/:id",
  auth,
  requireRole("ADMIN"),
  authenticatedRateLimiter,
  asyncHandler(deleteSchool),
);

export default router;