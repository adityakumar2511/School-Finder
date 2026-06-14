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
// Sub-schemas (one per section)
// ─────────────────────────────────────────────────────────────

const customFieldSchema = z.object({
  label: z.string(),
  value: z.string(),
  fieldType: z.enum(["text", "number", "date", "url", "richtext"]),
});

const boardResultSchema = z.object({
  year: z.string(),
  class10Percent: z.string(),
  class12Percent: z.string(),
  topperName: z.string(),
  topScore: z.string(),
  customFields: z.array(customFieldSchema).optional(),
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

// ─────────────────────────────────────────────────────────────
// Master schema — all 22 sections
// ─────────────────────────────────────────────────────────────

export const schoolProfileSchema = z.object({
  // 1. Basic Info
  basicInfo: z.object({
    schoolName: z.string().min(3, "School name must be at least 3 characters"),
    tagline: z.string().optional(),
    establishedYear: z.string().optional(),
    managementType: z.string().optional(),
    category: z.string().optional(),
    format: z.string().optional(),
    genderType: z.string().optional(),
    board: z.string().optional(),
    medium: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    affiliationNumber: z.string().optional(),
    recognitionNumber: z.string().optional(),
    affiliatedSince: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    workingDays: z.string().optional(),
    logoUrl: z.string().optional(),
    coverImageUrl: z.string().optional(),
    classesOffered: z.array(z.string()).optional(),
    languagesOffered: z.array(z.string()).optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 2. About School
  about: z.object({
    about: z.string().optional(),
    vision: z.string().optional(),
    mission: z.string().optional(),
    principalMessage: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 3. Academics
  academics: z.object({
    streamsOffered: z.array(z.string()).optional(),
    studentTeacherRatio: z.string().optional(),
    academicCalendar: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 4. Admissions
  admissions: z.object({
    admissionOpen: z.boolean().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    ageCriteria: z.string().optional(),
    requiredDocuments: z.string().optional(),
    admissionProcess: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 5. Fee Structure
  fees: z.object({
    feeMode: z.enum(["simple", "detailed"]).optional(),
    averageAnnualFee: z.string().optional(),
    prePrimaryFee: z.string().optional(),
    class1to5Fee: z.string().optional(),
    class6to8Fee: z.string().optional(),
    class9to10Fee: z.string().optional(),
    class11to12Fee: z.string().optional(),
    customFeeHeads: z.array(customFieldSchema).optional(),
  }),

  // 6. Facilities
  facilities: z.object({
    items: z.array(z.string()).optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 7. Sports
  sports: z.object({
    items: z.array(z.string()).optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 8. Infrastructure
  infrastructure: z.object({
    campusArea: z.string().optional(),
    classrooms: z.string().optional(),
    labs: z.string().optional(),
    libraryBooks: z.string().optional(),
    hostelCapacity: z.string().optional(),
    buses: z.string().optional(),
  }),

  // 9. Faculty
  faculty: z.object({
    totalTeachers: z.string().optional(),
    qualifiedTeachers: z.string().optional(),
    trainingPrograms: z.string().optional(),
  }),

  // 10. Programs & Specializations
  programs: z.object({
    items: z.array(z.string()).optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 11. Student Life
  studentLife: z.object({
    clubs: z.string().optional(),
    culturalActivities: z.string().optional(),
    annualEvents: z.string().optional(),
    educationalTours: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 12. Achievements
  achievements: z.object({
    academic: z.string().optional(),
    sports: z.string().optional(),
    awards: z.string().optional(),
    recognitions: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 13. Board Results
  boardResults: z.object({
    results: z.array(boardResultSchema).optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 14. Scholarships
  scholarships: z.object({
    list: z.array(scholarshipSchema).optional(),
  }),

  // 15. Hostel
  hostel: z.object({
    available: z.boolean().optional(),
    boys: z.boolean().optional(),
    girls: z.boolean().optional(),
    capacity: z.string().optional(),
    mess: z.boolean().optional(),
    customFields: z.array(customFieldSchema).optional(),
  }),

  // 16. Transport
  transport: z.object({
    available: z.boolean().optional(),
    coverageAreas: z.string().optional(),
    gpsTracking: z.boolean().optional(),
    vehicles: z.string().optional(),
  }),

  // 17. Safety & Security
  safety: z.object({
    cctv: z.boolean().optional(),
    guards: z.boolean().optional(),
    medicalRoom: z.boolean().optional(),
    fireSafety: z.boolean().optional(),
    visitorManagement: z.boolean().optional(),
  }),

  // 18. Gallery
  gallery: z.object({
    images: z.array(galleryImageSchema).optional(),
  }),

  // 19. Downloads
  downloads: z.object({
    files: z.array(downloadFileSchema).optional(),
  }),

  // 20. Contact
  contact: z.object({
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    address: z.string().optional(),
    mapUrl: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
    admissionCoordinatorName: z.string().optional(),
    admissionPhone: z.string().optional(),
    admissionEmail: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
  }),

  // 21. Reviews — read only, no schema needed (display only)

  // 22. FAQs
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
// API data → form default values mapper
// ─────────────────────────────────────────────────────────────

function mapSchoolToFormData(
  school: Record<string, unknown>,
): SchoolProfileFormData {
  return {
    basicInfo: {
      schoolName: (school.name as string) || "",
      tagline: (school.tagline as string) || "",
      establishedYear: school.establishedYear
        ? String(school.establishedYear)
        : "",
      managementType: (school.managementType as string) || "",
      category: (school.schoolCategory as string) || "",
      format: (school.schoolFormat as string) || "",
      genderType: (school.schoolType as string) || "",
      board: (school.board as string) || "",
      medium: (school.medium as string) || "",
      city: (school.city as string) || "",
      state: (school.state as string) || "",
      affiliationNumber: (school.affiliationNumber as string) || "",
      recognitionNumber: (school.recognitionNumber as string) || "",
      affiliatedSince: (school.affiliatedSince as string) || "",
      startTime: (school.startTime as string) || "",
      endTime: (school.endTime as string) || "",
      workingDays: (school.workingDays as string) || "",
      logoUrl: (school.logoUrl as string) || "",
      coverImageUrl: (school.coverImageUrl as string) || "",
      classesOffered: (school.classesOffered as string[]) || [],
      languagesOffered: (school.languagesOffered as string[]) || [],
      customFields: [],
    },
    about: {
      about: (school.about as string) || "",
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
      averageAnnualFee: school.averageAnnualFee
        ? String(school.averageAnnualFee)
        : "",
      prePrimaryFee: (school.prePrimaryFee as string) || "",
      class1to5Fee: (school.class1to5Fee as string) || "",
      class6to8Fee: (school.class6to8Fee as string) || "",
      class9to10Fee: (school.class9to10Fee as string) || "",
      class11to12Fee: (school.class11to12Fee as string) || "",
      customFeeHeads: [],
    },
    facilities: {
      items: (school.facilitiesList as string[]) || [],
      customFields: [],
    },
    sports: {
      items: (school.sportsList as string[]) || [],
      customFields: [],
    },
    infrastructure: {
      campusArea: (school.campusArea as string) || "",
      classrooms: school.classrooms ? String(school.classrooms) : "",
      labs: school.labs ? String(school.labs) : "",
      libraryBooks: school.libraryBooks ? String(school.libraryBooks) : "",
      hostelCapacity: school.hostelCapacity
        ? String(school.hostelCapacity)
        : "",
      buses: school.buses ? String(school.buses) : "",
    },
    faculty: {
      totalTeachers: school.totalTeachers ? String(school.totalTeachers) : "",
      qualifiedTeachers: school.qualifiedTeachers
        ? String(school.qualifiedTeachers)
        : "",
      trainingPrograms: (school.trainingPrograms as string) || "",
    },
    programs: {
      items: (school.programsList as string[]) || [],
      customFields: [],
    },
    studentLife: {
      clubs: (school.clubs as string) || "",
      culturalActivities: (school.culturalActivities as string) || "",
      annualEvents: (school.annualEvents as string) || "",
      educationalTours: (school.educationalTours as string) || "",
      customFields: [],
    },
    achievements: {
      academic: (school.academicAchievements as string) || "",
      sports: (school.sportsAchievements as string) || "",
      awards: (school.awards as string) || "",
      recognitions: (school.recognitions as string) || "",
      customFields: [],
    },
    boardResults: {
      results: [],
      customFields: [],
    },
    scholarships: { list: [] },
    hostel: {
      available: (school.hostelAvailable as boolean) || false,
      boys: (school.boysHostel as boolean) || false,
      girls: (school.girlsHostel as boolean) || false,
      capacity: school.hostelCapacity ? String(school.hostelCapacity) : "",
      mess: (school.messAvailable as boolean) || false,
      customFields: [],
    },
    transport: {
      available: (school.transportAvailable as boolean) || false,
      coverageAreas: (school.coverageAreas as string) || "",
      gpsTracking: (school.gpsTracking as boolean) || false,
      vehicles: school.vehicles ? String(school.vehicles) : "",
    },
    safety: {
      cctv: (school.cctv as boolean) || false,
      guards: (school.securityGuards as boolean) || false,
      medicalRoom: (school.medicalRoom as boolean) || false,
      fireSafety: (school.fireSafety as boolean) || false,
      visitorManagement: (school.visitorManagement as boolean) || false,
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
      facebook: (school.facebook as string) || "",
      instagram: (school.instagram as string) || "",
      youtube: (school.youtube as string) || "",
      linkedin: (school.linkedin as string) || "",
      admissionCoordinatorName:
        (school.admissionCoordinatorName as string) || "",
      admissionPhone: (school.admissionPhone as string) || "",
      admissionEmail: (school.admissionEmail as string) || "",
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
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function SchoolProfileForm({ school }: SchoolProfileFormProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const schoolId = school.id as string;

  // ── Form init ──────────────────────────────────────────────
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

  // ── Draft restore on mount ─────────────────────────────────
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY(schoolId));
      if (draft) {
        const parsed = JSON.parse(draft) as SchoolProfileFormData;
        reset(parsed);
      }
    } catch {
      // ignore malformed draft
    }
  }, [schoolId, reset]);

  // ── Auto-save draft on change ──────────────────────────────
  const watchedValues = watch();
  useEffect(() => {
    if (!isDirty) return;
    try {
      localStorage.setItem(DRAFT_KEY(schoolId), JSON.stringify(watchedValues));
    } catch {
      // ignore storage errors
    }
  }, [watchedValues, isDirty, schoolId]);

  // ── Section props (passed to every section) ────────────────
  const sectionProps: SectionProps = {
    control,
    register,
    errors,
    watch,
    setValue,
    isLoading: saving,
  };

  // ── Section components list ────────────────────────────────
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

  // ── Submit ─────────────────────────────────────────────────
  const onSubmit = useCallback(
    async (data: SchoolProfileFormData) => {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      setFieldErrors({});

      try {
        const payload = {
          // Basic Info
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
          medium: data.basicInfo.medium || undefined,
          city: data.basicInfo.city || undefined,
          state: data.basicInfo.state || undefined,
          affiliationNumber: data.basicInfo.affiliationNumber || undefined,
          startTime: data.basicInfo.startTime || undefined,
          endTime: data.basicInfo.endTime || undefined,
          workingDays: data.basicInfo.workingDays || undefined,
          logoUrl: data.basicInfo.logoUrl || undefined,
          coverImageUrl: data.basicInfo.coverImageUrl || undefined,
          classesOffered: data.basicInfo.classesOffered ?? [],

          // About
          description: data.about.about || undefined,
          vision: data.about.vision || undefined,
          mission: data.about.mission || undefined,
          principalMessage: data.about.principalMessage || undefined,

          // Academics
          streamsOffered: data.academics.streamsOffered ?? [],
          studentTeacherRatio: data.academics.studentTeacherRatio || undefined,

          // Admissions
          admissionOpen: data.admissions.admissionOpen ?? false,
          admissionStartDate: data.admissions.startDate || undefined,
          admissionEndDate: data.admissions.endDate || undefined,
          ageCriteria: data.admissions.ageCriteria || undefined,
          requiredDocuments: data.admissions.requiredDocuments || undefined,
          admissionProcess: data.admissions.admissionProcess || undefined,

          // Fees
          averageAnnualFee: data.fees.averageAnnualFee
            ? Number(data.fees.averageAnnualFee)
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

          // Facilities & Sports
          facilitiesList: data.facilities.items ?? [],
          sportsList: data.sports.items ?? [],

          // Infrastructure
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

          // Faculty
          totalTeachers: data.faculty.totalTeachers
            ? Number(data.faculty.totalTeachers)
            : undefined,
          qualifiedTeachers: data.faculty.qualifiedTeachers
            ? Number(data.faculty.qualifiedTeachers)
            : undefined,
          trainingPrograms: data.faculty.trainingPrograms || undefined,

          // Programs
          programsList: data.programs.items ?? [],

          // Student Life
          clubsActivities: data.studentLife.clubs || undefined,
          culturalActivities: data.studentLife.culturalActivities || undefined,
          annualEvents: data.studentLife.annualEvents || undefined,
          educationalTours: data.studentLife.educationalTours || undefined,

          // Achievements
          academicAchievements: data.achievements.academic || undefined,
          sportsAchievements: data.achievements.sports || undefined,
          awardsRecognitions: data.achievements.awards || undefined,

          // Hostel
          hostelAvailable: data.hostel.available ?? false,
          hostelBoys: data.hostel.boys ?? false,
          hostelGirls: data.hostel.girls ?? false,
          hostelMess: data.hostel.mess ?? false,

          // Transport
          transportAvailable: data.transport.available ?? false,
          transportAreas: data.transport.coverageAreas || undefined,
          gpsTracking: data.transport.gpsTracking ?? false,
          totalVehicles: data.transport.vehicles || undefined,

          // Safety
          hasCCTV: data.safety.cctv ?? false,
          hasGuards: data.safety.guards ?? false,
          hasMedicalRoom: data.safety.medicalRoom ?? false,
          hasFireSafety: data.safety.fireSafety ?? false,
          hasVisitorMgmt: data.safety.visitorManagement ?? false,

          // Contact
          phone: data.contact.phone || undefined,
          whatsapp: data.contact.whatsapp || undefined,
          email: data.contact.email || undefined,
          website: data.contact.website || undefined,
          address: data.contact.address || undefined,
          mapUrl: data.contact.mapUrl || undefined,
          facebook: data.contact.facebook || undefined,
          instagram: data.contact.instagram || undefined,
          youtube: data.contact.youtube || undefined,
          linkedin: data.contact.linkedin || undefined,
          admissionCoordinatorName:
            data.contact.admissionCoordinatorName || undefined,
          admissionPhone: data.contact.admissionPhone || undefined,
          admissionEmail: data.contact.admissionEmail || undefined,

          // Related arrays
          boardResults: (data.boardResults.results ?? [])
            .filter((r) => r.year?.trim())
            .map((r) => ({
              year: r.year,
              class10Pass: r.class10Percent || undefined,
              class12Pass: r.class12Percent || undefined,
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

        const res = await fetch("/api/school/profile", {
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

        // Success
        setFieldErrors({});
        localStorage.removeItem(DRAFT_KEY(schoolId));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

      } catch (networkErr: unknown) {
        const parsed = await parseApiError(null, networkErr);
        setSaveError(parsed.message);
      } finally {
        setSaving(false);
      }
    },
    [schoolId],
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="flex gap-6 min-h-screen">
      {/* Sidebar */}
      <SchoolProfileSidebar
        sections={SECTION_LABELS.map((label, index) => ({ index, label }))}
        activeIndex={activeSection}
        onSelect={setActiveSection}
      />

      {/* Main content */}
      <div className="flex-1 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Active section */}
          <div className="mb-6">{sections[activeSection]}</div>

          {/* Field-level errors summary (shown when backend returns VALIDATION_ERROR) */}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200/60 rounded-xl">
              <p className="font-heading text-sm text-red-700 font-semibold mb-2">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(fieldErrors).map(([field, msg]) => (
                  <li key={field} className="font-body text-sm text-red-600">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* General save error */}
          {saveError && Object.keys(fieldErrors).length === 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200/60 rounded-xl">
              <p className="font-body text-body text-red-600">{saveError}</p>
            </div>
          )}

          {/* Success */}
          {saveSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200/60 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="font-body text-body text-green-700">
                Changes saved!
              </p>
            </div>
          )}

          {/* Navigation footer */}
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
              {/* Save current section */}
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

              {/* Next or Save All */}
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