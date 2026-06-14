"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnerEmail = exports.addSchoolDirect = exports.updateUserStatus = exports.updateUserRole = exports.getAdminInquiries = exports.getAdminUsers = exports.rejectSchool = exports.approveSchool = exports.rejectSchoolById = exports.approveSchoolById = exports.getAdminSchools = exports.getStats = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
const account_status_1 = require("../lib/account-status");
const pagination_1 = require("../lib/pagination");
const cache_1 = require("../lib/cache");
const schools_1 = require("../lib/queries/schools");
const VALID_ROLES = ["PARENT", "SCHOOL_ADMIN", "ADMIN"];
const generateSlug = async (name) => {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    if (!base) {
        throw AppError_1.Errors.BadRequest("School name is required");
    }
    let slug = base;
    let count = 1;
    while (await prisma_1.default.school.findUnique({ where: { slug } })) {
        slug = `${base}-${count}`;
        count++;
    }
    return slug;
};
// GET /api/admin/stats
const getStats = async (_req, res) => {
    const cacheKey = (0, cache_1.buildCacheKey)("admin:stats", {});
    const stats = await (0, cache_1.withCache)(cacheKey, cache_1.CACHE_TTL.ADMIN_STATS, async () => {
        const [totalSchools, pendingSchools, approvedSchools, rejectedSchools, totalInquiries, totalUsers,] = await Promise.all([
            prisma_1.default.school.count(),
            prisma_1.default.school.count({ where: { status: "PENDING" } }),
            prisma_1.default.school.count({ where: { status: "APPROVED" } }),
            prisma_1.default.school.count({ where: { status: "REJECTED" } }),
            prisma_1.default.inquiry.count(),
            prisma_1.default.user.count(),
        ]);
        return {
            totalSchools,
            pendingSchools,
            approvedSchools,
            rejectedSchools,
            totalInquiries,
            totalUsers,
        };
    });
    res.json({ stats });
};
exports.getStats = getStats;
// GET /api/admin/schools
const getAdminSchools = async (req, res) => {
    const page = (0, pagination_1.parsePage)(req.query.page);
    const limit = (0, pagination_1.parseLimit)(req.query.limit, pagination_1.DEFAULT_ADMIN_PAGE_LIMIT);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    const where = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        where.status = status;
    }
    const term = search?.trim();
    if (term) {
        where.OR = [
            { name: { contains: term, mode: "insensitive" } },
            { city: { contains: term, mode: "insensitive" } },
            { owner: { email: { contains: term, mode: "insensitive" } } },
        ];
    }
    const [rows, total] = await Promise.all([
        prisma_1.default.school.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: schools_1.adminSchoolListSelect,
        }),
        prisma_1.default.school.count({ where }),
    ]);
    const pagination = (0, pagination_1.buildPaginationMeta)(total, page, limit);
    res.json((0, pagination_1.paginatedResponse)(rows, pagination, "schools"));
};
exports.getAdminSchools = getAdminSchools;
// PATCH /api/admin/schools/:id/approve
const approveSchoolById = async (req, res) => {
    const id = String(req.params.id).trim();
    const school = await prisma_1.default.school.update({
        where: { id },
        data: {
            status: "APPROVED",
            rejectionReason: null,
        },
    });
    // Invalidate: approved school must appear in public listings, detail, cities, search
    (0, cache_1.invalidateSchoolCache)();
    res.json({ message: "School approved successfully", school });
};
exports.approveSchoolById = approveSchoolById;
// PATCH /api/admin/schools/:id/reject
const rejectSchoolById = async (req, res) => {
    const id = String(req.params.id).trim();
    const { reason } = req.body;
    const school = await prisma_1.default.school.update({
        where: { id },
        data: {
            status: "REJECTED",
            rejectionReason: typeof reason === "string" && reason.trim()
                ? reason.trim()
                : "Rejected by administrator",
        },
    });
    // Invalidate: rejected school must disappear from public listings and detail
    (0, cache_1.invalidateSchoolCache)();
    res.json({ message: "School rejected successfully", school });
};
exports.rejectSchoolById = rejectSchoolById;
// POST /api/admin/approve (legacy)
const approveSchool = async (req, res) => {
    const { schoolId } = req.body;
    if (!schoolId) {
        throw AppError_1.Errors.BadRequest("schoolId is required");
    }
    req.params = { id: schoolId };
    return (0, exports.approveSchoolById)(req, res);
};
exports.approveSchool = approveSchool;
// POST /api/admin/reject (legacy)
const rejectSchool = async (req, res) => {
    const { schoolId, reason } = req.body;
    if (!schoolId) {
        throw AppError_1.Errors.BadRequest("schoolId is required");
    }
    req.params = { id: schoolId };
    req.body = { reason };
    return (0, exports.rejectSchoolById)(req, res);
};
exports.rejectSchool = rejectSchool;
// GET /api/admin/users
const getAdminUsers = async (req, res) => {
    const page = (0, pagination_1.parsePage)(req.query.page);
    const limit = (0, pagination_1.parseLimit)(req.query.limit, pagination_1.DEFAULT_ADMIN_PAGE_LIMIT);
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const where = {};
    const term = search?.trim();
    if (term) {
        where.OR = [
            { name: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
        ];
    }
    const [rows, total] = await Promise.all([
        prisma_1.default.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        }),
        prisma_1.default.user.count({ where }),
    ]);
    const data = rows.map((user) => ({
        ...user,
        accountStatus: (0, account_status_1.isAccountDisabled)(user.phone) ? "disabled" : "active",
    }));
    const pagination = (0, pagination_1.buildPaginationMeta)(total, page, limit);
    res.json((0, pagination_1.paginatedResponse)(data, pagination, "users"));
};
exports.getAdminUsers = getAdminUsers;
// GET /api/admin/inquiries
const getAdminInquiries = async (req, res) => {
    const page = (0, pagination_1.parsePage)(req.query.page);
    const limit = (0, pagination_1.parseLimit)(req.query.limit, pagination_1.DEFAULT_ADMIN_PAGE_LIMIT);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    const where = {};
    if (status && ["NEW", "CONTACTED", "CLOSED"].includes(status)) {
        where.status = status;
    }
    const term = search?.trim();
    if (term) {
        where.OR = [
            { message: { contains: term, mode: "insensitive" } },
            { school: { name: { contains: term, mode: "insensitive" } } },
            { parent: { name: { contains: term, mode: "insensitive" } } },
            { parent: { email: { contains: term, mode: "insensitive" } } },
        ];
    }
    const [rows, total] = await Promise.all([
        prisma_1.default.inquiry.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                message: true,
                status: true,
                createdAt: true,
                school: { select: { id: true, name: true } },
                parent: { select: { name: true, email: true } },
            },
        }),
        prisma_1.default.inquiry.count({ where }),
    ]);
    const pagination = (0, pagination_1.buildPaginationMeta)(total, page, limit);
    res.json((0, pagination_1.paginatedResponse)(rows, pagination, "inquiries"));
};
exports.getAdminInquiries = getAdminInquiries;
// PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    const targetId = String(req.params.id).trim();
    const { role } = req.body;
    if (!role || !VALID_ROLES.includes(role)) {
        throw AppError_1.Errors.BadRequest("Invalid role");
    }
    if (targetId === req.user.id && role !== "ADMIN") {
        throw AppError_1.Errors.Forbidden("You cannot demote your own admin account");
    }
    const target = await prisma_1.default.user.findUnique({ where: { id: targetId } });
    if (!target) {
        throw AppError_1.Errors.NotFound("User");
    }
    if (target.id === req.user.id &&
        target.role === "ADMIN" &&
        role !== "ADMIN") {
        throw AppError_1.Errors.Forbidden("You cannot demote your own admin account");
    }
    const adminCount = await prisma_1.default.user.count({ where: { role: "ADMIN" } });
    if (target.role === "ADMIN" && role !== "ADMIN" && adminCount <= 1) {
        throw AppError_1.Errors.Forbidden("Cannot remove the last administrator");
    }
    const updated = await prisma_1.default.user.update({
        where: { id: targetId },
        data: { role: role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            createdAt: true,
        },
    });
    res.json({
        message: "User role updated",
        user: {
            ...updated,
            accountStatus: (0, account_status_1.isAccountDisabled)(updated.phone) ? "disabled" : "active",
        },
    });
};
exports.updateUserRole = updateUserRole;
// PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
    const targetId = String(req.params.id).trim();
    const { status } = req.body;
    if (!status || !["active", "disabled"].includes(status)) {
        throw AppError_1.Errors.BadRequest("Invalid status. Use active or disabled.");
    }
    if (targetId === req.user.id) {
        throw AppError_1.Errors.Forbidden("You cannot change your own account status");
    }
    const target = await prisma_1.default.user.findUnique({ where: { id: targetId } });
    if (!target) {
        throw AppError_1.Errors.NotFound("User");
    }
    if (target.role === "ADMIN" && status === "disabled") {
        const adminCount = await prisma_1.default.user.count({
            where: { role: "ADMIN", phone: { not: account_status_1.ACCOUNT_DISABLED_PHONE } },
        });
        if (adminCount <= 1) {
            throw AppError_1.Errors.Forbidden("Cannot disable the last active administrator");
        }
    }
    const updated = await prisma_1.default.user.update({
        where: { id: targetId },
        data: {
            phone: status === "disabled" ? account_status_1.ACCOUNT_DISABLED_PHONE : null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            createdAt: true,
        },
    });
    res.json({
        message: status === "disabled" ? "Account disabled" : "Account enabled",
        user: {
            ...updated,
            accountStatus: status,
        },
    });
};
exports.updateUserStatus = updateUserStatus;
// POST /api/admin/add-school
// POST /api/admin/add-school
const addSchoolDirect = async (req, res) => {
    if (!req.user?.id) {
        throw AppError_1.Errors.Unauthorized("Authentication required");
    }
    const { ownerEmail, ownerName, ownerPassword, name, phone } = req.body;
    if (!ownerEmail || !name || !phone) {
        throw AppError_1.Errors.BadRequest("ownerEmail, name, and phone are required");
    }
    // ── Unique check: email pe, name pe nahi ──────────────────────────────
    const existingUserWithSchool = await prisma_1.default.user.findUnique({
        where: { email: ownerEmail },
        include: { ownedSchools: { select: { id: true }, take: 1 } },
    });
    if (existingUserWithSchool) {
        if (existingUserWithSchool.role === "ADMIN") {
            throw AppError_1.Errors.BadRequest("Cannot assign a platform admin as school owner");
        }
        if (existingUserWithSchool.role === "SCHOOL_ADMIN" &&
            existingUserWithSchool.ownedSchools.length > 0) {
            throw AppError_1.Errors.Conflict("This email is already associated with a school");
        }
    }
    // ── Owner resolve ─────────────────────────────────────────────────────
    let owner = existingUserWithSchool;
    if (owner && owner.role === "PARENT") {
        owner = await prisma_1.default.user.update({
            where: { id: owner.id },
            data: { role: "SCHOOL_ADMIN" },
            include: { ownedSchools: { select: { id: true }, take: 1 } },
        });
    }
    if (!owner) {
        const passwordToHash = ownerPassword?.trim() || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcryptjs_1.default.hash(passwordToHash, parseInt(process.env.BCRYPT_ROUNDS || "12", 10));
        owner = await prisma_1.default.user.create({
            data: {
                name: ownerName || ownerEmail.split("@")[0],
                email: ownerEmail,
                password: hashedPassword,
                role: "SCHOOL_ADMIN",
                phone,
            },
            include: { ownedSchools: { select: { id: true }, take: 1 } },
        });
    }
    if (!owner) {
        throw new AppError_1.AppError("Failed to resolve school owner", 500, "INTERNAL_ERROR");
    }
    // ── Slug ──────────────────────────────────────────────────────────────
    const slug = await generateSlug(name.trim());
    // ── School create — all required fields with defaults ─────────────────
    const school = await prisma_1.default.school.create({
        data: {
            name: name.trim(),
            slug,
            phone,
            address: "", // filled later from dashboard
            city: "",
            state: "",
            board: "OTHER",
            schoolType: "CO_ED",
            medium: "ENGLISH",
            classesFrom: 1,
            classesTo: 12,
            description: null,
            pincode: null,
            email: null,
            website: null,
            logoUrl: null,
            admissionFee: null,
            tuitionFeeMonthly: null,
            totalAnnualFee: null,
            transportFee: null,
            hostelFee: null,
            totalStudents: null,
            establishedYear: null,
            status: "APPROVED",
            ownerId: owner.id,
        },
    });
    (0, cache_1.invalidateSchoolCache)();
    res.status(201).json({
        message: "School added successfully",
        school: {
            id: school.id,
            name: school.name,
            slug: school.slug,
            status: school.status,
        },
    });
};
exports.addSchoolDirect = addSchoolDirect;
// GET /api/admin/check-owner?email=xxx
const checkOwnerEmail = async (req, res) => {
    const email = req.query.email?.trim().toLowerCase();
    if (!email) {
        throw AppError_1.Errors.BadRequest("Email is required");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            role: true,
            ownedSchools: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                },
                orderBy: { createdAt: "asc" },
                take: 1,
            },
        },
    });
    if (!user) {
        return res.json({ exists: false });
    }
    if (user.role !== "SCHOOL_ADMIN") {
        return res.json({
            exists: true,
            role: user.role,
            hasSchool: false,
            school: null,
        });
    }
    const school = user.ownedSchools[0] ?? null;
    return res.json({
        exists: true,
        role: user.role,
        name: user.name,
        hasSchool: school !== null,
        school,
    });
};
exports.checkOwnerEmail = checkOwnerEmail;
