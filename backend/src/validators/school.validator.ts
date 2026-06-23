import { z } from "zod";
import {
  preprocessIndianPhone,
  preprocessOptionalString,
  preprocessTrim,
} from "../lib/sanitize";

// ── Enum schemas ──────────────────────────────────────────────────────────────
const boardSchema = z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]);
const schoolTypeSchema = z.enum(["BOYS", "GIRLS", "CO_ED"]);
const mediumSchema = z.enum(["HINDI", "ENGLISH", "BOTH"]);

// ── Reusable preprocessors ────────────────────────────────────────────────────
const optionalFee = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().nonnegative().optional(),
);

const optionalBool = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.boolean().optional(),
);

const optionalCoordinate = (min: number, max: number, label: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce
      .number()
      .min(min, `${label} must be at least ${min}`)
      .max(max, `${label} must be at most ${max}`)
      .optional(),
  );

const optionalStr = z.preprocess(preprocessOptionalString, z.string().optional());

const optionalTextStr = z.preprocess(
  preprocessOptionalString,
  z.string().max(10000).optional(),
);

const optionalUrl = z.preprocess(
  preprocessOptionalString,
  z.string().url("Enter a valid URL").optional(),
);

const optionalEmail = z.preprocess(
  preprocessOptionalString,
  z.string().email("Enter a valid email").optional(),
);

const stringArray = z.array(z.string()).optional().default([]);

// ── Nested schemas for related models ────────────────────────────────────────

const boardResultSchema = z.object({
  id: z.string().optional(),
  year: z.string().min(4, "Year is required"),
  class10Pass: optionalStr,
  class12Pass: optionalStr,
  topperName: optionalStr,
  topperScore: optionalStr,
});

const scholarshipSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Scholarship name is required"),
  eligibility: optionalTextStr,
  benefits: optionalTextStr,
});

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

const downloadSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Enter a valid download URL"),
});

const customFieldSchema = z.object({
  id: z.string().optional(),
  section: z.string().min(1),
  label: z.string().min(1, "Field label is required"),
  value: z.string(),
  fieldType: z.enum(["text", "number", "date", "url", "richtext"]).default("text"),
});

const galleryImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Enter a valid image URL"),
  caption: optionalStr,
  category: optionalStr,
});

// ── Core school body fields (create) ─────────────────────────────────────────
const schoolBodyFields = {
  // Identity (required on create)
  name: z.preprocess(preprocessTrim, z.string().min(3, "School name is required")),
  city: z.preprocess(preprocessTrim, z.string().min(2, "City is required")),
  state: z.preprocess(preprocessTrim, z.string().min(2, "State is required")),
  address: z.preprocess(preprocessTrim, z.string().min(5, "Address is required")),
  pincode: z.preprocess(
    preprocessOptionalString,
    z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode").optional(),
  ),

  // Phase 8 — Google Maps coordinates
  latitude: optionalCoordinate(-90, 90, "Latitude"),
  longitude: optionalCoordinate(-180, 180, "Longitude"),

  board: boardSchema,
  schoolType: schoolTypeSchema,
  medium: mediumSchema,
  classesFrom: z.coerce.number().int().min(1).max(12),
  classesTo: z.coerce.number().int().min(1).max(12),
  phone: z.preprocess(
    preprocessIndianPhone,
    z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  ),
  email: optionalEmail,
  website: optionalUrl,
  logoUrl: z.preprocess(preprocessOptionalString, z.string().url().optional()),
  coverImageUrl: z.preprocess(preprocessOptionalString, z.string().url().optional()),
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
  establishedYear: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(1800).max(2100).optional(),
  ),
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
  admissionStartDate: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.date().optional(),
  ),
  admissionEndDate: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.date().optional(),
  ),
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
  whatsapp: z.preprocess(
    preprocessOptionalString,
    z.string().regex(/^\d{10}$/, "Enter a valid 10-digit WhatsApp number").optional(),
  ),
  mapUrl: optionalStr,
  facebook: optionalStr,
  instagram: optionalStr,
  youtube: optionalStr,
  linkedin: optionalStr,
  admissionCoordinatorName: optionalStr,
  admissionPhone: z.preprocess(
    preprocessOptionalString,
    z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number").optional(),
  ),
  admissionEmail: optionalEmail,

  // ── Related models (arrays) ─────────────────────────────────────────────
  boardResults: z.array(boardResultSchema).optional().default([]),
  scholarships: z.array(scholarshipSchema).optional().default([]),
  faqs: z.array(faqSchema).optional().default([]),
  downloads: z.array(downloadSchema).optional().default([]),
  images: z.array(galleryImageSchema).optional().default([]),
  customFields: z.array(customFieldSchema).optional().default([]),
};

// ── Create schema ─────────────────────────────────────────────────────────────
export const createSchoolBodySchema = z
  .object(schoolBodyFields)
  .refine((data) => data.classesFrom <= data.classesTo, {
    message: "classesFrom must not be greater than classesTo",
    path: ["classesTo"],
  });

// ── Update schema (all optional) ──────────────────────────────────────────────
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
    },
  );

export type CreateSchoolInput = z.infer<typeof createSchoolBodySchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolBodySchema>;

// Re-export nested types for use in controller
export type BoardResultInput = z.infer<typeof boardResultSchema>;
export type ScholarshipInput = z.infer<typeof scholarshipSchema>;
export type FAQInput = z.infer<typeof faqSchema>;
export type DownloadInput = z.infer<typeof downloadSchema>;
export type CustomFieldInput = z.infer<typeof customFieldSchema>;
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;