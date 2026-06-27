"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { SchoolProfileSidebar } from "./SchoolProfileSidebar";
import {
  BasicInfoSection,
  AboutSchoolSection,
  AcademicsSection,
  AdmissionsSection,
  FeeStructureSection,
  FacilitiesSection,
  SportsSection,
  InfrastructureSection,
  FacultySection,
  ProgramsSection,
  StudentLifeSection,
  AchievementsSection,
  BoardResultsSection,
  ScholarshipsSection,
  HostelSection,
  TransportSection,
  SafetySection,
  GallerySection,
  DownloadsSection,
  ContactSection,
  ReviewsSection,
  FAQsSection,
} from "./formSections";
import type { SectionProps } from "./formSections/types";
import { parseApiError } from "@/lib/api/error";

// ─────────────────────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────────────────────

const customFieldSchema = z.object({
  label: z.string(),
  value: z.string(),
  fieldType: z.enum(["text", "number", "date", "url", "richtext"]),
});

const customGroupMapSchema = z
  .record(z.string(), z.array(z.string()))
  .optional();
const boardResultSchema = z.object({
  id: z.string().optional(),
  year: z.string(),
  classLevel: z.enum(["CLASS_10", "CLASS_12"]),
  passPercent: z.string(),
  topperName: z.string(),
  topScore: z.string(),
});

const scholarshipSchema = z.object({
  name: z.string(),
  eligibility: z.string(),
  benefits: z.string(),
});

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const galleryImageSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
  category: z
    .enum(["campus", "classroom", "sports", "events", "other"])
    .optional(),
});

const downloadFileSchema = z.object({
  label: z.string(),
  url: z.string(),
});

// const optionalLatitudeSchema = z
//   .string()
//   .optional()
//   .or(z.literal(""))
//   .refine((value) => {
//     if (!value) return true;
//     const numeric = Number(value);
//     return Number.isFinite(numeric) && numeric >= -90 && numeric <= 90;
//   }, "Latitude must be between -90 and 90");

// const optionalLongitudeSchema = z
//   .string()
//   .optional()
//   .or(z.literal(""))
//   .refine((value) => {
//     if (!value) return true;
//     const numeric = Number(value);
//     return Number.isFinite(numeric) && numeric >= -180 && numeric <= 180;
//   }, "Longitude must be between -180 and 180");

// ─────────────────────────────────────────────────────────────
// Master schema
// ─────────────────────────────────────────────────────────────

export const schoolProfileSchema = z.object({
  basicInfo: z.object({
    schoolName: z.string().min(3, "School name must be at least 3 characters"),
    tagline: z.string().optional(),
    establishedYear: z.string().optional(),
    managementType: z.string().optional(),
    category: z.string().optional(),
    format: z.string().optional(),
    genderType: z.string().optional(),
    board: z.string().optional(),
    boardLabel: z.string().optional(), // ← ADD
    stateBoardName: z.string().optional(),
    medium: z.string().optional(),
    mediumOther: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    affiliationNumber: z.string().optional(),
    recognitionNumber: z.string().optional(),
    affiliatedSince: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    workingDays: z.string().optional(),
    uniformPolicy: z.string().optional(), // ← ADD
    canteenAvailable: z.string().optional(), // ← ADD
    logoUrl: z.string().optional(),
    coverImageUrl: z.string().optional(),
    classesOffered: z.array(z.string()).optional(),
    languagesOffered: z.array(z.string()).optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  about: z.object({
    about: z.string().optional(),
    vision: z.string().optional(),
    mission: z.string().optional(),
    principalMessage: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  academics: z.object({
    streamsOffered: z.array(z.string()).optional(),
    studentTeacherRatio: z.string().optional(),
    academicCalendar: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  admissions: z.object({
    admissionOpen: z.boolean().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    ageCriteria: z.string().optional(),
    requiredDocuments: z.string().optional(),
    admissionProcess: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  fees: z.object({
    feeMode: z.enum(["simple", "detailed"]).optional(),
    averageAnnualFee: z.string().optional(),
    earlyChildhoodFee: z.string().optional(),
    prePrimaryFee: z.string().optional(),
    class1to5Fee: z.string().optional(),
    class6to8Fee: z.string().optional(),
    class9to10Fee: z.string().optional(),
    class11to12Fee: z.string().optional(),
    customFeeHeads: z.array(customFieldSchema).optional(),
  }),

  facilities: z.object({
    items: z.array(z.string()).optional(),
    customGroups: customGroupMapSchema,
    customFields: z.array(customFieldSchema).optional(),
  }),

  sports: z.object({
    items: z.array(z.string()).optional(),
    customGroups: customGroupMapSchema,
    customFields: z.array(customFieldSchema).optional(),
  }),

  infrastructure: z.object({
    campusArea: z.string().optional(),
    classrooms: z.string().optional(),
    labs: z.string().optional(),
    libraryBooks: z.string().optional(),
    hostelCapacity: z.string().optional(),
    buses: z.string().optional(),
    totalStudents: z.string().optional(),
  }),

  faculty: z.object({
    totalTeachers: z.string().optional(),
    qualifiedTeachers: z.string().optional(),
    trainingPrograms: z.string().optional(),
  }),

  programs: z.object({
    items: z.array(z.string()).optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  studentLife: z.object({
    clubs: z.string().optional(),
    culturalActivities: z.string().optional(),
    annualEvents: z.string().optional(),
    educationalTours: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  achievements: z.object({
    academic: z.string().optional(),
    sports: z.string().optional(),
    awards: z.string().optional(),
    recognitions: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  boardResults: z.object({
    results: z.array(boardResultSchema).optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  scholarships: z.object({
    list: z.array(scholarshipSchema).optional(),
  }),

  hostel: z.object({
    available: z.boolean().optional(),
    boys: z.boolean().optional(),
    girls: z.boolean().optional(),
    capacity: z.string().optional(),
    mess: z.boolean().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  transport: z.object({
    available: z.boolean().optional(),
    coverageAreas: z.string().optional(),
    gpsTracking: z.boolean().optional(),
    vehicles: z.string().optional(),
  }),

  safety: z.object({
    cctv: z.boolean().optional(),
    guards: z.boolean().optional(),
    medicalRoom: z.boolean().optional(),
    fireSafety: z.boolean().optional(),
    visitorManagement: z.boolean().optional(),
  }),

  gallery: z.object({
    images: z.array(galleryImageSchema).optional(),
  }),

  downloads: z.object({
    files: z.array(downloadFileSchema).optional(),
  }),

  contact: z.object({
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    address: z.string().optional(),
    mapUrl: z.string().optional(),
    //latitude: optionalLatitudeSchema,
    //longitude: optionalLongitudeSchema,
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
    // admissionCoordinatorName: z.string().optional(),
    // admissionPhone: z.string().optional(),
    // admissionEmail: z
    //   .string()
    //   .email("Invalid email")
    //   .optional()
    //   .or(z.literal("")),
    socialLinks: z
      .array(
        // ← ADD
        z.object({
          platform: z.string().optional(),
          url: z.string().optional(),
        }),
      )
      .optional(),
    additionalPhones: z
      .array(
        z.object({
          number: z.string(),
          label: z.string(),
        }),
      )
      .optional(),

    admissionCoordinators: z
      .array(
        z.object({
          name: z.string(),
          phone: z.string(),
          email: z.string(),
          designation: z.string(),
        }),
      )
      .optional(),
  }),

  faqs: z.object({
    list: z.array(faqSchema).optional(),
  }),
});

export type SchoolProfileFormData = z.infer<typeof schoolProfileSchema>;

// ─────────────────────────────────────────────────────────────
// Section config list
// ─────────────────────────────────────────────────────────────

const SECTION_LABELS = [
  "Basic Info",
  "About School",
  "Academics",
  "Admissions",
  "Fee Structure",
  "Facilities",
  "Sports",
  "Infrastructure",
  "Faculty",
  "Programs",
  "Student Life",
  "Achievements",
  "Board Results",
  "Scholarships",
  "Hostel",
  "Transport",
  "Safety & Security",
  "Gallery",
  "Downloads",
  "Contact",
  "Reviews",
  "FAQs",
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toNumberOrUndefined(value?: string) {
  if (!value?.trim()) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

type AdditionalPhoneFormValue = {
  number: string;
  label: string;
};

type AdmissionCoordinatorFormValue = {
  name: string;
  phone: string;
  email: string;
  designation: string;
};

function readAdditionalPhones(value: unknown): AdditionalPhoneFormValue[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;

      return {
        number: typeof record.number === "string" ? record.number : "",
        label: typeof record.label === "string" ? record.label : "Other",
      };
    })
    .filter((item): item is AdditionalPhoneFormValue => item !== null);
}

function readAdmissionCoordinators(
  school: Record<string, unknown>,
): AdmissionCoordinatorFormValue[] {
  const raw = school.admissionCoordinators;
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return null;
        }

        const record = item as Record<string, unknown>;

        return {
          name: typeof record.name === "string" ? record.name : "",
          phone: typeof record.phone === "string" ? record.phone : "",
          email: typeof record.email === "string" ? record.email : "",
          designation:
            typeof record.designation === "string" ? record.designation : "",
        };
      })
      .filter((item): item is AdmissionCoordinatorFormValue => item !== null);
  }

  const legacyName =
    typeof school.admissionCoordinatorName === "string"
      ? school.admissionCoordinatorName
      : "";
  const legacyPhone =
    typeof school.admissionPhone === "string" ? school.admissionPhone : "";
  const legacyEmail =
    typeof school.admissionEmail === "string" ? school.admissionEmail : "";

  if (!legacyName && !legacyPhone && !legacyEmail) return [];

  return [
    {
      name: legacyName,
      phone: legacyPhone,
      email: legacyEmail,
      designation: "",
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// API data → form default values mapper
// ─────────────────────────────────────────────────────────────

function mapSchoolToFormData(
  school: Record<string, unknown>,
): SchoolProfileFormData {
  return {
    basicInfo: {
      schoolName: (school.name as string) || "",
      tagline: (school.tagline as string) || "",
      establishedYear: toStringValue(school.establishedYear),
      managementType: (school.managementType as string) || "",
      category: (school.schoolCategory as string) || "",
      format: (school.schoolFormat as string) || "",
      genderType: (school.schoolType as string) || "",
      board: (school.board as string) || "",
      boardLabel: (school.board as string) || "", // ← ADD (same as board initially)
      stateBoardName: (school.stateBoardName as string) || "", // ← ADD
      medium: (school.medium as string) || "",
      mediumOther: (school.mediumOther as string) || "", // ← YE ADD KARO
      city: (school.city as string) || "",
      state: (school.state as string) || "",
      affiliationNumber: (school.affiliationNumber as string) || "",
      recognitionNumber: (school.recognitionNumber as string) || "",
      affiliatedSince: (school.affiliatedSince as string) || "",
      startTime: (school.startTime as string) || "",
      endTime: (school.endTime as string) || "",
      workingDays: (school.workingDays as string) || "",
      uniformPolicy: (school.uniformPolicy as string) || "",
      canteenAvailable: (school.canteenAvailable as string) || "",
      logoUrl: (school.logoUrl as string) || "",
      coverImageUrl: (school.coverImageUrl as string) || "",
      classesOffered: (school.classesOffered as string[]) || [],
      languagesOffered: (school.languagesOffered as string[]) || [],
      customFields: [],
    },
    about: {
      about: (school.description as string) || (school.about as string) || "",
      vision: (school.vision as string) || "",
      mission: (school.mission as string) || "",
      principalMessage: (school.principalMessage as string) || "",
      customFields: [],
    },
    academics: {
      streamsOffered: (school.streamsOffered as string[]) || [],
      studentTeacherRatio: (school.studentTeacherRatio as string) || "",
      academicCalendar: (school.academicCalendar as string) || "",
      customFields: [],
    },
    admissions: {
      admissionOpen: (school.admissionOpen as boolean) || false,
      startDate: (school.admissionStartDate as string) || "",
      endDate: (school.admissionEndDate as string) || "",
      ageCriteria: (school.ageCriteria as string) || "",
      requiredDocuments: (school.requiredDocuments as string) || "",
      admissionProcess: (school.admissionProcess as string) || "",
      customFields: [],
    },
    fees: {
      feeMode: "simple",
      averageAnnualFee: toStringValue(school.averageAnnualFee),
      earlyChildhoodFee: toStringValue(school.earlyChildhoodFee), // ← ADD
      prePrimaryFee: toStringValue(school.prePrimaryFee),
      class1to5Fee: toStringValue(school.class1to5Fee),
      class6to8Fee: toStringValue(school.class6to8Fee),
      class9to10Fee: toStringValue(school.class9to10Fee),
      class11to12Fee: toStringValue(school.class11to12Fee),
      customFeeHeads: [],
    },
    facilities: {
      items: (school.facilitiesList as string[]) || [],
      customGroups:
        (school.facilityCustomGroups as Record<string, string[]>) || {},
      customFields: [],
    },
    sports: {
      items: (school.sportsList as string[]) || [],
      customGroups:
        (school.sportsCustomGroups as Record<string, string[]>) || {},
      customFields: [],
    },
    infrastructure: {
      campusArea: (school.campusArea as string) || "",
      classrooms: toStringValue(school.totalClassrooms ?? school.classrooms),
      labs: toStringValue(school.totalLabs ?? school.labs),
      libraryBooks: toStringValue(school.libraryBooks),
      hostelCapacity: toStringValue(school.hostelCapacity),
      buses: toStringValue(school.totalBuses ?? school.buses),
      totalStudents: toStringValue(school.totalStudents), // ← ADD
    },
    faculty: {
      totalTeachers: toStringValue(school.totalTeachers),
      qualifiedTeachers: toStringValue(school.qualifiedTeachers),
      trainingPrograms: (school.trainingPrograms as string) || "",
    },
    programs: {
      items: (school.programsList as string[]) || [],
      customFields: [],
    },
    studentLife: {
      clubs:
        (school.clubsActivities as string) || (school.clubs as string) || "",
      culturalActivities: (school.culturalActivities as string) || "",
      annualEvents: (school.annualEvents as string) || "",
      educationalTours: (school.educationalTours as string) || "",
      customFields: [],
    },
    achievements: {
      academic: (school.academicAchievements as string) || "",
      sports: (school.sportsAchievements as string) || "",
      awards:
        (school.awardsRecognitions as string) ||
        (school.awards as string) ||
        "",
      recognitions: (school.recognitions as string) || "",
      customFields: [],
    },
    boardResults: {
      results: (
        (school.boardResults as Array<{
          id?: string;
          year?: string | number;
          classLevel?: "CLASS_10" | "CLASS_12" | null;
          passPercent?: string | number | null;
          class10Pass?: string | number | null;
          class12Pass?: string | number | null;
          topperName?: string | null;
          topperScore?: string | null;
        }>) ?? []
      ).flatMap((r) => {
        if (r.classLevel) {
          return [
            {
              id: r.id,
              year: String(r.year ?? ""),
              classLevel: r.classLevel,
              passPercent: String(r.passPercent ?? ""),
              topperName: r.topperName ?? "",
              topScore: r.topperScore ?? "",
            },
          ];
        }

        const entries = [];

        if (r.class10Pass !== null && r.class10Pass !== undefined) {
          entries.push({
            id: r.id,
            year: String(r.year ?? ""),
            classLevel: "CLASS_10" as const,
            passPercent: String(r.class10Pass),
            topperName: r.topperName ?? "",
            topScore: r.topperScore ?? "",
          });
        }

        if (r.class12Pass !== null && r.class12Pass !== undefined) {
          entries.push({
            id: r.id,
            year: String(r.year ?? ""),
            classLevel: "CLASS_12" as const,
            passPercent: String(r.class12Pass),
            topperName: r.topperName ?? "",
            topScore: r.topperScore ?? "",
          });
        }

        if (entries.length === 0) {
          entries.push({
            id: r.id,
            year: String(r.year ?? ""),
            classLevel: "CLASS_10" as const,
            passPercent: "",
            topperName: r.topperName ?? "",
            topScore: r.topperScore ?? "",
          });
        }

        return entries;
      }),
      customFields: [],
    },

    scholarships: { list: [] },
    hostel: {
      available: (school.hostelAvailable as boolean) || false,
      boys:
        (school.hostelBoys as boolean) ||
        (school.boysHostel as boolean) ||
        false,
      girls:
        (school.hostelGirls as boolean) ||
        (school.girlsHostel as boolean) ||
        false,
      capacity: toStringValue(school.hostelCapacity),
      mess:
        (school.hostelMess as boolean) ||
        (school.messAvailable as boolean) ||
        false,
      customFields: [],
    },
    transport: {
      available: (school.transportAvailable as boolean) || false,
      coverageAreas:
        (school.transportAreas as string) ||
        (school.coverageAreas as string) ||
        "",
      gpsTracking: (school.gpsTracking as boolean) || false,
      vehicles: toStringValue(school.totalVehicles ?? school.vehicles),
    },
    safety: {
      cctv: (school.hasCCTV as boolean) || (school.cctv as boolean) || false,
      guards:
        (school.hasGuards as boolean) ||
        (school.securityGuards as boolean) ||
        false,
      medicalRoom:
        (school.hasMedicalRoom as boolean) ||
        (school.medicalRoom as boolean) ||
        false,
      fireSafety:
        (school.hasFireSafety as boolean) ||
        (school.fireSafety as boolean) ||
        false,
      visitorManagement:
        (school.hasVisitorMgmt as boolean) ||
        (school.visitorManagement as boolean) ||
        false,
    },
    gallery: { images: [] },
    downloads: { files: [] },
    contact: {
      phone: (school.phone as string) || "",
      whatsapp: (school.whatsapp as string) || "",
      email: (school.email as string) || "",
      website: (school.website as string) || "",
      address: (school.address as string) || "",
      mapUrl: (school.mapUrl as string) || "",
      //latitude: toStringValue(school.latitude),
      //longitude: toStringValue(school.longitude),
      facebook: (school.facebook as string) || "",
      instagram: (school.instagram as string) || "",
      youtube: (school.youtube as string) || "",
      linkedin: (school.linkedin as string) || "",
      socialLinks: Array.isArray(school.socialLinks) // ← ADD
        ? (
            school.socialLinks as Array<{ platform?: string; url?: string }>
          ).map((s) => ({
            platform: s.platform ?? "",
            url: s.url ?? "",
          }))
        : [],
      additionalPhones: readAdditionalPhones(school.additionalPhones),
      admissionCoordinators: readAdmissionCoordinators(school),
    },
    faqs: { list: [] },
  };
}

// ─────────────────────────────────────────────────────────────
// Draft key
// ─────────────────────────────────────────────────────────────

const DRAFT_KEY = (schoolId: string) => `sf_school_profile_draft_${schoolId}`;

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface SchoolProfileFormProps {
  school: Record<string, unknown>;
  submitEndpoint?: string;
  disableDraft?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function SchoolProfileForm({
  school,
  submitEndpoint = "/api/school/profile",
  disableDraft = false,
}: SchoolProfileFormProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const schoolId = String(school.id ?? "unknown");

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SchoolProfileFormData>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: mapSchoolToFormData(school),
  });

  useEffect(() => {
    if (disableDraft) return;

    try {
      const draft = localStorage.getItem(DRAFT_KEY(schoolId));
      if (draft) {
        const parsed = JSON.parse(draft) as SchoolProfileFormData;
        reset(parsed);
      }
    } catch {
      // ignore malformed draft
    }
  }, [schoolId, reset, disableDraft]);

  const watchedValues = watch();

  useEffect(() => {
    if (disableDraft) return;
    if (!isDirty) return;

    try {
      localStorage.setItem(DRAFT_KEY(schoolId), JSON.stringify(watchedValues));
    } catch {
      // ignore storage errors
    }
  }, [watchedValues, isDirty, schoolId, disableDraft]);

  const sectionProps: SectionProps = {
    control,
    register,
    errors,
    watch,
    setValue,
    isLoading: saving,
  };

  const sections = [
    <BasicInfoSection key="basic" {...sectionProps} />,
    <AboutSchoolSection key="about" {...sectionProps} />,
    <AcademicsSection key="academics" {...sectionProps} />,
    <AdmissionsSection key="admissions" {...sectionProps} />,
    <FeeStructureSection key="fees" {...sectionProps} />,
    <FacilitiesSection key="facilities" {...sectionProps} />,
    <SportsSection key="sports" {...sectionProps} />,
    <InfrastructureSection key="infrastructure" {...sectionProps} />,
    <FacultySection key="faculty" {...sectionProps} />,
    <ProgramsSection key="programs" {...sectionProps} />,
    <StudentLifeSection key="studentLife" {...sectionProps} />,
    <AchievementsSection key="achievements" {...sectionProps} />,
    <BoardResultsSection key="boardResults" {...sectionProps} />,
    <ScholarshipsSection key="scholarships" {...sectionProps} />,
    <HostelSection key="hostel" {...sectionProps} />,
    <TransportSection key="transport" {...sectionProps} />,
    <SafetySection key="safety" {...sectionProps} />,
    <GallerySection key="gallery" {...sectionProps} />,
    <DownloadsSection key="downloads" {...sectionProps} />,
    <ContactSection key="contact" {...sectionProps} />,
    <ReviewsSection key="reviews" {...sectionProps} />,
    <FAQsSection key="faqs" {...sectionProps} />,
  ];

  const totalSections = sections.length;
  const isFirst = activeSection === 0;
  const isLast = activeSection === totalSections - 1;

  const onSubmit = useCallback(
    async (data: SchoolProfileFormData) => {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      setFieldErrors({});

      try {
        const payload = {
          name: data.basicInfo.schoolName,
          tagline: data.basicInfo.tagline || undefined,
          establishedYear: data.basicInfo.establishedYear
            ? Number(data.basicInfo.establishedYear)
            : undefined,
          managementType: data.basicInfo.managementType || undefined,
          schoolCategory: data.basicInfo.category || undefined,
          schoolFormat: data.basicInfo.format || undefined,
          schoolType: data.basicInfo.genderType || undefined,
          board: data.basicInfo.board || undefined,
          stateBoardName: data.basicInfo.stateBoardName || undefined, // ← ADD
          medium: data.basicInfo.medium || undefined,
          mediumOther:
            data.basicInfo.medium === "OTHER" // ← YE ADD KARO
              ? data.basicInfo.mediumOther || undefined
              : undefined,
          city: data.basicInfo.city || undefined,
          state: data.basicInfo.state || undefined,
          affiliationNumber: data.basicInfo.affiliationNumber || undefined,
          recognitionNumber: data.basicInfo.recognitionNumber || undefined, // ← ADD THIS
          affiliatedSince: data.basicInfo.affiliatedSince || undefined, // ← ADD THIS
          startTime: data.basicInfo.startTime || undefined,
          endTime: data.basicInfo.endTime || undefined,
          workingDays: data.basicInfo.workingDays || undefined,
          uniformPolicy: data.basicInfo.uniformPolicy || undefined,
          canteenAvailable: data.basicInfo.canteenAvailable || undefined,
          logoUrl: data.basicInfo.logoUrl || undefined,
          coverImageUrl: data.basicInfo.coverImageUrl || undefined,
          classesOffered: data.basicInfo.classesOffered ?? [],
          languagesOffered: data.basicInfo.languagesOffered ?? [],

          description: data.about.about || undefined,
          vision: data.about.vision || undefined,
          mission: data.about.mission || undefined,
          principalMessage: data.about.principalMessage || undefined,

          streamsOffered: data.academics.streamsOffered ?? [],
          studentTeacherRatio: data.academics.studentTeacherRatio || undefined,
          academicCalendar: data.academics.academicCalendar || undefined, // ← ADD THIS

          admissionOpen: data.admissions.admissionOpen ?? false,
          admissionStartDate: data.admissions.startDate || undefined,
          admissionEndDate: data.admissions.endDate || undefined,
          ageCriteria: data.admissions.ageCriteria || undefined,
          requiredDocuments: data.admissions.requiredDocuments || undefined,
          admissionProcess: data.admissions.admissionProcess || undefined,

          averageAnnualFee: data.fees.averageAnnualFee
            ? Number(data.fees.averageAnnualFee)
            : undefined,
          earlyChildhoodFee: data.fees.earlyChildhoodFee // ← ADD
            ? Number(data.fees.earlyChildhoodFee)
            : undefined,
          prePrimaryFee: data.fees.prePrimaryFee
            ? Number(data.fees.prePrimaryFee)
            : undefined,
          class1to5Fee: data.fees.class1to5Fee
            ? Number(data.fees.class1to5Fee)
            : undefined,
          class6to8Fee: data.fees.class6to8Fee
            ? Number(data.fees.class6to8Fee)
            : undefined,
          class9to10Fee: data.fees.class9to10Fee
            ? Number(data.fees.class9to10Fee)
            : undefined,
          class11to12Fee: data.fees.class11to12Fee
            ? Number(data.fees.class11to12Fee)
            : undefined,

          facilitiesList: data.facilities.items ?? [],
          facilityCustomGroups: data.facilities.customGroups ?? {},
          sportsList: data.sports.items ?? [],
          sportsCustomGroups: data.sports.customGroups ?? {},

          campusArea: data.infrastructure.campusArea || undefined,
          totalClassrooms: data.infrastructure.classrooms
            ? Number(data.infrastructure.classrooms)
            : undefined,
          totalLabs: data.infrastructure.labs
            ? Number(data.infrastructure.labs)
            : undefined,
          libraryBooks: data.infrastructure.libraryBooks
            ? Number(data.infrastructure.libraryBooks)
            : undefined,
          hostelCapacity: data.infrastructure.hostelCapacity
            ? Number(data.infrastructure.hostelCapacity)
            : undefined,
          totalBuses: data.infrastructure.buses
            ? Number(data.infrastructure.buses)
            : undefined,
          totalStudents: data.infrastructure.totalStudents
            ? Number(data.infrastructure.totalStudents)
            : undefined,
          totalTeachers: data.faculty.totalTeachers
            ? Number(data.faculty.totalTeachers)
            : undefined,
          qualifiedTeachers: data.faculty.qualifiedTeachers
            ? Number(data.faculty.qualifiedTeachers)
            : undefined,
          trainingPrograms: data.faculty.trainingPrograms || undefined,

          programsList: data.programs.items ?? [],

          clubsActivities: data.studentLife.clubs || undefined,
          culturalActivities: data.studentLife.culturalActivities || undefined,
          annualEvents: data.studentLife.annualEvents || undefined,
          educationalTours: data.studentLife.educationalTours || undefined,

          academicAchievements: data.achievements.academic || undefined,
          sportsAchievements: data.achievements.sports || undefined,
          // awardsRecognitions: data.achievements.awards || undefined,
          awardsRecognitions:
            [data.achievements.awards, data.achievements.recognitions]
              .filter(Boolean)
              .join("\n\n") || undefined,

          hostelAvailable: data.hostel.available ?? false,
          hostelBoys: data.hostel.boys ?? false,
          hostelGirls: data.hostel.girls ?? false,
          hostelMess: data.hostel.mess ?? false,

          transportAvailable: data.transport.available ?? false,
          transportAreas: data.transport.coverageAreas || undefined,
          gpsTracking: data.transport.gpsTracking ?? false,
          totalVehicles: data.transport.vehicles || undefined,

          hasCCTV: data.safety.cctv ?? false,
          hasGuards: data.safety.guards ?? false,
          hasMedicalRoom: data.safety.medicalRoom ?? false,
          hasFireSafety: data.safety.fireSafety ?? false,
          hasVisitorMgmt: data.safety.visitorManagement ?? false,

          phone: data.contact.phone || undefined,
          whatsapp: data.contact.whatsapp || undefined,
          email: data.contact.email || undefined,
          website: data.contact.website || undefined,
          address: data.contact.address || undefined,
          mapUrl: data.contact.mapUrl || undefined,
          //latitude: toNumberOrUndefined(data.contact.latitude),
          //longitude: toNumberOrUndefined(data.contact.longitude),
          facebook: data.contact.facebook || undefined,
          instagram: data.contact.instagram || undefined,
          youtube: data.contact.youtube || undefined,
          linkedin: data.contact.linkedin || undefined,
          socialLinks: (data.contact.socialLinks ?? []) // ← ADD
            .filter((s) => s.platform?.trim() || s.url?.trim())
            .map((s) => ({
              platform: s.platform?.trim() || "",
              url: s.url?.trim() || "",
            })),
          additionalPhones: (data.contact.additionalPhones ?? [])
            .filter((phone) => phone.number?.trim() || phone.label?.trim())
            .map((phone) => ({
              number: phone.number?.trim() || "",
              label: phone.label?.trim() || "Other",
            })),
          admissionCoordinators: (data.contact.admissionCoordinators ?? [])
            .filter(
              (coordinator) =>
                coordinator.name?.trim() ||
                coordinator.phone?.trim() ||
                coordinator.email?.trim() ||
                coordinator.designation?.trim(),
            )
            .map((coordinator) => ({
              name: coordinator.name?.trim() || "",
              phone: coordinator.phone?.trim() || "",
              email: coordinator.email?.trim() || "",
              designation: coordinator.designation?.trim() || "",
            })),

          // Backward compatibility for current public/admin views that still read
          // the old single coordinator fields.
          admissionCoordinatorName:
            data.contact.admissionCoordinators?.[0]?.name || undefined,
          admissionPhone:
            data.contact.admissionCoordinators?.[0]?.phone || undefined,
          admissionEmail:
            data.contact.admissionCoordinators?.[0]?.email || undefined,

          boardResults: (data.boardResults.results ?? [])
            .filter((r) => r.year?.trim())
            .map((r) => ({
              id: r.id,
              year: String(r.year),
              classLevel: r.classLevel,
              passPercent: r.passPercent || undefined,
              topperName: r.topperName || undefined,
              topperScore: r.topScore || undefined,
            })),

          scholarships: (data.scholarships.list ?? [])
            .filter((s) => s.name?.trim())
            .map((s) => ({
              name: s.name,
              eligibility: s.eligibility || undefined,
              benefits: s.benefits || undefined,
            })),

          faqs: (data.faqs.list ?? [])
            .filter((f) => f.question?.trim() && f.answer?.trim())
            .map((f) => ({
              question: f.question,
              answer: f.answer,
            })),

          downloads: (data.downloads.files ?? [])
            .filter((d) => d.label?.trim() && d.url?.trim())
            .map((d) => ({
              label: d.label,
              url: d.url,
            })),
        };

        const res = await fetch(submitEndpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const parsed = await parseApiError(res);

          if (parsed.category === "field_errors" && parsed.errors) {
            setFieldErrors(parsed.errors);
            setSaveError(parsed.message);
          } else if (parsed.category === "auth") {
            setSaveError(parsed.message);
            setTimeout(() => {
              window.location.href = "/school-login";
            }, 2000);
          } else {
            setSaveError(parsed.message);
          }
          return;
        }

        setFieldErrors({});
        if (!disableDraft) {
          localStorage.removeItem(DRAFT_KEY(schoolId));
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (networkErr: unknown) {
        const parsed = await parseApiError(null, networkErr);
        setSaveError(parsed.message);
      } finally {
        setSaving(false);
      }
    },
    [schoolId, submitEndpoint, disableDraft],
  );

  return (
    <div className="flex gap-6 min-h-screen">
      <SchoolProfileSidebar
        sections={SECTION_LABELS.map((label, index) => ({ index, label }))}
        activeIndex={activeSection}
        onSelect={setActiveSection}
      />

      <div className="flex-1 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-6">{sections[activeSection]}</div>

          {Object.keys(fieldErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200/60 rounded-xl">
              <p className="font-heading text-sm text-red-700 font-semibold mb-2">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(fieldErrors).map(([field, msg]) => (
                  <li key={field} className="font-body text-sm text-red-600">
                    {field}: {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {saveError && Object.keys(fieldErrors).length === 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200/60 rounded-xl">
              <p className="font-body text-body text-red-600">{saveError}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200/60 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="font-body text-body text-green-700">
                Changes saved!
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveSection((i) => Math.max(0, i - 1))}
              disabled={isFirst || saving}
              className="rounded-xl font-heading text-btn"
            >
              ← Previous
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                variant="outline"
                className="rounded-xl font-heading text-btn border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save section
                  </>
                )}
              </Button>

              {isLast ? (
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 bg-blue-600 hover:bg-blue-700 rounded-xl font-heading text-btn shadow-btn"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving…
                    </>
                  ) : (
                    "Save & finish"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() =>
                    setActiveSection((i) => Math.min(totalSections - 1, i + 1))
                  }
                  disabled={saving}
                  className="h-11 bg-blue-600 hover:bg-blue-700 rounded-xl font-heading text-btn shadow-btn"
                >
                  Next →
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
