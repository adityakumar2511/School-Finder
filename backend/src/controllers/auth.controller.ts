import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
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
} from "../validators/auth.validator";

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

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

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: jwtExpiresIn }
  );

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

  const token = jwt.sign(
    { id: result.user.id, role: result.user.role, email: result.user.email },
    process.env.JWT_SECRET!,
    { expiresIn: jwtExpiresIn }
  );

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

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: jwtExpiresIn }
  );

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

const getFrontendUrl = (): string =>
  (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");

const sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your SchoolFinder password",
    text: `You requested a password reset.
Click the link below to reset your password.
This link expires in 1 hour.
${resetLink}
If you did not request this, ignore this email.`,
  });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const plainToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(
      plainToken,
      parseInt(process.env.BCRYPT_ROUNDS || "12")
    );
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    const resetLink = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(plainToken)}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
    } catch {
      // Do not reveal whether the email exists or whether sending failed
    }
  }

  res.status(200).json({
    message: "If this email exists, a reset link has been sent.",
  });
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as ResetPasswordInput;

  const candidates = await prisma.user.findMany({
    where: {
      resetToken: { not: null },
      resetTokenExpiry: { gt: new Date() },
    },
    select: {
      id: true,
      resetToken: true,
    },
  });

  let matchedUserId: string | null = null;

  for (const candidate of candidates) {
    if (!candidate.resetToken) continue;
    const isMatch = await bcrypt.compare(token, candidate.resetToken);
    if (isMatch) {
      matchedUserId = candidate.id;
      break;
    }
  }

  if (!matchedUserId) {
    res.status(400).json({ message: "Invalid or expired reset token." });
    return;
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    parseInt(process.env.BCRYPT_ROUNDS || "12")
  );

  await prisma.user.update({
    where: { id: matchedUserId },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  res.json({ message: "Password reset successful." });
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
