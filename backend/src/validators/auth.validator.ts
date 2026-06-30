import { z } from "zod";
import {
  preprocessEmail,
  preprocessOptionalString,
  preprocessTrim,
} from "../lib/sanitize";

const phonePattern = /^[\d\s+\-()]{7,20}$/;
const mobilePattern = /^\d{10}$/;

export const expectedRoleSchema = z.enum(["PARENT", "SCHOOL_ADMIN", "ADMIN"]);

export const registerParentSchema = z.object({
  name: z.preprocess(preprocessTrim, z.string().min(1, "Name is required")),
  email: z.preprocess(
    preprocessEmail,
    z.string().email("Enter a valid email address"),
  ),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.preprocess(
    preprocessOptionalString,
    z.string().regex(phonePattern, "Enter a valid phone number").optional(),
  ),
});

export const loginSchema = z.object({
  email: z.preprocess(
    preprocessEmail,
    z.string().min(1, "Email is required").email("Enter a valid email address"),
  ),
  password: z.string().min(1, "Password is required"),
  expectedRole: expectedRoleSchema.optional(),
});

const boardSchema = z.enum([
  "CBSE",
  "ICSE",
  "IB",
  "IGCSE",
  "NIOS",
  "STATE_BOARD",
  "OTHER",
]);
const schoolTypeSchema = z.enum(["BOYS", "GIRLS", "CO_ED"]);
const mediumSchema = z.enum(["HINDI", "ENGLISH", "BOTH"]);

const optionalFee = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().nonnegative().optional(),
);

export const registerSchoolSchema = z.object({
  // Required — minimum registration
  name: z.preprocess(
    preprocessTrim,
    z.string().min(3, "School name must be at least 3 characters"),
  ),
  ownerEmail: z.preprocess(
    preprocessEmail,
    z.string().email("Enter a valid email address"),
  ),
  ownerPassword: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.preprocess(
    preprocessTrim,
    z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  ),

  // Optional — filled later from dashboard
  ownerName: z.preprocess(preprocessOptionalString, z.string().optional()),
  city: z.preprocess(preprocessOptionalString, z.string().optional()),
  state: z.preprocess(preprocessOptionalString, z.string().optional()),
  address: z.preprocess(preprocessOptionalString, z.string().optional()),
  pincode: z.preprocess(
    preprocessOptionalString,
    z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode").optional(),
  ),
  // board: z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]).optional(),
  board: boardSchema.optional(),
stateBoardName: z.string().trim().max(100).optional(),
  schoolType: z.enum(["BOYS", "GIRLS", "CO_ED"]).optional(),
  medium: z.enum(["HINDI", "ENGLISH", "BOTH", "OTHER"]).optional(),
  classesFrom: z.coerce.number().int().min(1).max(12).optional(),
  classesTo: z.coerce.number().int().min(1).max(12).optional(),
  email: z.preprocess(
    preprocessOptionalString,
    z.string().email("Enter a valid school email").optional(),
  ),
  website: z.preprocess(
    preprocessOptionalString,
    z.string().url("Enter a valid website URL").optional(),
  ),
  description: z.preprocess(
    preprocessOptionalString,
    z.string().max(10000).optional(),
  ),
  establishedYear: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  ),
  totalStudents: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().nonnegative().optional(),
  ),
  logoUrl: z.preprocess(preprocessOptionalString, z.string().url().optional()),
  admissionFee: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().nonnegative().optional(),
  ),
  tuitionFeeMonthly: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().nonnegative().optional(),
  ),
  totalAnnualFee: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().nonnegative().optional(),
  ),
  transportFee: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().nonnegative().optional(),
  ),
  hostelFee: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().nonnegative().optional(),
  ),
});


export const forgotPasswordSchema = z.object({
  email: z.preprocess(
    preprocessEmail,
    z.string().min(1, "Email is required").email("Enter a valid email address"),
  ),
  expectedRole: expectedRoleSchema.optional(),
});

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number"),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const verifyResetOtpSchema = z.object({
  email: z.preprocess(
    preprocessEmail,
    z.string().min(1, "Email is required").email("Enter a valid email address"),
  ),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
  expectedRole: expectedRoleSchema.optional(),
});

export const resetPasswordSchema = z
  .object({
    email: z.preprocess(
      preprocessEmail,
      z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    ),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    expectedRole: expectedRoleSchema.optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Add this near other schemas in auth.validator.ts

export const updateUserRoleSchema = z.object({
  role: z.enum(["PARENT", "SCHOOL_ADMIN", "ADMIN"]),
});


export const addParentSchema = z.object({
  name: z.preprocess(preprocessTrim, z.string().min(1, "Name is required")),
  email: z.preprocess(
    preprocessEmail,
    z.string().email("Enter a valid email address"),
  ),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.preprocess(
    preprocessTrim,
    z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  ),
});

export const adminAccessLevelSchema = z.enum([
  "READ_ONLY",
  "READ_WRITE",
  "FULL_ACCESS",
]);
 
export const addAdminSchema = z
  .object({
    name: z.preprocess(preprocessTrim, z.string().min(1, "Name is required")),
    email: z.preprocess(
      preprocessEmail,
      z.string().email("Enter a valid email address"),
    ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    adminAccessLevel: adminAccessLevelSchema,
  })
  .strict(); // rejects any extra keys including isSuperAdmin injection attempts

export const adminUpdateUserSchema = z
  .object({
    name: z.preprocess(
      preprocessTrim,
      z.string().min(2, "Name must be at least 2 characters").optional(),
    ),
    email: z.preprocess(
      preprocessEmail,
      z.string().email("Enter a valid email address").optional(),
    ),
    phone: z.preprocess(
      preprocessOptionalString,
      z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number").optional(),
    ),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });



export type RegisterParentInput = z.infer<typeof registerParentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterSchoolInput = z.infer<typeof registerSchoolSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type VerifyResetOtpInput = z.infer<typeof verifyResetOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AddParentInput = z.infer<typeof addParentSchema>;
export type AddAdminInput = z.infer<typeof addAdminSchema>;
export type AdminAccessLevelValue = z.infer<typeof adminAccessLevelSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;