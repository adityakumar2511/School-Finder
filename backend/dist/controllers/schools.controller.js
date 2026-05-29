"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchool = exports.updateSchool = exports.createSchool = exports.getSchool = exports.getMySchool = exports.getSchools = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../lib/pagination");
const cache_1 = require("../lib/cache");
const schools_1 = require("../lib/queries/schools");
const slugify = (name) => name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
const generateSlug = async (name) => {
    const base = slugify(name);
    if (!base) {
        throw new AppError_1.AppError(400, "School name is required");
    }
    let slug = base;
    let count = 1;
    while (await prisma_1.default.school.findUnique({ where: { slug } })) {
        slug = `${base}-${count}`;
        count++;
    }
    return slug;
};
// GET /api/schools — public listing
const getSchools = async (req, res) => {
    const { search, city, board, schoolType, medium, page: pageQuery, limit: limitQuery, status, } = req.query;
    const page = (0, pagination_1.parsePage)(pageQuery);
    const limit = (0, pagination_1.parseLimit)(limitQuery, pagination_1.DEFAULT_SCHOOL_PAGE_LIMIT);
    const skip = (page - 1) * limit;
    const where = {
        status: status || "APPROVED",
    };
    const searchWhere = (0, schools_1.buildSchoolSearchWhere)(search);
    if (searchWhere?.OR) {
        where.OR = searchWhere.OR;
    }
    if (city)
        where.city = { contains: city, mode: "insensitive" };
    if (board)
        where.board = board;
    if (schoolType)
        where.schoolType = schoolType;
    if (medium)
        where.medium = medium;
    const cacheKey = (0, cache_1.buildCacheKey)("schools:list", {
        page,
        limit,
        status: String(where.status),
        search: search,
        city: city,
        board: board,
        schoolType: schoolType,
        medium: medium,
    });
    const result = await (0, cache_1.withCache)(cacheKey, async () => {
        const [rows, total] = await Promise.all([
            prisma_1.default.school.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: schools_1.schoolListSelect,
            }),
            prisma_1.default.school.count({ where }),
        ]);
        return {
            data: rows.map(schools_1.mapSchoolListItem),
            pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
        };
    }, { ttlSeconds: 60, namespace: "schools" });
    res.json((0, pagination_1.paginatedResponse)(result.data, result.pagination, "schools"));
};
exports.getSchools = getSchools;
// GET /api/schools/my-school — owner dashboard
const getMySchool = async (req, res) => {
    const school = await prisma_1.default.school.findFirst({
        where: { ownerId: req.user.id },
        select: {
            ...schools_1.schoolDetailSelect,
            rejectionReason: true,
        },
    });
    if (!school) {
        throw new AppError_1.AppError(404, "School not found");
    }
    res.json({ data: school });
};
exports.getMySchool = getMySchool;
// GET /api/schools/:slug — public detail
const getSchool = async (req, res) => {
    const slug = String(req.params.slug).trim();
    if (!slug) {
        throw new AppError_1.AppError(400, "Invalid school identifier");
    }
    const cacheKey = (0, cache_1.buildCacheKey)("schools:detail", { slug });
    const school = await (0, cache_1.withCache)(cacheKey, () => prisma_1.default.school.findUnique({
        where: { slug },
        select: schools_1.schoolDetailSelect,
    }), { ttlSeconds: 120, namespace: "schools" });
    if (!school) {
        throw new AppError_1.AppError(404, "School not found");
    }
    if (school.status !== "APPROVED") {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || (school.ownerId !== userId && userRole !== "ADMIN")) {
            throw new AppError_1.AppError(404, "School not found");
        }
    }
    res.json({ data: school, school });
};
exports.getSchool = getSchool;
// POST /api/schools — create school
const createSchool = async (req, res) => {
    const data = req.body;
    const slug = await generateSlug(data.name);
    const school = await prisma_1.default.school.create({
        data: {
            name: data.name,
            slug,
            description: data.description ?? null,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode ?? null,
            board: data.board,
            schoolType: data.schoolType,
            medium: data.medium,
            classesFrom: data.classesFrom,
            classesTo: data.classesTo,
            phone: data.phone,
            email: data.email ?? null,
            website: data.website ?? null,
            logoUrl: data.logoUrl ?? null,
            admissionFee: data.admissionFee ?? null,
            tuitionFeeMonthly: data.tuitionFeeMonthly ?? null,
            totalAnnualFee: data.totalAnnualFee ?? null,
            transportFee: data.transportFee ?? null,
            hostelFee: data.hostelFee ?? null,
            totalStudents: data.totalStudents ?? null,
            establishedYear: data.establishedYear ?? null,
            status: "PENDING",
            ownerId: req.user.id,
        },
    });
    res.status(201).json({ data: school });
};
exports.createSchool = createSchool;
// PATCH /api/schools/:id — update school
const updateSchool = async (req, res) => {
    const id = String(req.params.id).trim();
    const data = req.body;
    if (!id) {
        throw new AppError_1.AppError(400, "Invalid school identifier");
    }
    const school = await prisma_1.default.school.findUnique({
        where: { id },
        select: { id: true, ownerId: true },
    });
    if (!school) {
        throw new AppError_1.AppError(404, "School not found");
    }
    if (school.ownerId !== req.user.id && req.user.role !== "ADMIN") {
        throw new AppError_1.AppError(403, "You do not have permission to update this school");
    }
    const statusReset = req.user.role === "SCHOOL_ADMIN" ? { status: "PENDING" } : {};
    const updated = await prisma_1.default.school.update({
        where: { id },
        data: { ...data, ...statusReset },
    });
    res.json({ data: updated });
};
exports.updateSchool = updateSchool;
// DELETE /api/schools/:id — admin only
const deleteSchool = async (req, res) => {
    const id = String(req.params.id).trim();
    if (!id) {
        throw new AppError_1.AppError(400, "Invalid school identifier");
    }
    await prisma_1.default.school.delete({ where: { id } });
    res.json({ message: "School deleted successfully" });
};
exports.deleteSchool = deleteSchool;
