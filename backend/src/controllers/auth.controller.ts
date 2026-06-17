import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { AuthRequest, signAccessToken } from "../middleware/auth";
import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../lib/tokenBlacklist";
import { AppError, Errors } from "../utils/AppError";
import {
  assertLoginAllowed,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "../middleware/bruteForce";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterParentInput,
  RegisterSchoolInput,
  ResetPasswordInput,
  SendOtpInput,
  VerifyOtpInput,
  VerifyResetOtpInput,
} from "../validators/auth.validator";
import { isAccountDisabled } from "../lib/account-status";
import {
  generateOtp,
  sendOtpViaSms,
  verifyOtpCode,
} from "../lib/otp";
import { sendOtpEmail } from "../lib/mailer";
import { invalidateSchoolCache } from "../lib/cache";

type SchoolDelegate = Pick<typeof prisma, "school">;

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const generateUniqueSlug = async (
  schoolName: string,
  db: SchoolDelegate = prisma
): Promise<string> => {
  const base = slugify(schoolName);
  if (!base) {
    throw Errors.BadRequest("School name is required");
  }

  const baseTaken = await db.school.findUnique({ where: { slug: base } });
  if (!baseTaken) return base;

  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}-${suffix}`;
    const taken = await db.school.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
  }

  throw new AppError("Failed to generate school identifier", 500, "INTERNAL_ERROR");
};

// POST /api/auth/register-parent
export const registerParent = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body as RegisterParentInput;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw Errors.Conflict("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_ROUNDS || "12")
  );

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone ?? null,
      password: hashedPassword,
      role: "PARENT",
    },
  });

  const token = signAccessToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  res.status(201).json({
    message: "Account created successfully",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  });
};

// POST /api/auth/register-school
// POST /api/auth/register-school
// POST /api/auth/register-school
export const registerSchool = async (req: Request, res: Response) => {
  const body = req.body as RegisterSchoolInput;
  const { name, ownerEmail, ownerPassword, phone } = body;

  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (existingUser) {
    if (existingUser.role === "SCHOOL_ADMIN") {
      throw Errors.Conflict(
        "This email is already registered as a school admin. Please sign in instead."
      );
    }
    throw Errors.Conflict(
      "This email is already registered. Please use a different email."
    );
  }

  const hashedPassword = await bcrypt.hash(
    ownerPassword,
    parseInt(process.env.BCRYPT_ROUNDS || "12")
  );

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: body.ownerName || ownerEmail.split("@")[0],
        email: ownerEmail,
        password: hashedPassword,
        role: "SCHOOL_ADMIN",
        phone: phone,
      },
    });

    const slug = await generateUniqueSlug(name, tx);

    const school = await tx.school.create({
      data: {
        name,
        slug,
        phone,
        // Optional fields from body, fallback to DB defaults
        description: body.description ?? null,
        address: body.address ?? "",        // empty string — filled later
        city: body.city ?? "",
        state: body.state ?? "",
        pincode: body.pincode ?? null,
        board: body.board ?? "OTHER",       // default enum value
        schoolType: body.schoolType ?? "CO_ED",
        medium: body.medium ?? "ENGLISH",
        classesFrom: body.classesFrom ?? 1,
        classesTo: body.classesTo ?? 12,
        email: body.email ?? null,
        website: body.website ?? null,
        logoUrl: body.logoUrl ?? null,
        admissionFee: body.admissionFee ?? null,
        tuitionFeeMonthly: body.tuitionFeeMonthly ?? null,
        totalAnnualFee: body.totalAnnualFee ?? null,
        transportFee: body.transportFee ?? null,
        hostelFee: body.hostelFee ?? null,
        status: "PENDING",
        ownerId: user.id,
      },
    });

    return { user, school };
  });

  invalidateSchoolCache();

  const token = signAccessToken({
    id: result.user.id,
    role: result.user.role,
    email: result.user.email,
  });

  res.status(201).json({
    message: "Registration successful. Your school will be live after admin approval.",
    token,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
    school: {
      id: result.school.id,
      name: result.school.name,
      slug: result.school.slug,
      status: result.school.status,
    },
  });
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password, expectedRole } = req.body as LoginInput;
 
  assertLoginAllowed(req, email);
 
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phone: true,
      password: true,
      adminAccessLevel: true, // Phase E
    },
  });
 
  if (!user || !user.password) {
    recordFailedLogin(req, email);
    throw Errors.Unauthorized("Invalid email or password");
  }
 
  if (user.phone === "__DISABLED__") {
    recordFailedLogin(req, email);
    throw Errors.AccountDisabled();
  }
 
  const isValid = await bcrypt.compare(password, user.password);
 
  if (!isValid) {
    recordFailedLogin(req, email);
    throw Errors.Unauthorized("Invalid email or password");
  }
 
  if (expectedRole === "PARENT" && user.role !== "PARENT") {
    recordFailedLogin(req, email);
    throw Errors.RoleConflict("Unauthorized account type");
  }
 
  if (expectedRole === "ADMIN" && user.role !== "ADMIN") {
    recordFailedLogin(req, email);
    throw Errors.RoleConflict("Unauthorized account type");
  }
 
  if (expectedRole === "SCHOOL_ADMIN" && user.role !== "SCHOOL_ADMIN") {
    recordFailedLogin(req, email);
    throw Errors.RoleConflict("Unauthorized account type");
  }
 
  recordSuccessfulLogin(req, email);
 
  // Phase E: include adminAccessLevel in JWT only for ADMIN role
  const token = signAccessToken({
    id: user.id,
    role: user.role,
    email: user.email,
    adminAccessLevel: user.role === "ADMIN" ? user.adminAccessLevel : undefined,
  });
 
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      // Phase E: expose to frontend so session can surface it
      adminAccessLevel: user.role === "ADMIN" ? user.adminAccessLevel : undefined,
    },
  });
};

const getBcryptRounds = (): number =>
  parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account exists, an OTP has been sent.";

const INVALID_RESET_OTP_MESSAGE = "Invalid or expired OTP";

// OTP expiry: 5 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000;

// Resend cooldown: 2 minutes
// User must wait at least this long before requesting a new OTP
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

const clearOtpAndResetFields = {
  otpCode: null,
  otpExpiry: null,
  otpVerified: false,
  resetToken: null,
  resetTokenExpiry: null,
} as const;

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email, expectedRole } = req.body as ForgotPasswordInput;

  const user = await prisma.user.findUnique({ where: { email } });

  // User not found — signal frontend so it can show proper error
  if (!user) {
    res.status(200).json({
      success: true,
      otpSent: false,
      code: "USER_NOT_FOUND",
      message: GENERIC_FORGOT_PASSWORD_MESSAGE,
    });
    return;
  }

  // Role mismatch — account exists but belongs to a different portal
  if (expectedRole && user.role !== expectedRole) {
    res.status(200).json({
      success: true,
      otpSent: false,
      code: "ROLE_MISMATCH",
      actualRole: user.role,
      message: GENERIC_FORGOT_PASSWORD_MESSAGE,
    });
    return;
  }

  // ── Resend cooldown check ──────────────────────────────────────────────────
  if (user.otpExpiry) {
    const timeRemainingMs = user.otpExpiry.getTime() - Date.now();
    const elapsedMs = OTP_EXPIRY_MS - timeRemainingMs;

    if (elapsedMs < RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - elapsedMs) / 1000
      );
      res.status(429).json({
        success: false,
        code: "RESEND_TOO_SOON",
        retryAfter: retryAfterSeconds,
        message: `Please wait ${retryAfterSeconds} seconds before requesting a new OTP.`,
      });
      return;
    }
  }

  // ── Generate new OTP — overwrites and invalidates any previous OTP ─────────
  const { code, hashedCode } = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: hashedCode,
      otpExpiry: expiresAt,
      otpVerified: false,
    },
  });

  const emailResult = await sendOtpEmail(email, code, user.name ?? undefined);

  if (!emailResult.success) {
    console.error(`[ForgotPassword] sendOtpEmail returned failure for ${email}`);
  }

  res.status(200).json({
    success: true,
    otpSent: true,
    message: GENERIC_FORGOT_PASSWORD_MESSAGE,
  });
};

// POST /api/auth/verify-reset-otp
export const verifyResetOtp = async (req: Request, res: Response) => {
  const { email, otp, expectedRole } = req.body as VerifyResetOtpInput;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || (expectedRole && user.role !== expectedRole)) {
    throw Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
  }

  if (!user.otpCode || !user.otpExpiry) {
    throw Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
  }

  const isValid = verifyOtpCode(otp, user.otpCode, user.otpExpiry);

  if (!isValid) {
    throw Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otpVerified: true },
  });

  res.status(200).json({
    success: true,
    message: "OTP verified",
  });
};

const OTP_SENT_MESSAGE =
  "If this number is registered, an OTP has been sent.";

// POST /api/auth/send-otp
export const sendOtp = async (req: Request, res: Response) => {
  const { phone } = req.body as SendOtpInput;

  const user = await prisma.user.findFirst({ where: { phone } });

  if (!user) {
    res.json({
      success: true,
      message: OTP_SENT_MESSAGE,
    });
    return;
  }

  if (isAccountDisabled(user.phone)) {
    throw Errors.AccountDisabled();
  }

  const { code, hashedCode, expiresAt } = generateOtp();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: hashedCode,
      otpExpiry: expiresAt,
      otpVerified: false,
    },
  });

  const smsResult = await sendOtpViaSms(phone, code);

  if (!smsResult.success && process.env.NODE_ENV === "production") {
    console.error(`[OTP] Failed to send to ${phone}: ${smsResult.error}`);
  }

  res.json({
    success: true,
    message: OTP_SENT_MESSAGE,
  });
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body as VerifyOtpInput;

  const user = await prisma.user.findFirst({ where: { phone } });

  if (!user || !user.otpCode || !user.otpExpiry) {
    throw Errors.BadRequest("Invalid or expired OTP");
  }

  const isValid = verifyOtpCode(otp, user.otpCode, user.otpExpiry);

  if (!isValid) {
    throw Errors.BadRequest("Invalid or expired OTP");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: null,
      otpExpiry: null,
      otpVerified: true,
    },
  });

  const token = signAccessToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  res.json({
    success: true,
    data: { token, role: user.role },
    message: "OTP verified successfully",
  });
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword, expectedRole } = req.body as ResetPasswordInput;

  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    !user.otpVerified ||
    !user.otpExpiry ||
    user.otpExpiry.getTime() <= Date.now()
  ) {
    throw Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
  }

  if (expectedRole && user.role !== expectedRole) {
    throw Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
  }

  const hashedPassword = await bcrypt.hash(newPassword, getBcryptRounds());

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      ...clearOtpAndResetFields,
    },
  });

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};

// POST /api/auth/logout
export const logout = async (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (token) {
    const decoded = jwt.decode(token) as {
      jti?: string;
      exp?: number;
    } | null;

    if (decoded?.jti && decoded?.exp) {
      tokenBlacklist.add(decoded.jti, decoded.exp * 1000);
      console.info(`[Logout] token jti=${decoded.jti} blacklisted`);
    }
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// GET /api/auth/me
// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phone: true,
      createdAt: true,
      adminAccessLevel: true, // Phase E
    },
  });

  if (!user) {
    throw Errors.NotFound("User");
  }

  res.json({
    ...user,
    adminAccessLevel: user.role === "ADMIN" ? user.adminAccessLevel : undefined,
  });
};

// PATCH /api/auth/me
export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name, phone, image } = req.body as {
    name?: string;
    phone?: string | null;
    image?: string | null;
  };

  if (name !== undefined && typeof name === "string" && name.trim().length < 1) {
    throw Errors.BadRequest("Name is required");
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(image !== undefined ? { image } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phone: true,
      createdAt: true,
    },
  });

  res.json({ success: true, data: user });
};

// POST /api/auth/google-sync
export const syncGoogleUser = async (req: Request, res: Response) => {
  const { email, name, image } = req.body as {
    email?: string;
    name?: string | null;
    image?: string | null;
  };

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    throw Errors.BadRequest("Email is required");
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing && existing.role !== "PARENT") {
    throw Errors.RoleConflict("Unauthorized account type");
  }

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          ...(name ? { name } : {}),
          ...(image ? { image } : {}),
          emailVerified: existing.emailVerified ?? new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          phone: true,
          createdAt: true,
        },
      })
    : await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name ?? null,
          image: image ?? null,
          role: "PARENT",
          emailVerified: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          phone: true,
          createdAt: true,
        },
      });

  const token = signAccessToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  res.json({ user, token });
};