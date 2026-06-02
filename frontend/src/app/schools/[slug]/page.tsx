// frontend/src/app/schools/[slug]/page.tsx
// School detail page — Server Component
// Fetches from Backend API, shows full school profile
// Sections: Header, About, Academic Info, Fee Structure, Facilities, Gallery, Contact, Inquiry

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/api/server";
import { fetchSchoolBySlug } from "@/lib/data/schools-public";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-placeholder";
import JsonLd from "@/components/seo/JsonLd";
import InquiryModal from "@/components/schools/InquiryModal";
import FavouriteButton from "@/components/schools/FavouriteButton";

const TrackSchoolView = dynamic(
  () => import("@/components/parent/TrackSchoolView"),
  { loading: () => null }
);
import {
  buildSchoolMetadata,
  buildEducationalOrganizationJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";



// ─── Types ────────────────────────────────────────────────────────────────────

interface Facility {
  facility: { id: string; name: string; icon: string | null };
}

interface SchoolImage {
  id: string;
  url: string;
  caption: string | null;
}

interface SchoolDetail {
  id: string;
  name: string;
  slug: string;
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
  establishedYear: number | null;
  phone: string;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  admissionFee: number | null;
  tuitionFeeMonthly: number | null;
  totalAnnualFee: number | null;
  transportFee: number | null;
  hostelFee: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  owner: { name: string | null };
  images: SchoolImage[];
  facilities: Facility[];
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
  const hasFees =
    school.admissionFee ||
    school.tuitionFeeMonthly ||
    school.totalAnnualFee ||
    school.transportFee ||
    school.hostelFee;

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
              {school.logoUrl ? (
                <Image
                  src={school.logoUrl}
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
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-blue-200 text-meta mb-2">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href="/schools" className="hover:text-white transition-colors">Schools</Link>
                <span>/</span>
                <span className="text-white truncate">{school.name}</span>
              </nav>

              <div className="flex items-start gap-3">
                <h1 className="font-heading font-bold text-h1 text-white leading-tight flex-1 min-w-0">
                  {school.name}
                </h1>
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
              </div>
            </div>

            {/* CTA — Inquiry */}
            <div className="sm:text-right flex-shrink-0">
              <InquiryModal schoolId={school.id} schoolName={school.name} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Main Sections */}
        <div className="lg:col-span-2 space-y-8">

          {/* About */}
          {school.description && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-3">
                About
              </h2>
              <p className="font-body text-body text-gray-800 leading-relaxed whitespace-pre-line">
                {school.description}
              </p>
            </section>
          )}

          {/* Academic Info */}
          <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">
              Academic Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoTile label="Board" value={BOARD_LABEL[school.board]} />
              <InfoTile label="School Type" value={TYPE_LABEL[school.schoolType]} />
              <InfoTile label="Medium" value={MEDIUM_LABEL[school.medium]} />
              <InfoTile
                label="Classes"
                value={`Class ${school.classesFrom} to ${school.classesTo}`}
              />
              {school.totalStudents && (
                <InfoTile
                  label="Total Students"
                  value={school.totalStudents.toLocaleString("en-IN")}
                />
              )}
              {school.establishedYear && (
                <InfoTile
                  label="Established"
                  value={String(school.establishedYear)}
                />
              )}
            </div>
          </section>

          {/* Fee Structure */}
          {hasFees && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">
                Fee Structure
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 font-heading font-semibold text-label text-gray-400 uppercase tracking-wide">
                        Fee Type
                      </th>
                      <th className="pb-3 font-heading font-semibold text-label text-gray-400 uppercase tracking-wide text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {school.admissionFee && (
                      <FeeRow label="Admission Fee (One-time)" amount={fmtINR(school.admissionFee)} />
                    )}
                    {school.tuitionFeeMonthly && (
                      <FeeRow label="Tuition Fee (Monthly)" amount={fmtINR(school.tuitionFeeMonthly)} />
                    )}
                    {school.totalAnnualFee && (
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
          {school.facilities.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">
                Facilities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {school.facilities.map(({ facility }) => (
                  <div
                    key={facility.id}
                    className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl border border-blue-200"
                  >
                    {facility.icon ? (
                      <span className="text-xl">{facility.icon}</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-blue-200 flex-shrink-0" />
                    )}
                    <span className="font-body text-label text-gray-800">
                      {facility.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Photo Gallery */}
          {school.images.length > 0 && (
            <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h2 className="font-heading font-bold text-h2 text-gray-800 mb-5">
                Photo Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {school.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-blue-50 border border-gray-100"
                  >
                    <Image
                      src={img.url}
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
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar — Contact + Quick Info */}
        <div className="space-y-6">

          {/* Contact Card */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 sticky top-24">
            <h3 className="font-heading font-semibold text-h3 text-gray-800 mb-4">
              Contact
            </h3>

            <div className="space-y-3 mb-5">
              {/* Phone */}
              <a
                href={`tel:${school.phone}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span className="font-body text-body text-blue-600 group-hover:text-blue-800 transition-colors">
                  {school.phone}
                </span>
              </a>

              {/* Email */}
              {school.email && (
                <a
                  href={`mailto:${school.email}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-body text-body text-blue-600 group-hover:text-blue-800 transition-colors truncate">
                    {school.email}
                  </span>
                </a>
              )}

              {/* Website */}
              {school.website && (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </div>
                  <span className="font-body text-body text-blue-600 group-hover:text-blue-800 transition-colors truncate">
                    Visit Website 
                  </span>
                </a>
              )}

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className="font-body text-body text-gray-800 leading-relaxed">
                  {school.address}, {school.city}, {school.state}
                  {school.pincode ? ` — ${school.pincode}` : ""}
                </span>
              </div>
            </div>

            {/* Inquiry CTA */}
            <InquiryModal
              schoolId={school.id}
              schoolName={school.name}
              fullWidth
            />
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

function FeeRow({
  label,
  amount,
  highlight,
}: {
  label: string;
  amount: string;
  highlight?: boolean;
}) {
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
