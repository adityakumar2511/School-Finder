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
        const boards = Array.isArray(filters.board)
            ? filters.board
            : [filters.board];
        where.board = { in: boards };
    }
    if (filters.schoolType) {
        where.schoolType =
            filters.schoolType;
    }
    if (filters.medium) {
        where.medium = filters.medium;
    }
    return where;
}
/** Public school detail — all 22-section fields + relations */
exports.schoolDetailSelect = {
    id: true,
    name: true,
    slug: true,
    status: true,
    ownerId: true,
    // Core
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
    phone: true,
    email: true,
    website: true,
    logoUrl: true,
    coverImageUrl: true,
    // Basic Info extras
    tagline: true,
    establishedYear: true,
    managementType: true,
    schoolCategory: true,
    schoolFormat: true,
    affiliationNumber: true,
    startTime: true,
    endTime: true,
    workingDays: true,
    // About
    vision: true,
    mission: true,
    principalMessage: true,
    // Academics
    classesOffered: true,
    streamsOffered: true,
    studentTeacherRatio: true,
    // Admissions
    admissionOpen: true,
    admissionStartDate: true,
    admissionEndDate: true,
    ageCriteria: true,
    requiredDocuments: true,
    admissionProcess: true,
    // Fees — legacy
    admissionFee: true,
    tuitionFeeMonthly: true,
    totalAnnualFee: true,
    transportFee: true,
    hostelFee: true,
    // Fees — new grade-wise
    averageAnnualFee: true,
    prePrimaryFee: true,
    class1to5Fee: true,
    class6to8Fee: true,
    class9to10Fee: true,
    class11to12Fee: true,
    // Facilities & Sports
    facilitiesList: true,
    sportsList: true,
    // Infrastructure
    campusArea: true,
    totalClassrooms: true,
    totalLabs: true,
    libraryBooks: true,
    hostelCapacity: true,
    totalBuses: true,
    // Faculty
    totalTeachers: true,
    qualifiedTeachers: true,
    trainingPrograms: true,
    // Programs
    programsList: true,
    // Student Life
    clubsActivities: true,
    culturalActivities: true,
    annualEvents: true,
    educationalTours: true,
    // Achievements
    academicAchievements: true,
    sportsAchievements: true,
    awardsRecognitions: true,
    // Hostel
    hostelAvailable: true,
    hostelBoys: true,
    hostelGirls: true,
    hostelMess: true,
    // Transport
    transportAvailable: true,
    transportAreas: true,
    gpsTracking: true,
    totalVehicles: true,
    // Safety
    hasCCTV: true,
    hasGuards: true,
    hasMedicalRoom: true,
    hasFireSafety: true,
    hasVisitorMgmt: true,
    // Contact extras
    whatsapp: true,
    mapUrl: true,
    facebook: true,
    instagram: true,
    youtube: true,
    linkedin: true,
    admissionCoordinatorName: true,
    admissionPhone: true,
    admissionEmail: true,
    // Relations
    owner: { select: { name: true } },
    images: {
        select: { id: true, url: true, caption: true, category: true },
        orderBy: { createdAt: "asc" },
    },
    facilities: {
        select: {
            facility: { select: { id: true, name: true, icon: true } },
        },
    },
    boardResults: {
        select: {
            id: true,
            year: true,
            class10Pass: true,
            class12Pass: true,
            topperName: true,
            topperScore: true,
        },
        orderBy: { year: "desc" },
    },
    scholarships: {
        select: { id: true, name: true, eligibility: true, benefits: true },
    },
    faqs: {
        select: { id: true, question: true, answer: true },
    },
    downloads: {
        select: { id: true, label: true, url: true },
    },
    customFields: {
        select: {
            id: true,
            section: true,
            label: true,
            value: true,
            fieldType: true,
        },
    },
};
exports.adminSchoolListSelect = {
    id: true,
    name: true,
    slug: true,
    city: true,
    state: true,
    address: true,
    board: true,
    schoolType: true,
    medium: true,
    classesFrom: true,
    classesTo: true,
    phone: true,
    email: true,
    website: true,
    description: true,
    status: true,
    createdAt: true,
    rejectionReason: true,
    totalStudents: true,
    establishedYear: true,
    admissionFee: true,
    tuitionFeeMonthly: true,
    totalAnnualFee: true,
    transportFee: true,
    hostelFee: true,
    logoUrl: true,
    owner: {
        select: { name: true, email: true },
    },
};
