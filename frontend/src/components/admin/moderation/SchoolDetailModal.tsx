"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Textarea } from "@/components/shared/ui/textarea";
import { Label } from "@/components/shared/ui/label";
import { Badge } from "@/components/shared/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  GraduationCap,
  Users,
  Calendar,
  Building2,
  BookOpen,
  Shield,
  Bus,
  Home,
  Star,
  Images,
} from "lucide-react";
import type { SchoolStatus } from "@/lib/types/database";

type GalleryImage = {
  id: string;
  url: string;
  caption?: string | null;
  category?: string | null;
};

type SchoolDetail = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  address: string;
  pincode?: string | null;
  board: string;
  stateBoardName?: string | null;
  schoolType: string;
  medium: string;
  mediumOther?: string | null;
  classesFrom: number;
  classesTo: number;
  phone: string;
  email: string | null;
  website: string | null;
  description: string | null;
  tagline?: string | null;
  status: SchoolStatus;
  isVisible?: boolean;
  isFeatured?: boolean;
  rejectionReason: string | null;
  totalStudents: number | null;
  establishedYear: number | null;
  managementType?: string | null;
  schoolCategory?: string | null;
  schoolFormat?: string | null;
  affiliationNumber?: string | null;
  recognitionNumber?: string | null;
  affiliatedSince?: string | null;
  languagesOffered?: string[];
  classesOffered?: string[];
  streamsOffered?: string[];
  uniformPolicy?: string | null;
  canteenAvailable?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  workingDays?: string | null;
  studentTeacherRatio?: string | null;
  totalTeachers?: number | null;
  qualifiedTeachers?: number | null;
  admissionFee: number | null;
  tuitionFeeMonthly: number | null;
  totalAnnualFee: number | null;
  transportFee: number | null;
  hostelFee: number | null;
  averageAnnualFee?: number | null;
  earlyChildhoodFee?: number | null;
  prePrimaryFee?: number | null;
  class1to5Fee?: number | null;
  class6to8Fee?: number | null;
  class9to10Fee?: number | null;
  class11to12Fee?: number | null;
  facilitiesList?: string[];
  sportsList?: string[];
  programsList?: string[];
  campusArea?: string | null;
  totalClassrooms?: number | null;
  totalLabs?: number | null;
  libraryBooks?: number | null;
  hostelAvailable?: boolean;
  hostelBoys?: boolean;
  hostelGirls?: boolean;
  transportAvailable?: boolean;
  transportAreas?: string | null;
  gpsTracking?: boolean;
  hasCCTV?: boolean;
  hasGuards?: boolean;
  hasMedicalRoom?: boolean;
  hasFireSafety?: boolean;
  vision?: string | null;
  mission?: string | null;
  admissionOpen?: boolean;
  admissionStartDate?: string | null;
  admissionEndDate?: string | null;
  logoUrl: string | null;
  coverImageUrl?: string | null;
  images?: GalleryImage[];
  owner: { name: string | null; email: string };
  createdAt: string;
};

type Props = {
  school: SchoolDetail;
  open: boolean;
  onClose: () => void;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
};

type Tab =
  | "overview"
  | "academics"
  | "fees"
  | "facilities"
  | "infrastructure"
  | "gallery";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "academics", label: "Academics" },
  { key: "fees", label: "Fees" },
  { key: "facilities", label: "Facilities" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "gallery", label: "Gallery" },
];

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="font-body text-xs text-gray-500">{label}</span>
      <span className="font-body text-xs text-gray-800 font-medium text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

function ChipList({
  items,
  color = "blue",
}: {
  items: string[];
  color?: "blue" | "green" | "purple";
}) {
  if (!items?.length) return null;
  const cls =
    color === "green"
      ? "bg-green-50 border-green-200 text-green-700"
      : color === "purple"
        ? "bg-purple-50 border-purple-200 text-purple-700"
        : "bg-blue-50 border-blue-200 text-blue-700";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`px-2 py-0.5 rounded-full border text-xs ${cls}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function SchoolDetailModal({
  school,
  open,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  function handleClose() {
    setRejectMode(false);
    setReason("");
    setReasonError("");
    setActiveTab("overview");
    onClose();
  }

  async function handleApprove() {
    if (!onApprove) return;
    setLoading("approve");
    try {
      await onApprove(school.id);
      handleClose();
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!onReject) return;
    if (!reason.trim()) {
      setReasonError("Rejection reason is required");
      return;
    }
    setLoading("reject");
    try {
      await onReject(school.id, reason.trim());
      handleClose();
    } finally {
      setLoading(null);
    }
  }

  const isPending = school.status === "PENDING";

  function getBoardLabel() {
    if (school.board === "STATE_BOARD") {
      return school.stateBoardName
        ? `${school.stateBoardName} Board`
        : "State Board";
    }
    return school.board.replace(/_/g, " ");
  }

  function getMediumLabel() {
    if (school.medium === "OTHER") return school.mediumOther || "Other";
    return school.medium.replace(/_/g, " ");
  }

  const galleryImages = school.images ?? [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-xl text-blue-800 pr-6">
            {school.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {/* Header */}
          <div className="flex items-center gap-4">
            {school.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.logoUrl}
                alt={school.name}
                className="h-14 w-14 rounded-xl object-cover border border-gray-100 shrink-0"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-heading font-bold text-xl text-blue-700">
                {school.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              {school.tagline && (
                <p className="font-body text-xs text-gray-400 italic mb-0.5">
                  {school.tagline}
                </p>
              )}
              <p className="font-body text-sm text-gray-500">
                Owner:{" "}
                <span className="text-gray-800 font-medium">
                  {school.owner.name ?? "—"}
                </span>{" "}
                · {school.owner.email}
              </p>
              <p className="font-body text-xs text-gray-400">
                Registered:{" "}
                {school.createdAt
                  ? new Date(school.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>
              <div className="flex gap-2 mt-1.5">
                {school.isVisible !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${school.isVisible ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}
                  >
                    {school.isVisible ? "Listed" : "Unlisted"}
                  </span>
                )}
                {school.isFeatured && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-50 border-amber-200 text-amber-700 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cover image */}
          {school.coverImageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-100 h-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={school.coverImageUrl}
                alt={`${school.name} cover`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Academic badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{getBoardLabel()}</Badge>
            <Badge variant="secondary">
              {school.schoolType.replace(/_/g, " ")}
            </Badge>
            <Badge variant="secondary">{getMediumLabel()}</Badge>
            <Badge variant="secondary">
              Class {school.classesFrom}–{school.classesTo}
            </Badge>
            {school.admissionOpen && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Admissions Open
              </Badge>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-xs font-heading font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.key === "gallery" && galleryImages.length > 0 && (
                  <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                    {galleryImages.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="font-body text-sm text-gray-700">
                    {school.address}, {school.city}, {school.state}
                    {school.pincode ? ` — ${school.pincode}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <p className="font-body text-sm text-gray-700">
                    {school.phone}
                  </p>
                </div>
                {school.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <p className="font-body text-sm text-gray-700">
                      {school.email}
                    </p>
                  </div>
                )}
                {school.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-sm text-blue-600 hover:underline truncate"
                    >
                      {school.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                {school.establishedYear && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-body text-sm text-gray-700">
                      Est. {school.establishedYear}
                    </p>
                  </div>
                )}
                {school.totalStudents && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gray-400" />
                    <p className="font-body text-sm text-gray-700">
                      {school.totalStudents} students
                    </p>
                  </div>
                )}
                {school.totalTeachers && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <p className="font-body text-sm text-gray-700">
                      {school.totalTeachers} teachers
                    </p>
                  </div>
                )}
              </div>

              {school.description && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-body text-sm text-gray-700 leading-relaxed">
                    {school.description}
                  </p>
                </div>
              )}
              {school.vision && (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-1">
                    Vision
                  </p>
                  <p className="font-body text-sm text-gray-700">
                    {school.vision}
                  </p>
                </div>
              )}
              {school.mission && (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-1">
                    Mission
                  </p>
                  <p className="font-body text-sm text-gray-700">
                    {school.mission}
                  </p>
                </div>
              )}
              {school.rejectionReason && school.status === "REJECTED" && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <p className="font-heading font-semibold text-xs text-red-700 mb-1">
                    Previous rejection reason
                  </p>
                  <p className="font-body text-sm text-red-700">
                    {school.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Academics */}
          {activeTab === "academics" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 space-y-0">
                {school.schoolCategory && (
                  <InfoRow label="Category" value={school.schoolCategory} />
                )}
                {school.schoolFormat && (
                  <InfoRow label="Format" value={school.schoolFormat} />
                )}
                {school.managementType && (
                  <InfoRow label="Management" value={school.managementType} />
                )}
                {school.affiliationNumber && (
                  <InfoRow
                    label="Affiliation No."
                    value={school.affiliationNumber}
                  />
                )}
                {school.recognitionNumber && (
                  <InfoRow
                    label="Recognition No."
                    value={school.recognitionNumber}
                  />
                )}
                {school.affiliatedSince && (
                  <InfoRow
                    label="Affiliated Since"
                    value={school.affiliatedSince}
                  />
                )}
                {school.studentTeacherRatio && (
                  <InfoRow
                    label="Student:Teacher Ratio"
                    value={school.studentTeacherRatio}
                  />
                )}
                {school.uniformPolicy && (
                  <InfoRow
                    label="Uniform Policy"
                    value={school.uniformPolicy}
                  />
                )}
                {school.canteenAvailable && (
                  <InfoRow
                    label="Canteen / Tiffin"
                    value={school.canteenAvailable}
                  />
                )}
                {school.workingDays && (
                  <InfoRow label="Working Days" value={school.workingDays} />
                )}
                {(school.startTime || school.endTime) && (
                  <InfoRow
                    label="Timings"
                    value={[school.startTime, school.endTime]
                      .filter(Boolean)
                      .join(" – ")}
                  />
                )}
                {school.qualifiedTeachers && school.totalTeachers && (
                  <InfoRow
                    label="Qualified Teachers"
                    value={`${school.qualifiedTeachers} / ${school.totalTeachers} (${((school.qualifiedTeachers / school.totalTeachers) * 100).toFixed(1)}%)`}
                  />
                )}
              </div>
              {school.classesOffered?.length ? (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2">
                    Classes Offered
                  </p>
                  <ChipList items={school.classesOffered} color="blue" />
                </div>
              ) : null}
              {school.streamsOffered?.length ? (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2">
                    Streams
                  </p>
                  <ChipList items={school.streamsOffered} color="green" />
                </div>
              ) : null}
              {school.languagesOffered?.length ? (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2">
                    Languages
                  </p>
                  <ChipList items={school.languagesOffered} color="purple" />
                </div>
              ) : null}
              {school.admissionStartDate && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="font-heading font-semibold text-xs text-blue-700 mb-1">
                    Admission Window
                  </p>
                  <p className="font-body text-sm text-blue-800">
                    {new Date(school.admissionStartDate).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                    {school.admissionEndDate && (
                      <>
                        {" "}
                        →{" "}
                        {new Date(school.admissionEndDate).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Fees */}
          {activeTab === "fees" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <p className="font-heading font-semibold text-sm text-gray-700">
                  Fee Structure
                </p>
              </div>
              {[
                { label: "Average Annual Fee", value: school.averageAnnualFee },
                {
                  label: "Early Childhood / Play School",
                  value: school.earlyChildhoodFee,
                },
                { label: "Pre-Primary", value: school.prePrimaryFee },
                { label: "Class 1–5", value: school.class1to5Fee },
                { label: "Class 6–8", value: school.class6to8Fee },
                { label: "Class 9–10", value: school.class9to10Fee },
                { label: "Class 11–12", value: school.class11to12Fee },
                {
                  label: "Admission Fee (One-time)",
                  value: school.admissionFee,
                },
                { label: "Monthly Tuition", value: school.tuitionFeeMonthly },
                { label: "Total Annual Fee", value: school.totalAnnualFee },
                {
                  label: "Transport Fee (Monthly)",
                  value: school.transportFee,
                },
                { label: "Hostel Fee (Monthly)", value: school.hostelFee },
              ]
                .filter((f) => f.value)
                .map((f) => (
                  <div
                    key={f.label}
                    className="flex justify-between items-center px-3 py-2 bg-blue-50 rounded-xl border border-blue-100"
                  >
                    <span className="font-body text-xs text-gray-600">
                      {f.label}
                    </span>
                    <span className="font-heading font-bold text-sm text-blue-800">
                      ₹{f.value?.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              {![
                school.averageAnnualFee,
                school.earlyChildhoodFee,
                school.prePrimaryFee,
                school.class1to5Fee,
                school.class6to8Fee,
                school.class9to10Fee,
                school.class11to12Fee,
                school.admissionFee,
                school.tuitionFeeMonthly,
                school.totalAnnualFee,
                school.transportFee,
                school.hostelFee,
              ].some(Boolean) && (
                <p className="font-body text-sm text-gray-400 text-center py-4">
                  No fee details added yet.
                </p>
              )}
            </div>
          )}

          {/* Tab: Facilities */}
          {activeTab === "facilities" && (
            <div className="space-y-4">
              {school.facilitiesList?.length ? (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Facilities
                  </p>
                  <ChipList items={school.facilitiesList} color="blue" />
                </div>
              ) : null}
              {school.sportsList?.length ? (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> Sports
                  </p>
                  <ChipList items={school.sportsList} color="green" />
                </div>
              ) : null}
              {school.programsList?.length ? (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Programs
                  </p>
                  <ChipList items={school.programsList} color="purple" />
                </div>
              ) : null}
              {(school.hasCCTV ||
                school.hasGuards ||
                school.hasMedicalRoom ||
                school.hasFireSafety) && (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Safety
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {school.hasCCTV && (
                      <span className="px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs">
                        CCTV
                      </span>
                    )}
                    {school.hasGuards && (
                      <span className="px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs">
                        Security Guards
                      </span>
                    )}
                    {school.hasMedicalRoom && (
                      <span className="px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs">
                        Medical Room
                      </span>
                    )}
                    {school.hasFireSafety && (
                      <span className="px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs">
                        Fire Safety
                      </span>
                    )}
                  </div>
                </div>
              )}
              {!school.facilitiesList?.length &&
                !school.sportsList?.length &&
                !school.programsList?.length && (
                  <p className="font-body text-sm text-gray-400 text-center py-4">
                    No facility details added yet.
                  </p>
                )}
            </div>
          )}

          {/* Tab: Infrastructure */}
          {activeTab === "infrastructure" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 space-y-0">
                {school.campusArea && (
                  <InfoRow label="Campus Area" value={school.campusArea} />
                )}
                {school.totalClassrooms && (
                  <InfoRow label="Classrooms" value={school.totalClassrooms} />
                )}
                {school.totalLabs && (
                  <InfoRow label="Labs" value={school.totalLabs} />
                )}
                {school.libraryBooks && (
                  <InfoRow
                    label="Library Books"
                    value={school.libraryBooks.toLocaleString("en-IN")}
                  />
                )}
              </div>
              {school.hostelAvailable && (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" /> Hostel
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {school.hostelBoys && (
                      <span className="px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs">
                        Boys Hostel
                      </span>
                    )}
                    {school.hostelGirls && (
                      <span className="px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs">
                        Girls Hostel
                      </span>
                    )}
                  </div>
                </div>
              )}
              {school.transportAvailable && (
                <div>
                  <p className="font-heading font-semibold text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5" /> Transport
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {school.gpsTracking && (
                      <span className="px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs">
                        GPS Tracking
                      </span>
                    )}
                    {school.transportAreas && (
                      <p className="font-body text-sm text-gray-700 w-full mt-1">
                        {school.transportAreas}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!school.campusArea &&
                !school.totalClassrooms &&
                !school.totalLabs &&
                !school.libraryBooks &&
                !school.hostelAvailable &&
                !school.transportAvailable && (
                  <p className="font-body text-sm text-gray-400 text-center py-4">
                    No infrastructure details added yet.
                  </p>
                )}
            </div>
          )}

          {/* Tab: Gallery */}
          {activeTab === "gallery" && (
            <div className="space-y-3">
              {galleryImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                  <Images className="w-8 h-8" />
                  <p className="font-body text-sm">
                    No gallery images uploaded yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-xl overflow-hidden border border-gray-100 aspect-square bg-gray-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.caption ?? "Gallery image"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {(img.caption || img.category) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                          {img.caption && (
                            <p className="text-white text-xs truncate">
                              {img.caption}
                            </p>
                          )}
                          {img.category && (
                            <p className="text-white/70 text-[10px] truncate">
                              {img.category}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reject reason input */}
          {rejectMode && (
            <div className="space-y-1.5">
              <Label className="font-heading text-sm text-gray-800">
                Rejection reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="Explain why this school is being rejected..."
                className="rounded-xl border border-gray-200 font-body text-sm resize-none"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setReasonError("");
                }}
              />
              {reasonError && (
                <p className="font-body text-xs text-red-500">{reasonError}</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          {isPending && (onApprove || onReject) && (
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              {!rejectMode ? (
                <>
                  {onApprove && (
                    <Button
                      onClick={handleApprove}
                      disabled={loading !== null}
                      className="flex-1 h-10 bg-green-600 hover:bg-green-700 font-heading text-sm rounded-xl"
                    >
                      {loading === "approve" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      onClick={() => setRejectMode(true)}
                      disabled={loading !== null}
                      variant="outline"
                      className="flex-1 h-10 border-red-200 text-red-600 hover:bg-red-50 font-heading text-sm rounded-xl"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    onClick={handleReject}
                    disabled={loading !== null}
                    className="flex-1 h-10 bg-red-600 hover:bg-red-700 font-heading text-sm rounded-xl"
                  >
                    {loading === "reject" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirm rejection
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setRejectMode(false);
                      setReason("");
                      setReasonError("");
                    }}
                    disabled={loading !== null}
                    variant="outline"
                    className="h-10 font-heading text-sm rounded-xl"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
