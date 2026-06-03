import { Router } from "express";

import {

  registerParent,

  registerSchool,

  login,

  forgotPassword,

  verifyResetOtp,

  sendOtp,

  verifyOtp,

  resetPassword,

  logout,

  getMe,

  updateMe,

  syncGoogleUser,

} from "../controllers/auth.controller";

import { auth } from "../middleware/auth";

import { validate } from "../middleware/validate";

import {

  loginSchema,

  registerParentSchema,

  registerSchoolSchema,

  forgotPasswordSchema,

  verifyResetOtpSchema,

  sendOtpSchema,

  verifyOtpSchema,

  resetPasswordSchema,

} from "../validators/auth.validator";

import { asyncHandler } from "../utils/asyncHandler";
import {
  authRateLimiter,
  forgotPasswordRateLimiter,
  otpRateLimiter,
  resetPasswordRateLimiter,
} from "../middleware/security";
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
  forgotPasswordRateLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);

router.post(
  "/verify-reset-otp",
  resetPasswordRateLimiter,
  validate(verifyResetOtpSchema),
  asyncHandler(verifyResetOtp)
);

router.post(
  "/send-otp",
  otpRateLimiter,
  validate(sendOtpSchema),
  asyncHandler(sendOtp)
);

router.post(
  "/verify-otp",
  authRateLimiter,
  validate(verifyOtpSchema),
  asyncHandler(verifyOtp)
);

router.post(
  "/reset-password",
  resetPasswordRateLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPassword)
);

router.post("/logout", auth, asyncHandler(logout));

router.get("/me", auth, asyncHandler(getMe));

router.patch("/me", auth, asyncHandler(updateMe));

router.post("/google-sync", authRateLimiter, asyncHandler(syncGoogleUser));



export default router;

