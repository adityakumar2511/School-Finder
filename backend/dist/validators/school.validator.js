"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchoolBodySchema = exports.createSchoolBodySchema = void 0;
const zod_1 = require("zod");
const sanitize_1 = require("../lib/sanitize");
const boardSchema = zod_1.z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]);
const schoolTypeSchema = zod_1.z.enum(["BOYS", "GIRLS", "CO_ED"]);
const mediumSchema = zod_1.z.enum(["HINDI", "ENGLISH", "BOTH"]);
const optionalFee = zod_1.z.preprocess((value) => (value === "" || value === null || value === undefined ? undefined : value), zod_1.z.coerce.number().nonnegative().optional());
const optionalInt = zod_1.z.preprocess((value) => (value === "" || value === null || value === undefined ? undefined : value), zod_1.z.coerce.number().int().nonnegative().optional());
const schoolBodyFields = {
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
    phone: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number")),
    email: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().email("Enter a valid email address").optional()),
    website: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().url("Enter a valid website URL").optional()),
    logoUrl: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().url().optional()),
    description: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().max(10000).optional()),
    admissionFee: optionalFee,
    tuitionFeeMonthly: optionalFee,
    totalAnnualFee: optionalFee,
    transportFee: optionalFee,
    hostelFee: optionalFee,
    totalStudents: optionalInt,
    establishedYear: zod_1.z.preprocess((value) => (value === "" || value === null || value === undefined ? undefined : value), zod_1.z.coerce.number().int().min(1800).max(2100).optional()),
};
exports.createSchoolBodySchema = zod_1.z
    .object(schoolBodyFields)
    .refine((data) => data.classesFrom <= data.classesTo, {
    message: "classesFrom must not be greater than classesTo",
    path: ["classesTo"],
});
exports.updateSchoolBodySchema = zod_1.z
    .object(schoolBodyFields)
    .partial()
    .refine((data) => data.classesFrom === undefined ||
    data.classesTo === undefined ||
    data.classesFrom <= data.classesTo, {
    message: "classesFrom must not be greater than classesTo",
    path: ["classesTo"],
});
