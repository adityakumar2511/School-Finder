import { Router } from "express";

import {

  registerParent,

  registerSchool,

  login,

  forgotPassword,

  resetPassword,

  getMe,

} from "../controllers/auth.controller";

import { auth } from "../middleware/auth";

import { validate } from "../middleware/validate";

import {

  loginSchema,

  registerParentSchema,

  registerSchoolSchema,

  forgotPasswordSchema,

  resetPasswordSchema,

} from "../validators/auth.validator";

import { asyncHandler } from "../utils/asyncHandler";
import { authRateLimiter } from "../middleware/security";
import { bruteForceGuard } from "../middleware/bruteForce";

const router = Router();

router.post(
  "/register-parent",
  authRateLimiter,
  bruteForceGuard,
  validate(registerParentSchema),
  asyncHandler(registerParent)
);

router.post(
  "/register-school",
  authRateLimiter,
  bruteForceGuard,
  validate(registerSchoolSchema),
  asyncHandler(registerSchool)
);

router.post(
  "/login",
  authRateLimiter,
  bruteForceGuard,
  validate(loginSchema),
  asyncHandler(login)
);

router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);

router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPassword)
);

router.get("/me", auth, asyncHandler(getMe));



export default router;

