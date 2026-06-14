"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchoolBodySchema = exports.createSchoolBodySchema = void 0;
const zod_1 = require("zod");
const sanitize_1 = require("../lib/sanitize");
// ── Enum schemas ──────────────────────────────────────────────────────────────
const boardSchema = zod_1.z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]);
const schoolTypeSchema = zod_1.z.enum(["BOYS", "GIRLS", "CO_ED"]);
const mediumSchema = zod_1.z.enum(["HINDI", "ENGLISH", "BOTH"]);
// ── Reusable preprocessors ────────────────────────────────────────────────────
const optionalFee = zod_1.z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), zod_1.z.coerce.number().nonnegative().optional());
const optionalInt = zod_1.z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), zod_1.z.coerce.number().int().nonnegative().optional());
const optionalBool = zod_1.z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), zod_1.z.boolean().optional());
const optionalStr = zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().optional());
const optionalTextStr = zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().max(10000).optional());
const optionalUrl = zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().url("Enter a valid URL").optional());
const optionalEmail = zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().email("Enter a valid email").optional());
const stringArray = zod_1.z.array(zod_1.z.string()).optional().default([]);
// ── Nested schemas for related models ────────────────────────────────────────
const boardResultSchema = zod_1.z.object({
    id: zod_1.z.string().optional(), // present on update
    year: zod_1.z.string().min(4, "Year is required"),
    class10Pass: optionalStr,
    class12Pass: optionalStr,
    topperName: optionalStr,
    topperScore: optionalStr,
});
const scholarshipSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, "Scholarship name is required"),
    eligibility: optionalTextStr,
    benefits: optionalTextStr,
});
const faqSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    question: zod_1.z.string().min(1, "Question is required"),
    answer: zod_1.z.string().min(1, "Answer is required"),
});
const downloadSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    label: zod_1.z.string().min(1, "Label is required"),
    url: zod_1.z.string().url("Enter a valid download URL"),
});
const customFieldSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    section: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1, "Field label is required"),
    value: zod_1.z.string(),
    fieldType: zod_1.z.enum(["text", "number", "date", "url", "richtext"]).default("text"),
});
const galleryImageSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    url: zod_1.z.string().url("Enter a valid image URL"),
    caption: optionalStr,
    category: optionalStr,
});
// ── Core school body fields (create) ─────────────────────────────────────────
const schoolBodyFields = {
    // Identity (required on create)
    name: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().min(3, "School name is required")),
    city: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().min(2, "City is required")),
    state: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().min(2, "State is required")),
    address: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().min(5, "Address is required")),
    pincode: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode").optional()),
    board: boardSchema,
    schoolType: schoolTypeSchema,
    medium: mediumSchema,
    classesFrom: zod_1.z.coerce.number().int().min(1).max(12),
    classesTo: zod_1.z.coerce.number().int().min(1).max(12),
    phone: zod_1.z.preprocess(sanitize_1.preprocessIndianPhone, zod_1.z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number")),
    email: optionalEmail,
    website: optionalUrl,
    logoUrl: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().url().optional()),
    coverImageUrl: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().url().optional()),
    description: optionalTextStr,
    // Legacy fee fields
    admissionFee: optionalFee,
    tuitionFeeMonthly: optionalFee,
    totalAnnualFee: optionalFee,
    transportFee: optionalFee,
    hostelFee: optionalFee,
    totalStudents: optionalInt,
    // ── Section 1: Basic Info ────────────────────────────────────────────────
    tagline: optionalStr,
    establishedYear: zod_1.z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), zod_1.z.coerce.number().int().min(1800).max(2100).optional()),
    managementType: optionalStr,
    schoolCategory: optionalStr,
    schoolFormat: optionalStr,
    affiliationNumber: optionalStr,
    startTime: optionalStr,
    endTime: optionalStr,
    workingDays: optionalStr,
    // ── Section 2: About ────────────────────────────────────────────────────
    vision: optionalTextStr,
    mission: optionalTextStr,
    principalMessage: optionalTextStr,
    // ── Section 3: Academics ────────────────────────────────────────────────
    classesOffered: stringArray,
    streamsOffered: stringArray,
    studentTeacherRatio: optionalStr,
    // ── Section 4: Admissions ───────────────────────────────────────────────
    admissionOpen: optionalBool,
    admissionStartDate: zod_1.z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), zod_1.z.coerce.date().optional()),
    admissionEndDate: zod_1.z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), zod_1.z.coerce.date().optional()),
    ageCriteria: optionalStr,
    requiredDocuments: optionalTextStr,
    admissionProcess: optionalTextStr,
    // ── Section 5: Fee Structure ────────────────────────────────────────────
    averageAnnualFee: optionalInt,
    prePrimaryFee: optionalInt,
    class1to5Fee: optionalInt,
    class6to8Fee: optionalInt,
    class9to10Fee: optionalInt,
    class11to12Fee: optionalInt,
    // ── Section 6 & 7: Facilities & Sports ─────────────────────────────────
    facilitiesList: stringArray,
    sportsList: stringArray,
    // ── Section 8: Infrastructure ───────────────────────────────────────────
    campusArea: optionalStr,
    totalClassrooms: optionalInt,
    totalLabs: optionalInt,
    libraryBooks: optionalInt,
    hostelCapacity: optionalInt,
    totalBuses: optionalInt,
    // ── Section 9: Faculty ──────────────────────────────────────────────────
    totalTeachers: optionalInt,
    qualifiedTeachers: optionalInt,
    trainingPrograms: optionalTextStr,
    // ── Section 10: Programs ────────────────────────────────────────────────
    programsList: stringArray,
    // ── Section 11: Student Life ────────────────────────────────────────────
    clubsActivities: optionalTextStr,
    culturalActivities: optionalTextStr,
    annualEvents: optionalTextStr,
    educationalTours: optionalTextStr,
    // ── Section 12: Achievements ────────────────────────────────────────────
    academicAchievements: optionalTextStr,
    sportsAchievements: optionalTextStr,
    awardsRecognitions: optionalTextStr,
    // ── Section 15: Hostel ──────────────────────────────────────────────────
    hostelAvailable: optionalBool,
    hostelBoys: optionalBool,
    hostelGirls: optionalBool,
    hostelMess: optionalBool,
    // ── Section 16: Transport ───────────────────────────────────────────────
    transportAvailable: optionalBool,
    transportAreas: optionalStr,
    gpsTracking: optionalBool,
    totalVehicles: optionalStr,
    // ── Section 17: Safety ──────────────────────────────────────────────────
    hasCCTV: optionalBool,
    hasGuards: optionalBool,
    hasMedicalRoom: optionalBool,
    hasFireSafety: optionalBool,
    hasVisitorMgmt: optionalBool,
    // ── Section 20: Contact extras ──────────────────────────────────────────
    whatsapp: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().regex(/^\d{10}$/, "Enter a valid 10-digit WhatsApp number").optional()),
    mapUrl: optionalStr,
    facebook: optionalStr,
    instagram: optionalStr,
    youtube: optionalStr,
    linkedin: optionalStr,
    admissionCoordinatorName: optionalStr,
    admissionPhone: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number").optional()),
    admissionEmail: optionalEmail,
    // ── Related models (arrays) ─────────────────────────────────────────────
    // Sections 13, 14, 18, 19, 22 + custom fields across all sections
    boardResults: zod_1.z.array(boardResultSchema).optional().default([]),
    scholarships: zod_1.z.array(scholarshipSchema).optional().default([]),
    faqs: zod_1.z.array(faqSchema).optional().default([]),
    downloads: zod_1.z.array(downloadSchema).optional().default([]),
    images: zod_1.z.array(galleryImageSchema).optional().default([]),
    customFields: zod_1.z.array(customFieldSchema).optional().default([]),
};
// ── Create schema ─────────────────────────────────────────────────────────────
exports.createSchoolBodySchema = zod_1.z
    .object(schoolBodyFields)
    .refine((data) => data.classesFrom <= data.classesTo, {
    message: "classesFrom must not be greater than classesTo",
    path: ["classesTo"],
});
// ── Update schema (all optional) ──────────────────────────────────────────────
exports.updateSchoolBodySchema = zod_1.z
    .object(schoolBodyFields)
    .partial()
    .refine((data) => data.classesFrom === undefined ||
    data.classesTo === undefined ||
    data.classesFrom <= data.classesTo, {
    message: "classesFrom must not be greater than classesTo",
    path: ["classesTo"],
});
