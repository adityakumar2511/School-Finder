"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSchoolListSelect = exports.schoolDetailSelect = exports.schoolListOrderBy = exports.schoolSearchSelect = exports.schoolListSelectWithCreatedAt = exports.schoolListSelect = void 0;
exports.encodeSchoolCursor = encodeSchoolCursor;
exports.decodeSchoolCursor = decodeSchoolCursor;
exports.buildSchoolCursorWhere = buildSchoolCursorWhere;
exports.mapSchoolListItem = mapSchoolListItem;
exports.buildSchoolSearchWhere = buildSchoolSearchWhere;
exports.buildSchoolListWhere = buildSchoolListWhere;
/** Fields shown on SchoolCard — no extras */
exports.schoolListSelect = {
    id: true,
    name: true,
    slug: true,
    city: true,
    state: true,
    board: true,
    schoolType: true,
    medium: true,
    classesFrom: true,
    classesTo: true,
    tuitionFeeMonthly: true,
    logoUrl: true,
    _count: {
        select: { facilities: true },
    },
};
/** Cursor pagination needs createdAt without exposing it in card payloads */
exports.schoolListSelectWithCreatedAt = {
    ...exports.schoolListSelect,
    createdAt: true,
};
/** Minimal fields for autocomplete / search suggestions */
exports.schoolSearchSelect = {
    id: true,
    name: true,
    slug: true,
    city: true,
    board: true,
    logoUrl: true,
};
exports.schoolListOrderBy = [
    { createdAt: "desc" },
    { id: "desc" },
];
function encodeSchoolCursor(school) {
    return Buffer.from(JSON.stringify({
        id: school.id,
        createdAt: school.createdAt.toISOString(),
    })).toString("base64url");
}
function decodeSchoolCursor(cursor) {
    try {
        const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        if (!parsed.id || !parsed.createdAt) {
            return null;
        }
        const createdAt = new Date(parsed.createdAt);
        if (Number.isNaN(createdAt.getTime())) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
function buildSchoolCursorWhere(cursor) {
    const createdAt = new Date(cursor.createdAt);
    return {
        OR: [
            { createdAt: { lt: createdAt } },
            {
                createdAt,
                id: { lt: cursor.id },
            },
        ],
    };
}
function mapSchoolListItem(school) {
    const { _count, id, name, slug, city, state, board, schoolType, medium, classesFrom, classesTo, tuitionFeeMonthly, logoUrl, } = school;
    return {
        id,
        name,
        slug,
        city,
        state,
        board,
        schoolType,
        medium,
        classesFrom,
        classesTo,
        tuitionFeeMonthly,
        logoUrl,
        facilitiesCount: _count.facilities,
    };
}
function buildSchoolSearchWhere(search) {
    const term = search?.trim();
    if (!term)
        return undefined;
    return {
        OR: [
            { name: { contains: term, mode: "insensitive" } },
            { city: { contains: term, mode: "insensitive" } },
            { state: { contains: term, mode: "insensitive" } },
        ],
    };
}
function buildSchoolListWhere(filters) {
    const where = {
        status: filters.status || "APPROVED",
    };
    const searchWhere = buildSchoolSearchWhere(filters.search);
    if (searchWhere?.OR) {
        where.OR = searchWhere.OR;
    }
    if (filters.city) {
        where.city = { contains: filters.city, mode: "insensitive" };
    }
    if (filters.board) {
        const boards = Array.isArray(filters.board) ? filters.board : [filters.board];
        where.board = { in: boards };
    }
    if (filters.schoolType) {
        where.schoolType = filters.schoolType;
    }
    if (filters.medium) {
        where.medium = filters.medium;
    }
    return where;
}
/** Public school detail — necessary relations only */
exports.schoolDetailSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    address: true,
    city: true,
    state: true,
    pincode: true,
    board: true,
    schoolType: true,
    medium: true,
    classesFrom: true,
    classesTo: true,
    totalStudents: true,
    establishedYear: true,
    phone: true,
    email: true,
    website: true,
    logoUrl: true,
    admissionFee: true,
    tuitionFeeMonthly: true,
    totalAnnualFee: true,
    transportFee: true,
    hostelFee: true,
    status: true,
    ownerId: true,
    images: {
        select: { id: true, url: true, caption: true },
        orderBy: { createdAt: "asc" },
    },
    facilities: {
        select: {
            facility: {
                select: { id: true, name: true, icon: true },
            },
        },
    },
    owner: {
        select: { name: true },
    },
};
exports.adminSchoolListSelect = {
    id: true,
    name: true,
    slug: true,
    city: true,
    state: true, // ADD
    address: true, // ADD
    board: true,
    schoolType: true, // ADD
    medium: true, // ADD
    classesFrom: true, // ADD
    classesTo: true, // ADD
    phone: true, // ADD
    email: true, // ADD
    website: true, // ADD
    description: true, // ADD
    status: true,
    createdAt: true,
    rejectionReason: true,
    totalStudents: true, // ADD
    establishedYear: true, // ADD
    admissionFee: true, // ADD
    tuitionFeeMonthly: true, // ADD
    totalAnnualFee: true, // ADD
    transportFee: true, // ADD
    hostelFee: true, // ADD
    logoUrl: true, // ADD
    owner: {
        select: { name: true, email: true },
    },
};
