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
// ── Slug helpers ──────────────────────────────────────────────────────────────
const slugify = (name) => name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
const generateSlug = async (name) => {
    const base = slugify(name);
    if (!base)
        throw AppError_1.Errors.BadRequest("School name is required");
    let slug = base;
    let count = 1;
    while (await prisma_1.default.school.findUnique({ where: { slug } })) {
        slug = `${base}-${count}`;
        count++;
    }
    return slug;
};
// ── Related-model sync helpers ────────────────────────────────────────────────
// Each helper deletes rows not in the incoming list, then upserts the rest.
// They run inside the same transaction as the school update.
async function syncBoardResults(tx, schoolId, items) {
    const incomingIds = items.map((i) => i.id).filter(Boolean);
    await tx.boardResult.deleteMany({
        where: { schoolId, id: { notIn: incomingIds } },
    });
    for (const item of items) {
        if (item.id) {
            await tx.boardResult.update({
                where: { id: item.id },
                data: {
                    year: item.year,
                    class10Pass: item.class10Pass ?? null,
                    class12Pass: item.class12Pass ?? null,
                    topperName: item.topperName ?? null,
                    topperScore: item.topperScore ?? null,
                },
            });
        }
        else {
            await tx.boardResult.create({
                data: {
                    schoolId,
                    year: item.year,
                    class10Pass: item.class10Pass ?? null,
                    class12Pass: item.class12Pass ?? null,
                    topperName: item.topperName ?? null,
                    topperScore: item.topperScore ?? null,
                },
            });
        }
    }
}
async function syncScholarships(tx, schoolId, items) {
    const incomingIds = items.map((i) => i.id).filter(Boolean);
    await tx.scholarship.deleteMany({
        where: { schoolId, id: { notIn: incomingIds } },
    });
    for (const item of items) {
        if (item.id) {
            await tx.scholarship.update({
                where: { id: item.id },
                data: {
                    name: item.name,
                    eligibility: item.eligibility ?? null,
                    benefits: item.benefits ?? null,
                },
            });
        }
        else {
            await tx.scholarship.create({
                data: {
                    schoolId,
                    name: item.name,
                    eligibility: item.eligibility ?? null,
                    benefits: item.benefits ?? null,
                },
            });
        }
    }
}
async function syncFAQs(tx, schoolId, items) {
    const incomingIds = items.map((i) => i.id).filter(Boolean);
    await tx.schoolFAQ.deleteMany({
        where: { schoolId, id: { notIn: incomingIds } },
    });
    for (const item of items) {
        if (item.id) {
            await tx.schoolFAQ.update({
                where: { id: item.id },
                data: { question: item.question, answer: item.answer },
            });
        }
        else {
            await tx.schoolFAQ.create({
                data: { schoolId, question: item.question, answer: item.answer },
            });
        }
    }
}
async function syncDownloads(tx, schoolId, items) {
    const incomingIds = items.map((i) => i.id).filter(Boolean);
    await tx.schoolDownload.deleteMany({
        where: { schoolId, id: { notIn: incomingIds } },
    });
    for (const item of items) {
        if (item.id) {
            await tx.schoolDownload.update({
                where: { id: item.id },
                data: { label: item.label, url: item.url },
            });
        }
        else {
            await tx.schoolDownload.create({
                data: { schoolId, label: item.label, url: item.url },
            });
        }
    }
}
async function syncGalleryImages(tx, schoolId, items) {
    const incomingIds = items.map((i) => i.id).filter(Boolean);
    await tx.schoolImage.deleteMany({
        where: { schoolId, id: { notIn: incomingIds } },
    });
    for (const item of items) {
        if (item.id) {
            await tx.schoolImage.update({
                where: { id: item.id },
                data: {
                    url: item.url,
                    caption: item.caption ?? null,
                    category: item.category ?? null,
                },
            });
        }
        else {
            await tx.schoolImage.create({
                data: {
                    schoolId,
                    url: item.url,
                    caption: item.caption ?? null,
                    category: item.category ?? null,
                },
            });
        }
    }
}
async function syncCustomFields(tx, schoolId, items, section // if provided, only touch that section's fields
) {
    const incomingIds = items.map((i) => i.id).filter(Boolean);
    await tx.schoolCustomField.deleteMany({
        where: {
            schoolId,
            ...(section ? { section } : {}),
            id: { notIn: incomingIds },
        },
    });
    for (const item of items) {
        if (item.id) {
            await tx.schoolCustomField.update({
                where: { id: item.id },
                data: {
                    section: item.section,
                    label: item.label,
                    value: item.value,
                    fieldType: item.fieldType,
                },
            });
        }
        else {
            await tx.schoolCustomField.create({
                data: {
                    schoolId,
                    section: item.section,
                    label: item.label,
                    value: item.value,
                    fieldType: item.fieldType,
                },
            });
        }
    }
}
// ── Extract scalar fields from validated input ────────────────────────────────
// Strips the relation arrays so we can pass only scalar fields to school.update()
function extractScalarFields(data) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { boardResults, scholarships, faqs, downloads, images, customFields, ...scalars } = data;
    return scalars;
}
// ── GET /api/schools — public listing (offset or cursor pagination) ────────────
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
            board: Array.isArray(board)
                ? board.join(",")
                : board,
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
        board: Array.isArray(board)
            ? board.join(",")
            : board,
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
// ── GET /api/schools/search — lightweight autocomplete ────────────────────────
const searchSchools = async (req, res) => {
    const query = String(req.query.q ?? req.query.search ?? "").trim();
    const limit = (0, pagination_1.parseLimit)(req.query.limit, 10, 20);
    if (query.length < 2) {
        res.json({ data: [] });
        return;
    }
    const searchWhere = (0, schools_1.buildSchoolSearchWhere)(query);
    const where = { status: "APPROVED", ...(searchWhere ?? {}) };
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
// ── GET /api/schools/my-school — school owner dashboard ──────────────────────
const getMySchool = async (req, res) => {
    const school = await prisma_1.default.school.findFirst({
        where: { ownerId: req.user.id },
        select: {
            ...schools_1.schoolDetailSelect,
            rejectionReason: true,
            // New relation includes
            customFields: true,
            boardResults: { orderBy: { year: "desc" } },
            scholarships: true,
            faqs: true, // relation field name on School model — stays "faqs"
            downloads: true,
        },
    });
    if (!school)
        throw AppError_1.Errors.NotFound("School");
    res.json({ data: school });
};
exports.getMySchool = getMySchool;
// ── GET /api/schools/:slug — public detail ────────────────────────────────────
const getSchool = async (req, res) => {
    const slug = String(req.params.slug).trim();
    if (!slug)
        throw AppError_1.Errors.BadRequest("Invalid school identifier");
    const cacheKey = (0, cache_1.buildCacheKey)("schools:detail", { slug });
    const school = await (0, cache_1.withCache)(cacheKey, cache_1.CACHE_TTL.SCHOOL_DETAIL, () => prisma_1.default.school.findUnique({
        where: { slug },
        select: {
            ...schools_1.schoolDetailSelect,
            customFields: true,
            boardResults: { orderBy: { year: "desc" } },
            scholarships: true,
            faqs: true,
            downloads: true,
        },
    }));
    if (!school)
        throw AppError_1.Errors.NotFound("School");
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
// ── POST /api/schools — create school ────────────────────────────────────────
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
            coverImageUrl: data.coverImageUrl ?? null,
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
    (0, cache_1.invalidateSchoolCache)();
    res.status(201).json({ data: school });
};
exports.createSchool = createSchool;
// ── PATCH /api/schools/:id — update school ────────────────────────────────────
// Handles both scalar fields and related-model arrays in a single transaction.
const updateSchool = async (req, res) => {
    const id = String(req.params.id).trim();
    if (!id)
        throw AppError_1.Errors.BadRequest("Invalid school identifier");
    const data = (0, sanitize_1.sanitizeSchoolData)(req.body);
    const existing = await prisma_1.default.school.findUnique({
        where: { id },
        select: { id: true, ownerId: true },
    });
    if (!existing)
        throw AppError_1.Errors.NotFound("School");
    if (existing.ownerId !== req.user.id &&
        req.user.role !== "ADMIN") {
        throw AppError_1.Errors.Forbidden("You do not have permission to update this school");
    }
    // School admins trigger re-review when they update their profile
    const statusReset = req.user.role === "SCHOOL_ADMIN"
        ? { status: "PENDING" }
        : {};
    const scalars = extractScalarFields(data);
    const updated = await prisma_1.default.$transaction(async (tx) => {
        const school = await tx.school.update({
            where: { id },
            data: { ...scalars, ...statusReset },
        });
        if (data.boardResults !== undefined) {
            await syncBoardResults(tx, id, data.boardResults);
        }
        if (data.scholarships !== undefined) {
            await syncScholarships(tx, id, data.scholarships);
        }
        if (data.faqs !== undefined) {
            await syncFAQs(tx, id, data.faqs);
        }
        if (data.downloads !== undefined) {
            await syncDownloads(tx, id, data.downloads);
        }
        if (data.images !== undefined) {
            await syncGalleryImages(tx, id, data.images);
        }
        if (data.customFields !== undefined) {
            await syncCustomFields(tx, id, data.customFields);
        }
        return school;
    });
    (0, cache_1.invalidateSchoolCache)();
    res.json({ data: updated });
};
exports.updateSchool = updateSchool;
// ── DELETE /api/schools/:id — admin only ──────────────────────────────────────
const deleteSchool = async (req, res) => {
    const id = String(req.params.id).trim();
    if (!id)
        throw AppError_1.Errors.BadRequest("Invalid school identifier");
    await prisma_1.default.school.delete({ where: { id } });
    (0, cache_1.invalidateSchoolCache)();
    res.json({ message: "School deleted successfully" });
};
exports.deleteSchool = deleteSchool;
// ── POST /api/schools/my-school/images ───────────────────────────────────────
const addSchoolImage = async (req, res) => {
    const { url, caption, category, } = req.body;
    if (!url?.trim())
        throw AppError_1.Errors.BadRequest("Image URL is required");
    const school = await prisma_1.default.school.findFirst({
        where: { ownerId: req.user.id },
        select: { id: true },
    });
    if (!school)
        throw AppError_1.Errors.NotFound("School");
    const image = await prisma_1.default.schoolImage.create({
        data: {
            schoolId: school.id,
            url: url.trim(),
            caption: caption?.trim() || null,
            category: category?.trim() || null,
        },
    });
    (0, cache_1.invalidateSchoolCache)();
    res.status(201).json({ data: image });
};
exports.addSchoolImage = addSchoolImage;
// ── DELETE /api/schools/images/:id ───────────────────────────────────────────
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
    (0, cache_1.invalidateSchoolCache)();
    res.json({ message: "Image deleted successfully" });
};
exports.deleteSchoolImage = deleteSchoolImage;
// ── GET /api/schools/cities — distinct approved cities ────────────────────────
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
