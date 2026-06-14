"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncGoogleUser = exports.updateMe = exports.getMe = exports.logout = exports.resetPassword = exports.verifyOtp = exports.sendOtp = exports.verifyResetOtp = exports.forgotPassword = exports.login = exports.registerSchool = exports.registerParent = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenBlacklist_1 = require("../lib/tokenBlacklist");
const AppError_1 = require("../utils/AppError");
const bruteForce_1 = require("../middleware/bruteForce");
const account_status_1 = require("../lib/account-status");
const otp_1 = require("../lib/otp");
const mailer_1 = require("../lib/mailer");
const cache_1 = require("../lib/cache");
const slugify = (value) => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const generateUniqueSlug = async (schoolName, db = prisma_1.default) => {
    const base = slugify(schoolName);
    if (!base) {
        throw AppError_1.Errors.BadRequest("School name is required");
    }
    const baseTaken = await db.school.findUnique({ where: { slug: base } });
    if (!baseTaken)
        return base;
    for (let attempt = 0; attempt < 20; attempt++) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const candidate = `${base}-${suffix}`;
        const taken = await db.school.findUnique({ where: { slug: candidate } });
        if (!taken)
            return candidate;
    }
    throw new AppError_1.AppError("Failed to generate school identifier", 500, "INTERNAL_ERROR");
};
// POST /api/auth/register-parent
const registerParent = async (req, res) => {
    const { name, email, phone, password } = req.body;
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw AppError_1.Errors.Conflict("Email already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, parseInt(process.env.BCRYPT_ROUNDS || "12"));
    const user = await prisma_1.default.user.create({
        data: {
            name,
            email,
            phone: phone ?? null,
            password: hashedPassword,
            role: "PARENT",
        },
    });
    const token = (0, auth_1.signAccessToken)({
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
exports.registerParent = registerParent;
// POST /api/auth/register-school
// POST /api/auth/register-school
const registerSchool = async (req, res) => {
    const body = req.body;
    const { name, ownerEmail, ownerPassword, phone } = body;
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email: ownerEmail },
    });
    if (existingUser) {
        if (existingUser.role === "SCHOOL_ADMIN") {
            throw AppError_1.Errors.Conflict("This email is already registered as a school admin. Please sign in instead.");
        }
        throw AppError_1.Errors.Conflict("This email is already registered. Please use a different email.");
    }
    const hashedPassword = await bcryptjs_1.default.hash(ownerPassword, parseInt(process.env.BCRYPT_ROUNDS || "12"));
    const result = await prisma_1.default.$transaction(async (tx) => {
        const existingSchool = await tx.school.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
        });
        if (existingSchool) {
            throw AppError_1.Errors.Conflict("A school with this name already exists. Please check if your school is already listed.");
        }
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
                address: body.address ?? "", // empty string — filled later
                city: body.city ?? "",
                state: body.state ?? "",
                pincode: body.pincode ?? null,
                board: body.board ?? "OTHER", // default enum value
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
    (0, cache_1.invalidateSchoolCache)();
    const token = (0, auth_1.signAccessToken)({
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
exports.registerSchool = registerSchool;
// POST /api/auth/login
const login = async (req, res) => {
    const { email, password, expectedRole } = req.body;
    (0, bruteForce_1.assertLoginAllowed)(req, email);
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw AppError_1.Errors.Unauthorized("Invalid email or password");
    }
    if (user.phone === "__DISABLED__") {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw AppError_1.Errors.AccountDisabled();
    }
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid) {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw AppError_1.Errors.Unauthorized("Invalid email or password");
    }
    if (expectedRole === "PARENT" && user.role !== "PARENT") {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw AppError_1.Errors.RoleConflict("Unauthorized account type");
    }
    if (expectedRole === "ADMIN" && user.role !== "ADMIN") {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw AppError_1.Errors.RoleConflict("Unauthorized account type");
    }
    if (expectedRole === "SCHOOL_ADMIN" && user.role !== "SCHOOL_ADMIN") {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw AppError_1.Errors.RoleConflict("Unauthorized account type");
    }
    (0, bruteForce_1.recordSuccessfulLogin)(req, email);
    const token = (0, auth_1.signAccessToken)({
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
exports.login = login;
const getBcryptRounds = () => parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
const GENERIC_FORGOT_PASSWORD_MESSAGE = "If an account exists, an OTP has been sent.";
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
};
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email, expectedRole } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
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
            const retryAfterSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsedMs) / 1000);
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
    const { code, hashedCode } = (0, otp_1.generateOtp)();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            otpCode: hashedCode,
            otpExpiry: expiresAt,
            otpVerified: false,
        },
    });
    const emailResult = await (0, mailer_1.sendOtpEmail)(email, code, user.name ?? undefined);
    if (!emailResult.success) {
        console.error(`[ForgotPassword] sendOtpEmail returned failure for ${email}`);
    }
    res.status(200).json({
        success: true,
        otpSent: true,
        message: GENERIC_FORGOT_PASSWORD_MESSAGE,
    });
};
exports.forgotPassword = forgotPassword;
// POST /api/auth/verify-reset-otp
const verifyResetOtp = async (req, res) => {
    const { email, otp, expectedRole } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || (expectedRole && user.role !== expectedRole)) {
        throw AppError_1.Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
    }
    if (!user.otpCode || !user.otpExpiry) {
        throw AppError_1.Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
    }
    const isValid = (0, otp_1.verifyOtpCode)(otp, user.otpCode, user.otpExpiry);
    if (!isValid) {
        throw AppError_1.Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { otpVerified: true },
    });
    res.status(200).json({
        success: true,
        message: "OTP verified",
    });
};
exports.verifyResetOtp = verifyResetOtp;
const OTP_SENT_MESSAGE = "If this number is registered, an OTP has been sent.";
// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
    const { phone } = req.body;
    const user = await prisma_1.default.user.findFirst({ where: { phone } });
    if (!user) {
        res.json({
            success: true,
            message: OTP_SENT_MESSAGE,
        });
        return;
    }
    if ((0, account_status_1.isAccountDisabled)(user.phone)) {
        throw AppError_1.Errors.AccountDisabled();
    }
    const { code, hashedCode, expiresAt } = (0, otp_1.generateOtp)();
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            otpCode: hashedCode,
            otpExpiry: expiresAt,
            otpVerified: false,
        },
    });
    const smsResult = await (0, otp_1.sendOtpViaSms)(phone, code);
    if (!smsResult.success && process.env.NODE_ENV === "production") {
        console.error(`[OTP] Failed to send to ${phone}: ${smsResult.error}`);
    }
    res.json({
        success: true,
        message: OTP_SENT_MESSAGE,
    });
};
exports.sendOtp = sendOtp;
// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
    const user = await prisma_1.default.user.findFirst({ where: { phone } });
    if (!user || !user.otpCode || !user.otpExpiry) {
        throw AppError_1.Errors.BadRequest("Invalid or expired OTP");
    }
    const isValid = (0, otp_1.verifyOtpCode)(otp, user.otpCode, user.otpExpiry);
    if (!isValid) {
        throw AppError_1.Errors.BadRequest("Invalid or expired OTP");
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            otpCode: null,
            otpExpiry: null,
            otpVerified: true,
        },
    });
    const token = (0, auth_1.signAccessToken)({
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
exports.verifyOtp = verifyOtp;
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const { email, newPassword, expectedRole } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user ||
        !user.otpVerified ||
        !user.otpExpiry ||
        user.otpExpiry.getTime() <= Date.now()) {
        throw AppError_1.Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
    }
    if (expectedRole && user.role !== expectedRole) {
        throw AppError_1.Errors.BadRequest(INVALID_RESET_OTP_MESSAGE);
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, getBcryptRounds());
    await prisma_1.default.user.update({
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
exports.resetPassword = resetPassword;
// POST /api/auth/logout
const logout = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (token) {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (decoded?.jti && decoded?.exp) {
            tokenBlacklist_1.tokenBlacklist.add(decoded.jti, decoded.exp * 1000);
            console.info(`[Logout] token jti=${decoded.jti} blacklisted`);
        }
    }
    res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
};
exports.logout = logout;
// GET /api/auth/me
const getMe = async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: req.user.id },
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
        throw AppError_1.Errors.NotFound("User");
    }
    res.json(user);
};
exports.getMe = getMe;
// PATCH /api/auth/me
const updateMe = async (req, res) => {
    const { name, phone, image } = req.body;
    if (name !== undefined && typeof name === "string" && name.trim().length < 1) {
        throw AppError_1.Errors.BadRequest("Name is required");
    }
    const user = await prisma_1.default.user.update({
        where: { id: req.user.id },
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
exports.updateMe = updateMe;
// POST /api/auth/google-sync
const syncGoogleUser = async (req, res) => {
    const { email, name, image } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
        throw AppError_1.Errors.BadRequest("Email is required");
    }
    const existing = await prisma_1.default.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (existing && existing.role !== "PARENT") {
        throw AppError_1.Errors.RoleConflict("Unauthorized account type");
    }
    const user = existing
        ? await prisma_1.default.user.update({
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
        : await prisma_1.default.user.create({
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
    const token = (0, auth_1.signAccessToken)({
        id: user.id,
        role: user.role,
        email: user.email,
    });
    res.json({ user, token });
};
exports.syncGoogleUser = syncGoogleUser;
