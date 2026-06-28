export type Role = "PARENT" | "SCHOOL_ADMIN" | "ADMIN";

export type AdminAccessLevel = "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS";

export type InquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "CONVERTED"
  | "CLOSED";

export type BoardType =
  | "CBSE"
  | "ICSE"
  | "IB"
  | "IGCSE"
  | "NIOS"
  | "STATE_BOARD"
  | "OTHER";

export type SchoolType = "BOYS" | "GIRLS" | "CO_ED";

export type MediumType = "HINDI" | "ENGLISH" | "BOTH" | "OTHER";

export type SchoolStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export type GeoCoordinates = {
  latitude: number | null;
  longitude: number | null;
};

export type SchoolListItem = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  board: BoardType;
  stateBoardName: string | null;
  schoolType: SchoolType;
  medium: MediumType;
  mediumOther: string | null;
  classesFrom: string | null;
  classesTo: string | null;
  classesOffered: string[];
  tuitionFeeMonthly: number | null;
  logoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  facilitiesCount: number;
  isFeatured: boolean;
  featuredUntil: Date | string | null;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type AdmissionCoordinator = {
  name?: string;
  phone?: string;
  email?: string;
};

export type AdditionalPhone = {
  label?: string;
  phone?: string;
};

export type BoardResult = {
  id: string;
  year: number | null;
  classLevel: "CLASS_10" | "CLASS_12" | null;
  passPercent: number | null;
  topperName: string | null;
  topperScore: number | null;
};

export type SchoolImage = {
  id: string;
  url: string;
  caption: string | null;
  category: string | null;
};

export type SchoolDetail = {
  id: string;
  name: string;
  slug: string;
  status: SchoolStatus;
  isVisible: boolean;
  isFeatured: boolean;
  featuredUntil: string | null;

  // Core
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  board: BoardType;
  stateBoardName: string | null;
  schoolType: SchoolType;
  medium: MediumType;
  mediumOther: string | null;
  classesFrom: string | null;
  classesTo: string | null;
  totalStudents: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;

  // Basic Info extras
  tagline: string | null;
  establishedYear: number | null;
  managementType: string | null;
  schoolCategory: string | null;
  schoolFormat: string | null;
  affiliationNumber: string | null;
  startTime: string | null;
  endTime: string | null;
  workingDays: number | null;
  languagesOffered: string[];
  recognitionNumber: string | null;
  affiliatedSince: string | null;
  uniformPolicy: string | null;
  canteenAvailable: boolean | null;

  // About
  vision: string | null;
  mission: string | null;
  principalMessage: string | null;

  // Academics
  classesOffered: string[];
  streamsOffered: string[];
  studentTeacherRatio: string | null;
  academicCalendar: string | null;

  // Admissions
  admissionOpen: boolean | null;
  admissionStartDate: string | null;
  admissionEndDate: string | null;
  ageCriteria: string | null;
  requiredDocuments: string | null;
  admissionProcess: string | null;
  admissionCoordinatorName: string | null;
  admissionPhone: string | null;
  admissionEmail: string | null;
  admissionCoordinators: AdmissionCoordinator[] | null;

  // Fees — legacy
  admissionFee: number | null;
  tuitionFeeMonthly: number | null;
  totalAnnualFee: number | null;
  transportFee: number | null;
  hostelFee: number | null;

  // Fees — grade-wise
  averageAnnualFee: number | null;
  earlyChildhoodFee: number | null;
  prePrimaryFee: number | null;
  class1to5Fee: number | null;
  class6to8Fee: number | null;
  class9to10Fee: number | null;
  class11to12Fee: number | null;

  // Facilities & Sports
  facilitiesList: string[];
  facilityCustomGroups: Record<string, string[]> | null;
  sportsList: string[];
  sportsCustomGroups: Record<string, string[]> | null;

  // Infrastructure
  campusArea: string | null;
  totalClassrooms: number | null;
  totalLabs: number | null;
  libraryBooks: number | null;
  hostelCapacity: number | null;
  totalBuses: number | null;

  // Faculty
  totalTeachers: number | null;
  qualifiedTeachers: number | null;
  trainingPrograms: string | null;

  // Programs
  programsList: string[];

  // Student Life
  clubsActivities: string | null;
  culturalActivities: string | null;
  annualEvents: string | null;
  educationalTours: string | null;

  // Achievements
  academicAchievements: string | null;
  sportsAchievements: string | null;
  awardsRecognitions: string | null;

  // Hostel
  hostelAvailable: boolean | null;
  hostelBoys: boolean | null;
  hostelGirls: boolean | null;
  hostelMess: boolean | null;

  // Transport
  transportAvailable: boolean | null;
  transportAreas: string | null;
  gpsTracking: boolean | null;
  totalVehicles: number | null;

  // Safety
  hasCCTV: boolean | null;
  hasGuards: boolean | null;
  hasMedicalRoom: boolean | null;
  hasFireSafety: boolean | null;
  hasVisitorMgmt: boolean | null;

  // Contact extras
  whatsapp: string | null;
  mapUrl: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  linkedin: string | null;
  socialLinks: SocialLink[] | null;
  additionalPhones: AdditionalPhone[] | null;

  // Relations
  images: SchoolImage[];
  boardResults: BoardResult[];
};