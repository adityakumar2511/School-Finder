// frontend/src/app/schools/[slug]/page.tsx
// School detail page — Server Component
// Dynamic rendering: only sections with actual data are shown

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { backendFetch } from "@/lib/api/server";
import { fetchSchoolBySlug } from "@/lib/data/schools-public";
import { IMAGE_BLUR_DATA_URL } from "@/lib/upload/image-placeholder";
import { optimizeCloudinaryUrl } from "@/lib/upload/cloudinary-url";
import JsonLd from "@/components/shared/seo/JsonLd";
import InquiryModal from "@/components/public/schools/InquiryModal";
import FavouriteButton from "@/components/public/schools/FavouriteButton";
import {
  buildSchoolMetadata,
  buildEducationalOrganizationJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/seo";

const TrackSchoolView = dynamic(
  () => import("@/components/parent/TrackSchoolView"),
  { loading: () => null }
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface SchoolImage {
  id: string;
  url: string;
  caption: string | null;
  category: string | null;
}

interface BoardResult {
  id: string;
  year: string;
  class10Pass: string | null;
  class12Pass: string | null;
  topperName: string | null;
  topperScore: string | null;
}

interface Scholarship {
  id: string;
  name: string;
  eligibility: string | null;
  benefits: string | null;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Download {
  id: string;
  label: string;
  url: string;
}

interface CustomField {
  id: string;
  section: string;
  label: string;
  value: string;
  fieldType: string;
}

interface Facility {
  facility: { id: string; name: string; icon: string | null };
}

interface SchoolDetail {
  id: string;
  name: string;
  slug: string;
  status: string;
  ownerId: string;

  // Core
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  board: "CBSE" | "ICSE" | "UP_BOARD" | "OTHER";
  schoolType: "BOYS" | "GIRLS" | "CO_ED";
  medium: "HINDI" | "ENGLISH" | "BOTH";
  classesFrom: number;
  classesTo: number;
  totalStudents: number | null;
  phone: string;
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
  workingDays: string | null;

  // About
  vision: string | null;
  mission: string | null;
  principalMessage: string | null;

  // Academics
  classesOffered: string[];
  streamsOffered: string[];
  studentTeacherRatio: string | null;

  // Admissions
  admissionOpen: boolean;
  admissionStartDate: string | null;
  admissionEndDate: string | null;
  ageCriteria: string | null;
  requiredDocuments: string | null;
  admissionProcess: string | null;

  // Fees
  admissionFee: number | null;
  tuitionFeeMonthly: number | null;
  totalAnnualFee: number | null;
  transportFee: number | null;
  hostelFee: number | null;
  averageAnnualFee: number | null;
  prePrimaryFee: number | null;
  class1to5Fee: number | null;
  class6to8Fee: number | null;
  class9to10Fee: number | null;
  class11to12Fee: number | null;

  // Facilities & Sports
  facilitiesList: string[];
  sportsList: string[];

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
  hostelAvailable: boolean;
  hostelBoys: boolean;
  hostelGirls: boolean;
  hostelMess: boolean;

  // Transport
  transportAvailable: boolean;
  transportAreas: string | null;
  gpsTracking: boolean;
  totalVehicles: string | null;

  // Safety
  hasCCTV: boolean;
  hasGuards: boolean;
  hasMedicalRoom: boolean;
  hasFireSafety: boolean;
  hasVisitorMgmt: boolean;

  // Contact extras
  whatsapp: string | null;
  mapUrl: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  linkedin: string | null;
  admissionCoordinatorName: string | null;
  admissionPhone: string | null;
  admissionEmail: string | null;

  // Relations
  owner: { name: string | null };
  images: SchoolImage[];
  facilities: Facility[];
  boardResults: BoardResult[];
  scholarships: Scholarship[];
  faqs: FAQ[];
  downloads: Download[];
  customFields: CustomField[];
}

async function getSchool(slug: string): Promise<SchoolDetail | null> {
  return fetchSchoolBySlug(slug) as Promise<SchoolDetail | null>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchool(slug);

  if (!school || school.status !== "APPROVED") {
    return {
      title: "School Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildSchoolMetadata({
    name: school.name,
    slug: school.slug,
    description: school.description,
    city: school.city,
    state: school.state,
    address: school.address,
    pincode: school.pincode,
    board: school.board,
    phone: school.phone,
    website: school.website,
    logoUrl: school.logoUrl,
    classesFrom: school.classesFrom,
    classesTo: school.classesTo,
  });
}

// ─── Label Helpers ─────────────────────────────────────────────────────────────

const BOARD_LABEL: Record<string, string> = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  UP_BOARD: "UP Board",
  OTHER: "Other Board",
};
const TYPE_LABEL: Record<string, string> = {
  BOYS: "Boys School",
  GIRLS: "Girls School",
  CO_ED: "Co-Ed School",
};
const MEDIUM_LABEL: Record<string, string> = {
  HINDI: "Hindi Medium",
  ENGLISH: "English Medium",
  BOTH: "Hindi + English Medium",
};

function fmtINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function fmt(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Section visibility guards ────────────────────────────────────────────────

function hasAbout(s: SchoolDetail) {
  return !!(s.description || s.vision || s.mission || s.principalMessage);
}

function hasAcademics(s: SchoolDetail) {
  return !!(
    s.classesOffered?.length ||
    s.streamsOffered?.length ||
    s.studentTeacherRatio ||
    s.totalStudents ||
    s.establishedYear
  );
}

function hasAdmissions(s: SchoolDetail) {
  return !!(
    s.admissionOpen ||
    s.admissionStartDate ||
    s.admissionEndDate ||
    s.ageCriteria ||
    s.requiredDocuments ||
    s.admissionProcess
  );
}

function hasFees(s: SchoolDetail) {
  return !!(
    s.averageAnnualFee ||
    s.prePrimaryFee ||
    s.class1to5Fee ||
    s.class6to8Fee ||
    s.class9to10Fee ||
    s.class11to12Fee ||
    s.admissionFee ||
    s.tuitionFeeMonthly ||
    s.totalAnnualFee ||
    s.transportFee ||
    s.hostelFee
  );
}

function hasFacilities(s: SchoolDetail) {
  return !!(s.facilitiesList?.length || s.facilities?.length);
}

function hasSports(s: SchoolDetail) {
  return !!s.sportsList?.length;
}

function hasInfrastructure(s: SchoolDetail) {
  return !!(
    s.campusArea ||
    s.totalClassrooms ||
    s.totalLabs ||
    s.libraryBooks ||
    s.hostelCapacity ||
    s.totalBuses
  );
}

function hasFaculty(s: SchoolDetail) {
  return !!(s.totalTeachers || s.qualifiedTeachers || s.trainingPrograms);
}

function hasPrograms(s: SchoolDetail) {
  return !!s.programsList?.length;
}

function hasStudentLife(s: SchoolDetail) {
  return !!(
    s.clubsActivities ||
    s.culturalActivities ||
    s.annualEvents ||
    s.educationalTours
  );
}

function hasAchievements(s: SchoolDetail) {
  return !!(
    s.academicAchievements ||
    s.sportsAchievements ||
    s.awardsRecognitions
  );
}

function hasHostel(s: SchoolDetail) {
  return s.hostelAvailable;
}

function hasTransport(s: SchoolDetail) {
  return s.transportAvailable;
}

function hasSafety(s: SchoolDetail) {
  return !!(
    s.hasCCTV ||
    s.hasGuards ||
    s.hasMedicalRoom ||
    s.hasFireSafety ||
    s.hasVisitorMgmt
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [school, session] = await Promise.all([getSchool(slug), auth()]);

  if (!school) notFound();
  if (school.status !== "APPROVED") notFound();

  const isParent = session?.user?.role === "PARENT";
  let initialFavourited = false;

  if (isParent) {
    const { ok, data } = await backendFetch<{
      schools?: Array<{ id: string }>;
    }>("/api/parent/favourites?page=1&limit=1000");

    initialFavourited = Boolean(
      ok && data?.schools?.some((item) => item.id === school.id)
    );
  }

  const structuredData = [
    buildEducationalOrganizationJsonLd({
      name: school.name,
      slug: school.slug,
      description: school.description,
      city: school.city,
      state: school.state,
      address: school.address,
      pincode: school.pincode,
      board: school.board,
      phone: school.phone,
      website: school.website,
      logoUrl: school.logoUrl,
      classesFrom: school.classesFrom,
      classesTo: school.classesTo,
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Schools", path: "/schools" },
      { name: school.name, path: `/schools/${school.slug}` },
    ]),
  ];

  const optimizedLogoUrl = optimizeCloudinaryUrl(school.logoUrl, { width: 160 });

  const hasSocialLinks = !!(
    school.facebook ||
    school.instagram ||
    school.youtube ||
    school.linkedin
  );

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <JsonLd data={structuredData} />
      {isParent && (
        <TrackSchoolView
          slug={school.slug}
          name={school.name}
          city={school.city}
          logoUrl={school.logoUrl}
        />
      )}

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="bg-hero-gradient text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
              {optimizedLogoUrl ? (
                <Image
                  src={optimizedLogoUrl}
                  alt={`${school.name} logo`}
                  width={80}
                  height={80}
                  sizes="80px"
                  priority
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="font-heading font-bold text-2xl text-white">
                  {getInitials(school.name)}
                </span>
              )}
            </div>

            {/* Name + Meta */}
            <div className="flex-1 min-w-0">
              <nav className="flex items-center gap-2 text-blue-200 text-meta mb-2">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href="/schools" className="hover:text-white transition-colors">Schools</Link>
                <span>/</span>
                <span className="text-white truncate">{school.name}</span>
              </nav>

              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="font-heading font-bold text-h1 text-white leading-tight">
                    {school.name}
                  </h1>
                  {school.tagline && (
                    <p className="text-blue-200 text-body-sm mt-1 italic">{school.tagline}</p>
                  )}
                </div>
                <FavouriteButton
                  schoolId={school.id}
                  initialFavourited={initialFavourited}
                />
              </div>

              <p className="text-blue-200 text-body mt-1">
                {school.address}, {school.city}, {school.state}
                {school.pincode ? ` — ${school.pincode}` : ""}
              </p>

              {/* Badge row */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-label">
                  {BOARD_LABEL[school.board]}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-label">
                  {TYPE_LABEL[school.schoolType]}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-label">
                  {MEDIUM_LABEL[school.medium]}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-label">
                  Class {school.classesFrom}–{school.classesTo}
                </span>
                {school.establishedYear && (
                  <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-label">
                    Est. {school.establishedYear}
                  </span>
                )}
                {school.admissionOpen && (
                  <span className="px-3 py-1 rounded-full bg-green-500/80 border border-green-400/40 text-white text-label">
                    Admissions Open
                  </span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="sm:text-right flex-shrink-0">
              <InquiryModal schoolId={school.id} schoolName={school.name} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left — Main Sections ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* About */}
          {hasAbout(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-4">About</h2>
              <div className="space-y-4">
                {school.description && (
                  <p className="font-body text-body text-gray-700 leading-relaxed whitespace-pre-line">
                    {school.description}
                  </p>
                )}
                {school.vision && (
                  <div>
                    <p className="font-heading font-semibold text-label text-blue-700 mb-1">Vision</p>
                    <p className="font-body text-body text-gray-700 leading-relaxed">{school.vision}</p>
                  </div>
                )}
                {school.mission && (
                  <div>
                    <p className="font-heading font-semibold text-label text-blue-700 mb-1">Mission</p>
                    <p className="font-body text-body text-gray-700 leading-relaxed">{school.mission}</p>
                  </div>
                )}
                {school.principalMessage && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="font-heading font-semibold text-label text-blue-700 mb-1">
                      Message from the Principal
                    </p>
                    <p className="font-body text-body text-gray-700 leading-relaxed italic">
                      &ldquo;{school.principalMessage}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Academic Details */}
          {hasAcademics(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Academic Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoTile label="Board" value={BOARD_LABEL[school.board]} />
                <InfoTile label="School Type" value={TYPE_LABEL[school.schoolType]} />
                <InfoTile label="Medium" value={MEDIUM_LABEL[school.medium]} />
                <InfoTile label="Classes" value={`Class ${school.classesFrom} to ${school.classesTo}`} />
                {school.totalStudents && (
                  <InfoTile label="Total Students" value={school.totalStudents.toLocaleString("en-IN")} />
                )}
                {school.establishedYear && (
                  <InfoTile label="Established" value={String(school.establishedYear)} />
                )}
                {school.studentTeacherRatio && (
                  <InfoTile label="Student:Teacher Ratio" value={school.studentTeacherRatio} />
                )}
                {school.managementType && (
                  <InfoTile label="Management" value={school.managementType} />
                )}
                {school.schoolFormat && (
                  <InfoTile label="Format" value={school.schoolFormat} />
                )}
                {school.affiliationNumber && (
                  <InfoTile label="Affiliation No." value={school.affiliationNumber} />
                )}
                {school.workingDays && (
                  <InfoTile label="Working Days" value={school.workingDays} />
                )}
                {(school.startTime || school.endTime) && (
                  <InfoTile
                    label="School Timings"
                    value={[school.startTime, school.endTime].filter(Boolean).join(" – ")}
                  />
                )}
              </div>

              {school.classesOffered?.length > 0 && (
                <div className="mt-5">
                  <p className="font-heading font-semibold text-label text-gray-500 mb-2">Classes Offered</p>
                  <div className="flex flex-wrap gap-2">
                    {school.classesOffered.map((c) => (
                      <span key={c} className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-label">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {school.streamsOffered?.length > 0 && (
                <div className="mt-4">
                  <p className="font-heading font-semibold text-label text-gray-500 mb-2">Streams Offered</p>
                  <div className="flex flex-wrap gap-2">
                    {school.streamsOffered.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-label">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Admissions */}
          {hasAdmissions(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-heading font-bold text-h2 text-gray-800">Admissions</h2>
                {school.admissionOpen && (
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-meta font-medium">
                    Open
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                {school.admissionStartDate && (
                  <InfoTile label="Opens On" value={fmt(school.admissionStartDate) ?? ""} />
                )}
                {school.admissionEndDate && (
                  <InfoTile label="Last Date" value={fmt(school.admissionEndDate) ?? ""} />
                )}
                {school.ageCriteria && (
                  <InfoTile label="Age Criteria" value={school.ageCriteria} />
                )}
              </div>
              {school.requiredDocuments && (
                <div className="mb-4">
                  <p className="font-heading font-semibold text-label text-gray-500 mb-1">Required Documents</p>
                  <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.requiredDocuments}</p>
                </div>
              )}
              {school.admissionProcess && (
                <div>
                  <p className="font-heading font-semibold text-label text-gray-500 mb-1">Admission Process</p>
                  <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.admissionProcess}</p>
                </div>
              )}
            </section>
          )}

          {/* Fee Structure */}
          {hasFees(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Fee Structure</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 font-heading font-semibold text-label text-gray-400 uppercase tracking-wide">Fee Type</th>
                      <th className="pb-3 font-heading font-semibold text-label text-gray-400 uppercase tracking-wide text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {school.averageAnnualFee && (
                      <FeeRow label="Average Annual Fee" amount={fmtINR(school.averageAnnualFee)} highlight />
                    )}
                    {school.prePrimaryFee && (
                      <FeeRow label="Pre-Primary" amount={fmtINR(school.prePrimaryFee)} />
                    )}
                    {school.class1to5Fee && (
                      <FeeRow label="Class 1–5" amount={fmtINR(school.class1to5Fee)} />
                    )}
                    {school.class6to8Fee && (
                      <FeeRow label="Class 6–8" amount={fmtINR(school.class6to8Fee)} />
                    )}
                    {school.class9to10Fee && (
                      <FeeRow label="Class 9–10" amount={fmtINR(school.class9to10Fee)} />
                    )}
                    {school.class11to12Fee && (
                      <FeeRow label="Class 11–12" amount={fmtINR(school.class11to12Fee)} />
                    )}
                    {school.admissionFee && (
                      <FeeRow label="Admission Fee (One-time)" amount={fmtINR(school.admissionFee)} />
                    )}
                    {school.tuitionFeeMonthly && (
                      <FeeRow label="Tuition Fee (Monthly)" amount={fmtINR(school.tuitionFeeMonthly)} />
                    )}
                    {school.totalAnnualFee && !school.averageAnnualFee && (
                      <FeeRow label="Total Annual Fee" amount={fmtINR(school.totalAnnualFee)} highlight />
                    )}
                    {school.transportFee && (
                      <FeeRow label="Transport Fee (Monthly)" amount={fmtINR(school.transportFee)} />
                    )}
                    {school.hostelFee && (
                      <FeeRow label="Hostel Fee (Monthly)" amount={fmtINR(school.hostelFee)} />
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-meta text-gray-400 mt-4 font-body italic">
                * Fees are approximate. Contact the school for confirmed amounts.
              </p>
            </section>
          )}

          {/* Facilities */}
          {hasFacilities(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* New string-array facilities */}
                {school.facilitiesList?.map((name) => (
                  <div key={name} className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <span className="font-body text-label text-gray-800">{name}</span>
                  </div>
                ))}
                {/* Legacy M:N facilities */}
                {school.facilities?.map(({ facility }) => (
                  <div key={facility.id} className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    {facility.icon ? (
                      <span className="text-xl">{facility.icon}</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    )}
                    <span className="font-body text-label text-gray-800">{facility.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sports */}
          {hasSports(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Sports</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {school.sportsList.map((name) => (
                  <div key={name} className="flex items-center gap-2.5 p-3 bg-green-50 rounded-xl border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="font-body text-label text-gray-800">{name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Programs */}
          {hasPrograms(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Programs</h2>
              <div className="flex flex-wrap gap-2">
                {school.programsList.map((p) => (
                  <span key={p} className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-label font-body">
                    {p}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Infrastructure */}
          {hasInfrastructure(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Infrastructure</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {school.campusArea && <InfoTile label="Campus Area" value={school.campusArea} />}
                {school.totalClassrooms && <InfoTile label="Classrooms" value={String(school.totalClassrooms)} />}
                {school.totalLabs && <InfoTile label="Labs" value={String(school.totalLabs)} />}
                {school.libraryBooks && <InfoTile label="Library Books" value={school.libraryBooks.toLocaleString("en-IN")} />}
                {school.hostelCapacity && <InfoTile label="Hostel Capacity" value={String(school.hostelCapacity)} />}
                {school.totalBuses && <InfoTile label="Buses" value={String(school.totalBuses)} />}
              </div>
            </section>
          )}

          {/* Faculty */}
          {hasFaculty(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Faculty</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {school.totalTeachers && <InfoTile label="Total Teachers" value={String(school.totalTeachers)} />}
                {school.qualifiedTeachers && <InfoTile label="Qualified Teachers" value={String(school.qualifiedTeachers)} />}
              </div>
              {school.trainingPrograms && (
                <div>
                  <p className="font-heading font-semibold text-label text-gray-500 mb-1">Training Programs</p>
                  <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.trainingPrograms}</p>
                </div>
              )}
            </section>
          )}

          {/* Student Life */}
          {hasStudentLife(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Student Life</h2>
              <div className="space-y-4">
                {school.clubsActivities && (
                  <div>
                    <p className="font-heading font-semibold text-label text-gray-500 mb-1">Clubs & Activities</p>
                    <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.clubsActivities}</p>
                  </div>
                )}
                {school.culturalActivities && (
                  <div>
                    <p className="font-heading font-semibold text-label text-gray-500 mb-1">Cultural Activities</p>
                    <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.culturalActivities}</p>
                  </div>
                )}
                {school.annualEvents && (
                  <div>
                    <p className="font-heading font-semibold text-label text-gray-500 mb-1">Annual Events</p>
                    <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.annualEvents}</p>
                  </div>
                )}
                {school.educationalTours && (
                  <div>
                    <p className="font-heading font-semibold text-label text-gray-500 mb-1">Educational Tours</p>
                    <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.educationalTours}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Achievements */}
          {hasAchievements(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Achievements</h2>
              <div className="space-y-4">
                {school.academicAchievements && (
                  <div>
                    <p className="font-heading font-semibold text-label text-gray-500 mb-1">Academic</p>
                    <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.academicAchievements}</p>
                  </div>
                )}
                {school.sportsAchievements && (
                  <div>
                    <p className="font-heading font-semibold text-label text-gray-500 mb-1">Sports</p>
                    <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.sportsAchievements}</p>
                  </div>
                )}
                {school.awardsRecognitions && (
                  <div>
                    <p className="font-heading font-semibold text-label text-gray-500 mb-1">Awards & Recognitions</p>
                    <p className="font-body text-body text-gray-700 whitespace-pre-line">{school.awardsRecognitions}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Board Results */}
          {school.boardResults?.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Board Results</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 font-heading font-semibold text-label text-gray-400 uppercase tracking-wide">Year</th>
                      <th className="pb-3 font-heading font-semibold text-label text-gray-400 uppercase tracking-wide text-center">Class 10 Pass%</th>
                      <th className="pb-3 font-heading font-semibold text-label text-gray-400 uppercase tracking-wide text-center">Class 12 Pass%</th>
                      <th className="pb-3 font-heading font-semibold text-label text-gray-400 uppercase tracking-wide">Topper</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {school.boardResults.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 font-heading font-semibold text-body text-gray-800">{r.year}</td>
                        <td className="py-3 text-center font-body text-body text-gray-700">{r.class10Pass ?? "—"}</td>
                        <td className="py-3 text-center font-body text-body text-gray-700">{r.class12Pass ?? "—"}</td>
                        <td className="py-3 font-body text-body text-gray-700">
                          {r.topperName ? `${r.topperName}${r.topperScore ? ` (${r.topperScore})` : ""}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Scholarships */}
          {school.scholarships?.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Scholarships</h2>
              <div className="space-y-4">
                {school.scholarships.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <p className="font-heading font-semibold text-body text-gray-800 mb-1">{s.name}</p>
                    {s.eligibility && (
                      <p className="font-body text-body-sm text-gray-600 mb-1">
                        <span className="font-medium">Eligibility:</span> {s.eligibility}
                      </p>
                    )}
                    {s.benefits && (
                      <p className="font-body text-body-sm text-gray-600">
                        <span className="font-medium">Benefits:</span> {s.benefits}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hostel */}
          {hasHostel(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Hostel</h2>
              <div className="flex flex-wrap gap-3">
                {school.hostelBoys && <FeatureBadge label="Boys Hostel" />}
                {school.hostelGirls && <FeatureBadge label="Girls Hostel" />}
                {school.hostelMess && <FeatureBadge label="Mess Available" />}
                {school.hostelCapacity && (
                  <FeatureBadge label={`Capacity: ${school.hostelCapacity}`} />
                )}
              </div>
            </section>
          )}

          {/* Transport */}
          {hasTransport(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Transport</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {school.gpsTracking && <FeatureBadge label="GPS Tracking" />}
                {school.totalVehicles && <FeatureBadge label={`${school.totalVehicles} Vehicles`} />}
              </div>
              {school.transportAreas && (
                <div>
                  <p className="font-heading font-semibold text-label text-gray-500 mb-1">Coverage Areas</p>
                  <p className="font-body text-body text-gray-700">{school.transportAreas}</p>
                </div>
              )}
            </section>
          )}

          {/* Safety */}
          {hasSafety(school) && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Safety & Security</h2>
              <div className="flex flex-wrap gap-3">
                {school.hasCCTV && <FeatureBadge label="CCTV Surveillance" />}
                {school.hasGuards && <FeatureBadge label="Security Guards" />}
                {school.hasMedicalRoom && <FeatureBadge label="Medical Room" />}
                {school.hasFireSafety && <FeatureBadge label="Fire Safety" />}
                {school.hasVisitorMgmt && <FeatureBadge label="Visitor Management" />}
              </div>
            </section>
          )}

          {/* Photo Gallery */}
          {school.images?.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Photo Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {school.images.map((img) => {
                  const galleryUrl = optimizeCloudinaryUrl(img.url, { width: 640 });
                  return (
                    <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden bg-blue-50 border border-gray-100">
                      <Image
                        src={galleryUrl ?? img.url}
                        alt={img.caption || `${school.name} photo`}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={IMAGE_BLUR_DATA_URL}
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                          <p className="text-white text-meta truncate">{img.caption}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Downloads */}
          {school.downloads?.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">Downloads</h2>
              <div className="space-y-3">
                {school.downloads.map((d) => (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-body text-body text-blue-600 group-hover:text-blue-800 transition-colors">
                      {d.label}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {school.faqs?.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">FAQs</h2>
              <div className="space-y-4">
                {school.faqs.map((faq) => (
                  <div key={faq.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <p className="font-heading font-semibold text-body text-gray-800 mb-1">
                      {faq.question}
                    </p>
                    <p className="font-body text-body text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-6">

          {/* Contact Card */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 sticky top-24">
            <h3 className="font-heading font-semibold text-h3 text-gray-800 mb-4">Contact</h3>
            <div className="space-y-3 mb-5">

              {/* Phone */}
              <a href={`tel:${school.phone}`} className="flex items-center gap-3 group">
                <ContactIcon icon="phone" />
                <span className="font-body text-body text-blue-600 group-hover:text-blue-800 transition-colors">
                  {school.phone}
                </span>
              </a>

              {/* WhatsApp */}
              {school.whatsapp && (
                <a
                  href={`https://wa.me/${school.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <ContactIcon icon="whatsapp" />
                  <span className="font-body text-body text-green-600 group-hover:text-green-800 transition-colors">
                    WhatsApp
                  </span>
                </a>
              )}

              {/* Email */}
              {school.email && (
                <a href={`mailto:${school.email}`} className="flex items-center gap-3 group">
                  <ContactIcon icon="email" />
                  <span className="font-body text-body text-blue-600 group-hover:text-blue-800 transition-colors truncate">
                    {school.email}
                  </span>
                </a>
              )}

              {/* Website */}
              {school.website && (
                <a href={school.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                  <ContactIcon icon="website" />
                  <span className="font-body text-body text-blue-600 group-hover:text-blue-800 transition-colors">
                    Visit Website
                  </span>
                </a>
              )}

              {/* Address */}
              <div className="flex items-start gap-3">
                <ContactIcon icon="address" />
                <span className="font-body text-body text-gray-800 leading-relaxed">
                  {school.address}, {school.city}, {school.state}
                  {school.pincode ? ` — ${school.pincode}` : ""}
                </span>
              </div>

              {/* Map */}
              {school.mapUrl && (
                <a href={school.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                  <ContactIcon icon="map" />
                  <span className="font-body text-body text-blue-600 group-hover:text-blue-800 transition-colors">
                    View on Map
                  </span>
                </a>
              )}
            </div>

            {/* Admission Contact */}
            {(school.admissionCoordinatorName || school.admissionPhone || school.admissionEmail) && (
              <div className="border-t border-gray-100 pt-4 mb-5">
                <p className="font-heading font-semibold text-label text-gray-500 mb-2">Admission Contact</p>
                {school.admissionCoordinatorName && (
                  <p className="font-body text-body text-gray-800 mb-1">{school.admissionCoordinatorName}</p>
                )}
                {school.admissionPhone && (
                  <a href={`tel:${school.admissionPhone}`} className="block font-body text-body text-blue-600 hover:text-blue-800 mb-1">
                    {school.admissionPhone}
                  </a>
                )}
                {school.admissionEmail && (
                  <a href={`mailto:${school.admissionEmail}`} className="block font-body text-body text-blue-600 hover:text-blue-800 truncate">
                    {school.admissionEmail}
                  </a>
                )}
              </div>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="border-t border-gray-100 pt-4 mb-5">
                <p className="font-heading font-semibold text-label text-gray-500 mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {school.facebook && (
                    <a href={school.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors text-label font-bold">
                      f
                    </a>
                  )}
                  {school.instagram && (
                    <a href={school.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors text-label font-bold">
                      in
                    </a>
                  )}
                  {school.youtube && (
                    <a href={school.youtube} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors text-label font-bold">
                      yt
                    </a>
                  )}
                  {school.linkedin && (
                    <a href={school.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors text-label font-bold">
                      li
                    </a>
                  )}
                </div>
              </div>
            )}

            <InquiryModal schoolId={school.id} schoolName={school.name} fullWidth />
          </div>

          {/* Back link */}
          <Link
            href="/schools"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-body text-label transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            View all schools
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-200">
      <p className="font-body text-meta text-gray-400 mb-1">{label}</p>
      <p className="font-heading font-semibold text-label text-gray-800">{value}</p>
    </div>
  );
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-label font-body">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {label}
    </span>
  );
}

function FeeRow({ label, amount, highlight }: { label: string; amount: string; highlight?: boolean }) {
  return (
    <tr className={highlight ? "bg-blue-50" : ""}>
      <td className={`py-3 font-body text-body ${highlight ? "text-blue-800 font-medium" : "text-gray-800"}`}>
        {label}
      </td>
      <td className={`py-3 text-right font-heading font-semibold ${highlight ? "text-blue-600 text-body-lg" : "text-gray-800"}`}>
        {amount}
      </td>
    </tr>
  );
}

function ContactIcon({ icon }: { icon: string }) {
  const cls = "w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0";
  const svgCls = "w-4 h-4 text-blue-600";

  if (icon === "phone") return (
    <div className={cls}>
      <svg className={svgCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    </div>
  );

  if (icon === "whatsapp") return (
    <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </div>
  );

  if (icon === "email") return (
    <div className={cls}>
      <svg className={svgCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
  );

  if (icon === "website") return (
    <div className={cls}>
      <svg className={svgCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    </div>
  );

  if (icon === "map") return (
    <div className={cls}>
      <svg className={svgCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    </div>
  );

  // address (default)
  return (
    <div className={cls}>
      <svg className={svgCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  );
}