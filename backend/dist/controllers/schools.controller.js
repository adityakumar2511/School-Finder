"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCities = exports.deleteSchoolImage = exports.addSchoolImage = exports.deleteSchool = exports.updateSchool = exports.createSchool = exports.getSchool = exports.getMySchool = exports.searchSchools = exports.getSchools = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../lib/pagination");
const cache_1 = require("../lib/cache");
const schools_1 = require("../lib/queries/schools");
const sanitize_1 = require("../lib/sanitize");
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
// GET /api/schools — public listing (offset or cursor pagination)
const getSchools = async (req, res) => {
    const { search, city, board, schoolType, medium, page: pageQuery, limit: limitQuery, status, cursor, pagination, } = req.query;
    const limit = (0, pagination_1.parseLimit)(limitQuery, pagination_1.DEFAULT_SCHOOL_PAGE_LIMIT);
    const useCursorPagination = pagination === "cursor";
    const where = (0, schools_1.buildSchoolListWhere)({
        status: status,
        search: search,
        city: city,
        board: typeof board === "string" ? [board] : board,
        schoolType: schoolType,
        medium: medium,
    });
    if (useCursorPagination) {
        const cursorValue = typeof cursor === "string" ? cursor.trim() : "";
        const decodedCursor = cursorValue ? (0, schools_1.decodeSchoolCursor)(cursorValue) : null;
        if (cursorValue && !decodedCursor) {
            throw AppError_1.Errors.BadRequest("Invalid pagination cursor");
        }
        const cacheKey = (0, cache_1.buildCacheKey)("schools:list:cursor", {
            limit,
            cursor: cursorValue,
            status: String(where.status),
            search: search,
            city: city,
            board: Array.isArray(board) ? board.join(",") : board,
            schoolType: schoolType,
            medium: medium,
        });
        const result = await (0, cache_1.withCache)(cacheKey, cache_1.CACHE_TTL.SCHOOL_LIST, async () => {
            const rows = await prisma_1.default.school.findMany({
                where: decodedCursor
                    ? { AND: [where, (0, schools_1.buildSchoolCursorWhere)(decodedCursor)] }
                    : where,
                take: limit + 1,
                orderBy: schools_1.schoolListOrderBy,
                select: schools_1.schoolListSelectWithCreatedAt,
            });
            const hasMore = rows.length > limit;
            const pageRows = hasMore ? rows.slice(0, limit) : rows;
            const lastRow = pageRows[pageRows.length - 1];
            return {
                data: pageRows.map(schools_1.mapSchoolListItem),
                pagination: {
                    limit,
                    hasMore,
                    nextCursor: hasMore && lastRow ? (0, schools_1.encodeSchoolCursor)(lastRow) : null,
                },
            };
        });
        res.json((0, pagination_1.cursorPaginatedResponse)(result.data, result.pagination, "schools"));
        return;
    }
    const page = (0, pagination_1.parsePage)(pageQuery);
    const skip = (page - 1) * limit;
    const cacheKey = (0, cache_1.buildCacheKey)("schools:list", {
        page,
        limit,
        status: String(where.status),
        search: search,
        city: city,
        board: Array.isArray(board) ? board.join(",") : board,
        schoolType: schoolType,
        medium: medium,
    });
    const result = await (0, cache_1.withCache)(cacheKey, cache_1.CACHE_TTL.SCHOOL_LIST, async () => {
        const [rows, total] = await Promise.all([
            prisma_1.default.school.findMany({
                where,
                skip,
                take: limit,
                orderBy: schools_1.schoolListOrderBy,
                select: schools_1.schoolListSelect,
            }),
            prisma_1.default.school.count({ where }),
        ]);
        return {
            data: rows.map(schools_1.mapSchoolListItem),
            pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
        };
    });
    res.json((0, pagination_1.paginatedResponse)(result.data, result.pagination, "schools"));
};
exports.getSchools = getSchools;
// GET /api/schools/search — lightweight autocomplete
const searchSchools = async (req, res) => {
    const query = String(req.query.q ?? req.query.search ?? "").trim();
    const limit = (0, pagination_1.parseLimit)(req.query.limit, 10, 20);
    if (query.length < 2) {
        res.json({ data: [] });
        return;
    }
    const searchWhere = (0, schools_1.buildSchoolSearchWhere)(query);
    const where = {
        status: "APPROVED",
        ...(searchWhere ?? {}),
    };
    const cacheKey = (0, cache_1.buildCacheKey)("schools:search", { query, limit });
    const schools = await (0, cache_1.withCache)(cacheKey, cache_1.CACHE_TTL.SCHOOL_LIST, () => prisma_1.default.school.findMany({
        where,
        take: limit,
        orderBy: [{ name: "asc" }, { city: "asc" }],
        select: schools_1.schoolSearchSelect,
    }));
    res.json({ data: schools });
};
exports.searchSchools = searchSchools;
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
        throw AppError_1.Errors.NotFound("School");
    }
    res.json({ data: school });
};
exports.getMySchool = getMySchool;
// GET /api/schools/:slug — public detail
const getSchool = async (req, res) => {
    const slug = String(req.params.slug).trim();
    if (!slug) {
        throw AppError_1.Errors.BadRequest("Invalid school identifier");
    }
    const cacheKey = (0, cache_1.buildCacheKey)("schools:detail", { slug });
    const school = await (0, cache_1.withCache)(cacheKey, cache_1.CACHE_TTL.SCHOOL_DETAIL, () => prisma_1.default.school.findUnique({
        where: { slug },
        select: schools_1.schoolDetailSelect,
    }));
    if (!school) {
        throw AppError_1.Errors.NotFound("School");
    }
    if (school.status !== "APPROVED") {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || (school.ownerId !== userId && userRole !== "ADMIN")) {
            throw AppError_1.Errors.NotFound("School");
        }
    }
    res.json({ data: school, school });
};
exports.getSchool = getSchool;
// POST /api/schools — create school
const createSchool = async (req, res) => {
    const data = (0, sanitize_1.sanitizeSchoolData)(req.body);
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
    // Invalidate: admin stats (pending count), search, cities — new school may affect filters
    (0, cache_1.invalidateSchoolCache)();
    res.status(201).json({ data: school });
};
exports.createSchool = createSchool;
// PATCH /api/schools/:id — update school
const updateSchool = async (req, res) => {
    const id = String(req.params.id).trim();
    const data = (0, sanitize_1.sanitizeSchoolData)(req.body);
    if (!id) {
        throw AppError_1.Errors.BadRequest("Invalid school identifier");
    }
    const school = await prisma_1.default.school.findUnique({
        where: { id },
        select: { id: true, ownerId: true },
    });
    if (!school) {
        throw AppError_1.Errors.NotFound("School");
    }
    if (school.ownerId !== req.user.id && req.user.role !== "ADMIN") {
        throw AppError_1.Errors.Forbidden("You do not have permission to update this school");
    }
    const statusReset = req.user.role === "SCHOOL_ADMIN" ? { status: "PENDING" } : {};
    const updated = await prisma_1.default.school.update({
        where: { id },
        data: { ...data, ...statusReset },
    });
    // Invalidate: list, detail, search, cities — profile fields changed on public pages
    (0, cache_1.invalidateSchoolCache)();
    res.json({ data: updated });
};
exports.updateSchool = updateSchool;
// DELETE /api/schools/:id — admin only
const deleteSchool = async (req, res) => {
    const id = String(req.params.id).trim();
    if (!id) {
        throw AppError_1.Errors.BadRequest("Invalid school identifier");
    }
    await prisma_1.default.school.delete({ where: { id } });
    // Invalidate: remove deleted school from list, detail, search, cities, admin stats
    (0, cache_1.invalidateSchoolCache)();
    res.json({ message: "School deleted successfully" });
};
exports.deleteSchool = deleteSchool;
// POST /api/schools/my-school/images
const addSchoolImage = async (req, res) => {
    const { url, caption } = req.body;
    if (!url?.trim()) {
        throw AppError_1.Errors.BadRequest("Image URL is required");
    }
    const school = await prisma_1.default.school.findFirst({
        where: { ownerId: req.user.id },
        select: { id: true },
    });
    if (!school) {
        throw AppError_1.Errors.NotFound("School");
    }
    const image = await prisma_1.default.schoolImage.create({
        data: {
            schoolId: school.id,
            url: url.trim(),
            caption: caption?.trim() || null,
        },
    });
    // Invalidate: gallery images appear on public school detail page
    (0, cache_1.invalidateSchoolCache)();
    res.status(201).json({ data: image });
};
exports.addSchoolImage = addSchoolImage;
// DELETE /api/schools/images/:id
const deleteSchoolImage = async (req, res) => {
    const imageId = String(req.params.id).trim();
    const image = await prisma_1.default.schoolImage.findUnique({
        where: { id: imageId },
        include: { school: { select: { ownerId: true } } },
    });
    if (!image || image.school.ownerId !== req.user.id) {
        throw AppError_1.Errors.NotFound("Image");
    }
    await prisma_1.default.schoolImage.delete({ where: { id: imageId } });
    // Invalidate: removed image must disappear from public school detail page
    (0, cache_1.invalidateSchoolCache)();
    res.json({ message: "Image deleted successfully" });
};
exports.deleteSchoolImage = deleteSchoolImage;
// GET /api/schools/cities — distinct approved cities
const getCities = async (_req, res) => {
    const cacheKey = (0, cache_1.buildCacheKey)("schools:cities", {});
    const cities = await (0, cache_1.withCache)(cacheKey, cache_1.CACHE_TTL.SCHOOL_LIST, () => prisma_1.default.school.findMany({
        where: { status: "APPROVED" },
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
    }));
    res.json({ data: cities.map((s) => s.city) });
};
exports.getCities = getCities;
