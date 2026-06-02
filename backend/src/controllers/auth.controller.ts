import crypto from "crypto";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { sendPasswordResetEmail } from "../lib/mailer";
import { AuthRequest, blacklistToken, signAccessToken } from "../middleware/auth";
import { AppError } from "../utils/AppError";
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
  VerifyOtpInput,
} from "../validators/auth.validator";

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
    throw new AppError(400, "School name is required");
  }

  const baseTaken = await db.school.findUnique({ where: { slug: base } });
  if (!baseTaken) return base;

  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}-${suffix}`;
    const taken = await db.school.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
  }

  throw new AppError(500, "Failed to generate school identifier");
};

// POST /api/auth/register-parent
export const registerParent = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body as RegisterParentInput;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError(400, "Email already exists");
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
export const registerSchool = async (req: Request, res: Response) => {
  const body = req.body as RegisterSchoolInput;
  const {
    name,
    ownerEmail,
    ownerPassword,
    ownerName,
    city,
    state,
    address,
    pincode,
    board,
    schoolType,
    medium,
    classesFrom,
    classesTo,
    phone,
    email,
    website,
    description,
    logoUrl,
    admissionFee,
    tuitionFeeMonthly,
    totalAnnualFee,
  } = body;

  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (existingUser) {
    throw new AppError(400, "This email is already registered");
  }

  const hashedPassword = await bcrypt.hash(
    ownerPassword,
    parseInt(process.env.BCRYPT_ROUNDS || "12")
  );

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: ownerName || ownerEmail.split("@")[0],
        email: ownerEmail,
        password: hashedPassword,
        role: "SCHOOL_ADMIN",
      },
    });

    const slug = await generateUniqueSlug(name, tx);

    const school = await tx.school.create({
      data: {
        name,
        slug,
        description: description ?? null,
        address,
        city,
        state,
        pincode: pincode ?? null,
        board,
        schoolType,
        medium,
        classesFrom,
        classesTo,
        phone,
        email: email ?? null,
        website: website ?? null,
        logoUrl: logoUrl ?? null,
        admissionFee: admissionFee ?? null,
        tuitionFeeMonthly: tuitionFeeMonthly ?? null,
        totalAnnualFee: totalAnnualFee ?? null,
        status: "PENDING",
        ownerId: user.id,
      },
    });

    return { user, school };
  });

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

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    recordFailedLogin(req, email);
    throw new AppError(401, "Invalid email or password");
  }

  if (user.phone === "__DISABLED__") {
    recordFailedLogin(req, email);
    throw new AppError(403, "This account has been disabled");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    recordFailedLogin(req, email);
    throw new AppError(401, "Invalid email or password");
  }

  if (expectedRole === "PARENT" && user.role !== "PARENT") {
    recordFailedLogin(req, email);
    throw new AppError(403, "Unauthorized account type");
  }

  if (expectedRole === "ADMIN" && user.role !== "ADMIN") {
    recordFailedLogin(req, email);
    throw new AppError(403, "Unauthorized account type");
  }

  if (expectedRole === "SCHOOL_ADMIN" && user.role !== "SCHOOL_ADMIN") {
    recordFailedLogin(req, email);
    throw new AppError(403, "Unauthorized account type");
  }

  recordSuccessfulLogin(req, email);

  const token = signAccessToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    },
  });
};

const getBcryptRounds = (): number =>
  parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

const hashResetToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const clearResetTokenFields = {
  resetToken: null,
  resetTokenExpiry: null,
} as const;

const clearOtpFields = {
  otpCode: null,
  otpExpiry: null,
  otpVerified: false,
} as const;

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(200).json({
      success: true,
      message: "If this email is registered, a reset link has been sent.",
    });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashResetToken(rawToken);
  const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry,
    },
  });

  const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail(user.email, resetLink, user.name ?? undefined);

  res.status(200).json({
    success: true,
    message: "If this email is registered, a reset link has been sent.",
  });
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body as VerifyOtpInput;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.otpCode) {
    throw new AppError(400, "Invalid or expired OTP.");
  }

  if (!user.otpExpiry || user.otpExpiry.getTime() <= Date.now()) {
    await prisma.user.update({
      where: { id: user.id },
      data: clearOtpFields,
    });
    throw new AppError(400, "OTP has expired.");
  }

  const isValid = await bcrypt.compare(otp, user.otpCode);

  if (!isValid) {
    throw new AppError(400, "Invalid OTP.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otpVerified: true },
  });

  res.status(200).json({
    success: true,
    message: "OTP verified.",
  });
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body as ResetPasswordInput;

  if (!token) {
    throw new AppError(400, "Invalid or expired reset link.");
  }

  const hashedToken = hashResetToken(token);

  const user = await prisma.user.findFirst({
    where: { resetToken: hashedToken },
  });

  if (!user || !user.resetToken) {
    throw new AppError(400, "Invalid or expired reset link.");
  }

  if (!user.resetTokenExpiry || user.resetTokenExpiry.getTime() <= Date.now()) {
    await prisma.user.update({
      where: { id: user.id },
      data: clearResetTokenFields,
    });
    throw new AppError(400, "Reset link has expired.");
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    throw new AppError(400, "Passwords do not match.");
  }

  if (newPassword.length < 8) {
    throw new AppError(400, "Password must be at least 8 characters.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, getBcryptRounds());

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      ...clearResetTokenFields,
    },
  });

  res.status(200).json({
    success: true,
    message: "Password reset successfully.",
  });
};

// POST /api/auth/logout
export const logout = async (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (token) {
    blacklistToken(token);
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

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
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  res.json(user);
};

// PATCH /api/auth/me
export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name, phone, image } = req.body as {
    name?: string;
    phone?: string | null;
    image?: string | null;
  };

  if (name !== undefined && typeof name === "string" && name.trim().length < 1) {
    throw new AppError(400, "Name is required");
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
    throw new AppError(400, "Email is required");
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing && existing.role !== "PARENT") {
    throw new AppError(403, "Unauthorized account type");
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
