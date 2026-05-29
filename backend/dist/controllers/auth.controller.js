"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resetPassword = exports.forgotPassword = exports.login = exports.registerSchool = exports.registerParent = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
const bruteForce_1 = require("../middleware/bruteForce");
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "7d");
const slugify = (value) => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const generateUniqueSlug = async (schoolName, db = prisma_1.default) => {
    const base = slugify(schoolName);
    if (!base) {
        throw new AppError_1.AppError(400, "School name is required");
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
    throw new AppError_1.AppError(500, "Failed to generate school identifier");
};
// POST /api/auth/register-parent
const registerParent = async (req, res) => {
    const { name, email, phone, password } = req.body;
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError_1.AppError(400, "Email already exists");
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
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn });
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
const registerSchool = async (req, res) => {
    const body = req.body;
    const { name, ownerEmail, ownerPassword, ownerName, city, state, address, pincode, board, schoolType, medium, classesFrom, classesTo, phone, email, website, description, logoUrl, admissionFee, tuitionFeeMonthly, totalAnnualFee, } = body;
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email: ownerEmail },
    });
    if (existingUser) {
        throw new AppError_1.AppError(400, "This email is already registered");
    }
    const hashedPassword = await bcryptjs_1.default.hash(ownerPassword, parseInt(process.env.BCRYPT_ROUNDS || "12"));
    const result = await prisma_1.default.$transaction(async (tx) => {
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
    const token = jsonwebtoken_1.default.sign({ id: result.user.id, role: result.user.role, email: result.user.email }, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn });
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
        throw new AppError_1.AppError(401, "Invalid email or password");
    }
    if (user.phone === "__DISABLED__") {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw new AppError_1.AppError(403, "This account has been disabled");
    }
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid) {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw new AppError_1.AppError(401, "Invalid email or password");
    }
    if (expectedRole === "PARENT" && user.role !== "PARENT") {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw new AppError_1.AppError(403, "Unauthorized account type");
    }
    if (expectedRole === "ADMIN" && user.role !== "ADMIN") {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw new AppError_1.AppError(403, "Unauthorized account type");
    }
    if (expectedRole === "SCHOOL_ADMIN" && user.role !== "SCHOOL_ADMIN") {
        (0, bruteForce_1.recordFailedLogin)(req, email);
        throw new AppError_1.AppError(403, "Unauthorized account type");
    }
    (0, bruteForce_1.recordSuccessfulLogin)(req, email);
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn });
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
const getFrontendUrl = () => (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");
const sendPasswordResetEmail = async (to, resetLink) => {
    const transporter = nodemailer_1.default.createTransport({
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
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (user) {
        const plainToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = await bcryptjs_1.default.hash(plainToken, parseInt(process.env.BCRYPT_ROUNDS || "12"));
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry,
            },
        });
        const resetLink = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(plainToken)}`;
        try {
            await sendPasswordResetEmail(user.email, resetLink);
        }
        catch {
            // Do not reveal whether the email exists or whether sending failed
        }
    }
    res.status(200).json({
        message: "If this email exists, a reset link has been sent.",
    });
};
exports.forgotPassword = forgotPassword;
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    const candidates = await prisma_1.default.user.findMany({
        where: {
            resetToken: { not: null },
            resetTokenExpiry: { gt: new Date() },
        },
        select: {
            id: true,
            resetToken: true,
        },
    });
    let matchedUserId = null;
    for (const candidate of candidates) {
        if (!candidate.resetToken)
            continue;
        const isMatch = await bcryptjs_1.default.compare(token, candidate.resetToken);
        if (isMatch) {
            matchedUserId = candidate.id;
            break;
        }
    }
    if (!matchedUserId) {
        res.status(400).json({ message: "Invalid or expired reset token." });
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || "12"));
    await prisma_1.default.user.update({
        where: { id: matchedUserId },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });
    res.json({ message: "Password reset successful." });
};
exports.resetPassword = resetPassword;
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
        throw new AppError_1.AppError(404, "User not found");
    }
    res.json(user);
};
exports.getMe = getMe;
