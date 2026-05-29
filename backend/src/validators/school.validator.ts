import { z } from "zod";
import { preprocessOptionalString, preprocessTrim } from "../lib/sanitize";

const boardSchema = z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]);
const schoolTypeSchema = z.enum(["BOYS", "GIRLS", "CO_ED"]);
const mediumSchema = z.enum(["HINDI", "ENGLISH", "BOTH"]);

const optionalFee = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().nonnegative().optional()
);

const optionalInt = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().nonnegative().optional()
);

const schoolBodyFields = {
  name: z.preprocess(preprocessTrim, z.string().min(3, "School name is required")),
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
    z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number")
  ),
  email: z.preprocess(
    preprocessOptionalString,
    z.string().email("Enter a valid email address").optional()
  ),
  website: z.preprocess(
    preprocessOptionalString,
    z.string().url("Enter a valid website URL").optional()
  ),
  logoUrl: z.preprocess(preprocessOptionalString, z.string().url().optional()),
  description: z.preprocess(preprocessOptionalString, z.string().max(10000).optional()),
  admissionFee: optionalFee,
  tuitionFeeMonthly: optionalFee,
  totalAnnualFee: optionalFee,
  transportFee: optionalFee,
  hostelFee: optionalFee,
  totalStudents: optionalInt,
  establishedYear: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(1800).max(2100).optional()
  ),
};

export const createSchoolBodySchema = z
  .object(schoolBodyFields)
  .refine((data) => data.classesFrom <= data.classesTo, {
    message: "classesFrom must not be greater than classesTo",
    path: ["classesTo"],
  });

export const updateSchoolBodySchema = z
  .object(schoolBodyFields)
  .partial()
  .refine(
    (data) =>
      data.classesFrom === undefined ||
      data.classesTo === undefined ||
      data.classesFrom <= data.classesTo,
    {
      message: "classesFrom must not be greater than classesTo",
      path: ["classesTo"],
    }
  );

export type CreateSchoolInput = z.infer<typeof createSchoolBodySchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolBodySchema>;
