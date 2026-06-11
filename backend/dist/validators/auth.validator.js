"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verifyResetOtpSchema = exports.verifyOtpSchema = exports.sendOtpSchema = exports.forgotPasswordSchema = exports.registerSchoolSchema = exports.loginSchema = exports.registerParentSchema = exports.expectedRoleSchema = void 0;
const zod_1 = require("zod");
const sanitize_1 = require("../lib/sanitize");
const phonePattern = /^[\d\s+\-()]{7,20}$/;
const mobilePattern = /^\d{10}$/;
exports.expectedRoleSchema = zod_1.z.enum(["PARENT", "SCHOOL_ADMIN", "ADMIN"]);
exports.registerParentSchema = zod_1.z.object({
    name: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().min(1, "Name is required")),
    email: zod_1.z.preprocess(sanitize_1.preprocessEmail, zod_1.z.string().email("Enter a valid email address")),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    phone: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().regex(phonePattern, "Enter a valid phone number").optional()),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.preprocess(sanitize_1.preprocessEmail, zod_1.z.string().min(1, "Email is required").email("Enter a valid email address")),
    password: zod_1.z.string().min(1, "Password is required"),
    expectedRole: exports.expectedRoleSchema.optional(),
});
const boardSchema = zod_1.z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]);
const schoolTypeSchema = zod_1.z.enum(["BOYS", "GIRLS", "CO_ED"]);
const mediumSchema = zod_1.z.enum(["HINDI", "ENGLISH", "BOTH"]);
const optionalFee = zod_1.z.preprocess((value) => value === "" || value === null || value === undefined ? undefined : value, zod_1.z.coerce.number().nonnegative().optional());
exports.registerSchoolSchema = zod_1.z
    .object({
    schoolName: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().min(3, "School name must be at least 3 characters").optional()),
    name: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().min(3, "School name must be at least 3 characters").optional()),
    ownerEmail: zod_1.z.preprocess(sanitize_1.preprocessEmail, zod_1.z.string().email("Enter a valid owner email address")),
    ownerPassword: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    ownerName: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().optional()),
    city: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().min(2, "City is required")),
    state: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().min(2, "State is required")),
    address: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().min(5, "Address is required")),
    pincode: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z
        .string()
        .regex(/^\d{6}$/, "Enter a valid 6-digit pincode")
        .optional()),
    board: boardSchema,
    schoolType: schoolTypeSchema,
    medium: mediumSchema,
    classesFrom: zod_1.z.coerce.number().int().min(1).max(12),
    classesTo: zod_1.z.coerce.number().int().min(1).max(12),
    phone: zod_1.z.preprocess(sanitize_1.preprocessTrim, zod_1.z.string().regex(mobilePattern, "Enter a valid 10-digit mobile number")),
    email: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().email("Enter a valid school email address").optional()),
    website: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().url("Enter a valid website URL").optional()),
    description: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().max(10000).optional()),
    establishedYear: zod_1.z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), zod_1.z.coerce
        .number()
        .int()
        .min(1800)
        .max(new Date().getFullYear())
        .optional()),
    totalStudents: zod_1.z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), zod_1.z.coerce.number().int().nonnegative().optional()),
    transportFee: optionalFee,
    hostelFee: optionalFee,
    logoUrl: zod_1.z.preprocess(sanitize_1.preprocessOptionalString, zod_1.z.string().url().optional()),
    admissionFee: optionalFee,
    tuitionFeeMonthly: optionalFee,
    totalAnnualFee: optionalFee,
})
    .refine((data) => Boolean(data.name || data.schoolName), {
    message: "School name is required",
    path: ["name"],
})
    .refine((data) => data.classesFrom <= data.classesTo, {
    message: "classesFrom must not be greater than classesTo",
    path: ["classesTo"],
})
    .transform((data) => ({
    ...data,
    name: (data.name ?? data.schoolName),
}));
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.preprocess(sanitize_1.preprocessEmail, zod_1.z.string().min(1, "Email is required").email("Enter a valid email address")),
    expectedRole: exports.expectedRoleSchema.optional(),
});
exports.sendOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number"),
});
exports.verifyOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number"),
    otp: zod_1.z
        .string()
        .length(6)
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
});
exports.verifyResetOtpSchema = zod_1.z.object({
    email: zod_1.z.preprocess(sanitize_1.preprocessEmail, zod_1.z.string().min(1, "Email is required").email("Enter a valid email address")),
    otp: zod_1.z
        .string()
        .length(6)
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
    expectedRole: exports.expectedRoleSchema.optional(),
});
exports.resetPasswordSchema = zod_1.z
    .object({
    email: zod_1.z.preprocess(sanitize_1.preprocessEmail, zod_1.z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address")),
    newPassword: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters"),
    expectedRole: exports.expectedRoleSchema.optional(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
