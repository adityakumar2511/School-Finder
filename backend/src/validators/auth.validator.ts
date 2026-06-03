import { z } from "zod";
import { preprocessEmail, preprocessOptionalString, preprocessTrim } from "../lib/sanitize";

const phonePattern = /^[\d\s+\-()]{7,20}$/;
const mobilePattern = /^\d{10}$/;

export const expectedRoleSchema = z.enum(["PARENT", "SCHOOL_ADMIN", "ADMIN"]);

export const registerParentSchema = z.object({
  name: z.preprocess(preprocessTrim, z.string().min(1, "Name is required")),
  email: z.preprocess(preprocessEmail, z.string().email("Enter a valid email address")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.preprocess(
    preprocessOptionalString,
    z.string().regex(phonePattern, "Enter a valid phone number").optional()
  ),
});

export const loginSchema = z.object({
  email: z.preprocess(
    preprocessEmail,
    z.string().min(1, "Email is required").email("Enter a valid email address")
  ),
  password: z.string().min(1, "Password is required"),
  expectedRole: expectedRoleSchema.optional(),
});

const boardSchema = z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]);
const schoolTypeSchema = z.enum(["BOYS", "GIRLS", "CO_ED"]);
const mediumSchema = z.enum(["HINDI", "ENGLISH", "BOTH"]);

const optionalFee = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().nonnegative().optional()
);

export const registerSchoolSchema = z
  .object({
    schoolName: z.preprocess(
      preprocessOptionalString,
      z.string().min(3, "School name must be at least 3 characters").optional()
    ),
    name: z.preprocess(
      preprocessOptionalString,
      z.string().min(3, "School name must be at least 3 characters").optional()
    ),
    ownerEmail: z.preprocess(
      preprocessEmail,
      z.string().email("Enter a valid owner email address")
    ),
    ownerPassword: z.string().min(8, "Password must be at least 8 characters"),
    ownerName: z.preprocess(preprocessOptionalString, z.string().optional()),
    city: z.preprocess(preprocessTrim, z.string().min(2, "City is required")),
    state: z.preprocess(preprocessTrim, z.string().min(2, "State is required")),
    address: z.preprocess(preprocessTrim, z.string().min(5, "Address is required")),
    pincode: z.preprocess(
      preprocessOptionalString,
      z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode").optional()
    ),
    board: boardSchema,
    schoolType: schoolTypeSchema,
    medium: mediumSchema,
    classesFrom: z.coerce.number().int().min(1).max(12),
    classesTo: z.coerce.number().int().min(1).max(12),
    phone: z.preprocess(
      preprocessTrim,
      z.string().regex(mobilePattern, "Enter a valid 10-digit mobile number")
    ),
    email: z.preprocess(
      preprocessOptionalString,
      z.string().email("Enter a valid school email address").optional()
    ),
    website: z.preprocess(
      preprocessOptionalString,
      z.string().url("Enter a valid website URL").optional()
    ),
    description: z.preprocess(preprocessOptionalString, z.string().max(10000).optional()),
    logoUrl: z.preprocess(preprocessOptionalString, z.string().url().optional()),
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
    name: (data.name ?? data.schoolName) as string,
  }));

export const forgotPasswordSchema = z.object({
  email: z.preprocess(
    preprocessEmail,
    z.string().min(1, "Email is required").email("Enter a valid email address")
  ),
  expectedRole: expectedRoleSchema.optional(),
});

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number"),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number"),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const verifyResetOtpSchema = z.object({
  email: z.preprocess(
    preprocessEmail,
    z.string().min(1, "Email is required").email("Enter a valid email address")
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
      z.string().min(1, "Email is required").email("Enter a valid email address")
    ),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
    expectedRole: expectedRoleSchema.optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterParentInput = z.infer<typeof registerParentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterSchoolInput = z.infer<typeof registerSchoolSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type VerifyResetOtpInput = z.infer<typeof verifyResetOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
