"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  GitCompare,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import type { SchoolCardProps } from "@/components/public/schools/SchoolCard";
import type { SchoolDetail } from "@/lib/types/database";
import { fetchSchoolDetailClient } from "@/lib/data/schools-public";

const CLASS_ORDER = [
  "Daycare / Creche",
  "Toddler",
  "Play Group",
  "Pre-Nursery",
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

function formatClassRange(
  classesOffered: string[] | null | undefined,
  classesFrom: number | string | null | undefined,
  classesTo: number | string | null | undefined,
): string {
  if (classesOffered && classesOffered.length > 0) {
    const valid = classesOffered.filter((c) => CLASS_ORDER.includes(c));
    if (valid.length > 0) {
      const sorted = [...valid].sort(
        (a, b) => CLASS_ORDER.indexOf(a) - CLASS_ORDER.indexOf(b),
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (first === last) return first;
      return `${first} – ${last}`;
    }
  }
  if (classesFrom && classesTo) {
    return `Class ${classesFrom} – Class ${classesTo}`;
  }
  return "—";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPARE_STORAGE_KEY = "schoolfinder_compare_schools";
const MAX_COMPARE = 3;

// ─── Label maps ───────────────────────────────────────────────────────────────

const BOARD_LABELS: Record<string, string> = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  IB: "IB",
  IGCSE: "IGCSE",
  NIOS: "NIOS",
  STATE_BOARD: "State Board",
  OTHER: "Other",
  UP_BOARD: "UP Board", // legacy fallback
};

const TYPE_LABELS: Record<string, string> = {
  BOYS: "Boys only",
  GIRLS: "Girls only",
  CO_ED: "Co-Ed",
};

const MEDIUM_LABELS: Record<string, string> = {
  HINDI: "Hindi",
  ENGLISH: "English",
  BOTH: "Hindi + English",
  OTHER: "Other",
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readCompareSchools(): SchoolCardProps[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is SchoolCardProps =>
        Boolean(s?.id) && Boolean(s?.name) && Boolean(s?.slug),
    );
  } catch {
    return [];
  }
}

function writeCompareSchools(schools: SchoolCardProps[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(schools));
  window.dispatchEvent(new Event("schoolfinder:compare-updated"));
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function fmtFee(v: number | null | undefined): string {
  if (!v) return "—";
  return `₹${v.toLocaleString("en-IN")}`;
}

function fmtBool(v: boolean | null | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

function fmtDate(v: string | null | undefined): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return v;
  }
}

function fmtList(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return "—";
  if (arr.length <= 4) return arr.join(", ");
  return `${arr.slice(0, 4).join(", ")} +${arr.length - 4} more`;
}

function fmtBoardLabel(school: SchoolDetail): string {
  if (school.board === "STATE_BOARD" && school.stateBoardName) {
    return `State Board — ${school.stateBoardName}`;
  }
  return BOARD_LABELS[school.board] ?? school.board;
}

function fmtMediumLabel(school: SchoolDetail): string {
  if (school.medium === "OTHER" && school.mediumOther) {
    return `Other (${school.mediumOther})`;
  }
  return MEDIUM_LABELS[school.medium] ?? school.medium;
}

function fmtQualifiedPercent(
  qualified: number | null | undefined,
  total: number | null | undefined,
): string {
  if (!qualified || !total || total === 0) return "—";
  return `${((qualified / total) * 100).toFixed(1)}%`;
}

function fmtBoardResults(school: SchoolDetail): string {
  if (!school.boardResults || school.boardResults.length === 0) return "—";
  return school.boardResults
    .map((r) => {
      const level = r.classLevel === "CLASS_10" ? "Class 10" : "Class 12";
      const year = r.year ? ` (${r.year})` : "";
      const pass = r.passPercent != null ? ` — ${r.passPercent}% pass` : "";
      return `${level}${year}${pass}`;
    })
    .join("\n");
}

function fmtAdmissionCoordinator(school: SchoolDetail): string {
  // Prefer admissionCoordinators JSON array (new), fallback to legacy single fields
  const coords = school.admissionCoordinators;
  if (Array.isArray(coords) && coords.length > 0) {
    const first = coords[0];
    const parts = [first.name, first.phone, first.email].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : "—";
  }
  const parts = [
    school.admissionCoordinatorName,
    school.admissionPhone,
    school.admissionEmail,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label, colSpan }: { label: string; colSpan: number }) {
  return (
    <tr className="bg-blue-50 border-y border-blue-100">
      <td
        colSpan={colSpan}
        className="px-5 py-2 font-heading text-xs text-blue-700 uppercase tracking-widest"
      >
        {label}
      </td>
    </tr>
  );
}

function CompareRow({
  label,
  values,
  multiline,
}: {
  label: string;
  values: (string | null | undefined)[];
  multiline?: boolean;
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-3.5 font-heading text-label text-gray-500 uppercase tracking-wide bg-gray-50 w-44 align-top whitespace-nowrap">
        {label}
      </td>
      {values.map((value, i) => (
        <td
          key={i}
          className={`px-5 py-3.5 font-body text-body text-gray-700 align-top ${multiline ? "whitespace-pre-line" : ""}`}
        >
          {value && value !== "—" ? (
            value
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </td>
      ))}
    </tr>
  );
}

function BoolRow({
  label,
  values,
}: {
  label: string;
  values: (boolean | null | undefined)[];
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-3.5 font-heading text-label text-gray-500 uppercase tracking-wide bg-gray-50 w-44 align-top whitespace-nowrap">
        {label}
      </td>
      {values.map((value, i) => (
        <td key={i} className="px-5 py-3.5 align-top">
          {value === true ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : value === false ? (
            <XCircle className="w-4 h-4 text-gray-300" />
          ) : (
            <span className="text-gray-300 font-body text-body">—</span>
          )}
        </td>
      ))}
    </tr>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-5 py-3.5 bg-gray-50 w-44">
        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
      </td>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompareClient({
  schools = [],
}: {
  schools?: SchoolCardProps[];
}) {
  const safeSchools = Array.isArray(schools) ? schools : [];

  // Shallow list items from localStorage (for card display + remove)
  const [selectedCards, setSelectedCards] = useState<SchoolCardProps[]>([]);
  // Full detail data keyed by school id
  const [detailMap, setDetailMap] = useState<
    Record<string, SchoolDetail | null>
  >({});
  // Loading state per school id
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  // Dropdown selection
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  // Track which ids have been fetched to avoid duplicate requests
  const fetchedIds = useRef<Set<string>>(new Set());

  // Sync localStorage on mount and storage events
  useEffect(() => {
    const sync = () => setSelectedCards(readCompareSchools());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("schoolfinder:compare-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("schoolfinder:compare-updated", sync);
    };
  }, []);

  // Fetch detail for any selected card that doesn't have detail yet
  const fetchDetail = useCallback(async (card: SchoolCardProps) => {
    if (fetchedIds.current.has(card.id)) return;
    fetchedIds.current.add(card.id);

    setLoadingIds((prev) => new Set(prev).add(card.id));

    try {
      const detail = await fetchSchoolDetailClient(card.slug);
      console.log(
        "DETAIL classesFrom:",
        detail?.classesFrom,
        "classesTo:",
        detail?.classesTo,
      );
      setDetailMap((prev) => ({ ...prev, [card.id]: detail }));
    } catch {
      setDetailMap((prev) => ({ ...prev, [card.id]: null }));
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(card.id);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    for (const card of selectedCards) {
      fetchDetail(card);
    }
  }, [selectedCards, fetchDetail]);

  const availableSchools = useMemo(() => {
    const selectedIds = new Set(selectedCards.map((s) => s.id));
    return safeSchools.filter((s) => !selectedIds.has(s.id));
  }, [safeSchools, selectedCards]);

  function handleAddSchool() {
    if (!selectedSchoolId) return;
    const school = safeSchools.find((s) => s.id === selectedSchoolId);
    if (!school) return;
    if (selectedCards.some((s) => s.id === school.id)) {
      setSelectedSchoolId("");
      return;
    }
    if (selectedCards.length >= MAX_COMPARE) {
      alert("You can compare maximum 3 schools at a time.");
      return;
    }
    const next = [...selectedCards, school];
    setSelectedCards(next);
    writeCompareSchools(next);
    setSelectedSchoolId("");
  }

  function handleRemoveSchool(id: string) {
    const next = selectedCards.filter((s) => s.id !== id);
    setSelectedCards(next);
    writeCompareSchools(next);
    // Clean up detail cache and fetchedIds so re-adding re-fetches cleanly
    setDetailMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    fetchedIds.current.delete(id);
  }

  function handleClearAll() {
    setSelectedCards([]);
    writeCompareSchools([]);
    setDetailMap({});
    fetchedIds.current.clear();
  }

  // Details in order of selected cards
  const details = selectedCards.map((c) => detailMap[c.id] ?? null);
  const isAnyLoading = selectedCards.some((c) => loadingIds.has(c.id));
  const colSpan = selectedCards.length + 1;

  // Helper: get value for each selected school from its detail
  function vals<T>(fn: (d: SchoolDetail) => T, fallback: T): T[] {
    return details.map((d) => (d ? fn(d) : fallback));
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section className="bg-blue-800 px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to schools
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
                <GitCompare className="w-4 h-4" />
                Compare Schools
              </div>
              <h1 className="font-heading text-h1 text-white mb-2">
                Compare schools side by side
              </h1>
              <p className="font-body text-body text-blue-200 max-w-2xl">
                Select up to 3 schools and compare them on fees, board, medium,
                faculty, infrastructure, safety, and more.
              </p>
            </div>

            {selectedCards.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Add schools panel ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-8">
          <h2 className="font-heading text-h3 text-blue-800 mb-1">
            Add schools to compare
          </h2>
          <p className="font-body text-body text-gray-500 mb-5">
            You can compare up to {MAX_COMPARE} schools at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              disabled={selectedCards.length >= MAX_COMPARE}
              className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-body text-body focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            >
              <option value="">
                {selectedCards.length >= MAX_COMPARE
                  ? "Maximum 3 schools selected"
                  : "Select a school to compare"}
              </option>
              {availableSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.city}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddSchool}
              disabled={
                !selectedSchoolId || selectedCards.length >= MAX_COMPARE
              }
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 text-white font-heading text-btn hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add to compare
            </button>
          </div>

          {safeSchools.length === 0 && (
            <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              No schools loaded. Please check your connection or try again.
            </p>
          )}
        </div>

        {/* ── Empty state ── */}
        {selectedCards.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <GitCompare className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="font-heading text-h2 text-blue-800 mb-2">
              No schools selected yet
            </h2>
            <p className="font-body text-body text-gray-500 max-w-md mx-auto mb-6">
              Add schools from the dropdown above or click "Compare" on any
              school card.
            </p>
            <Link
              href="/schools"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-heading text-btn hover:bg-blue-700 transition-colors"
            >
              Browse schools
            </Link>
          </div>
        ) : (
          <>
            {/* ── Selected school cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              {selectedCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveSchool(card.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
                    aria-label={`Remove ${card.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start gap-3 pr-10">
                    {loadingIds.has(card.id) ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin mt-1 shrink-0" />
                    ) : detailMap[card.id] === null ? (
                      <XCircle className="w-4 h-4 text-red-400 mt-1 shrink-0" />
                    ) : detailMap[card.id] ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                    ) : null}
                    <div className="min-w-0">
                      <h3 className="font-heading text-h3 text-gray-900 mb-1 truncate">
                        {card.name}
                      </h3>
                      <p className="font-body text-label text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {card.city}, {card.state}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/schools/${card.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View full profile →
                  </Link>
                </div>
              ))}
            </div>

            {/* Minimum 2 schools notice */}
            {selectedCards.length < 2 && (
              <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                Add at least one more school to see the comparison table.
              </div>
            )}

            {/* Global loading bar */}
            {isAnyLoading && (
              <div className="mb-4 flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading school details…
              </div>
            )}

            {/* ── Comparison table ── */}
            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-card">
              <table className="min-w-full text-left">
                {/* Sticky header */}
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-5 py-4 font-heading text-label text-gray-400 uppercase tracking-wide w-44">
                      Criteria
                    </th>
                    {selectedCards.map((card) => (
                      <th
                        key={card.id}
                        className="px-5 py-4 font-heading text-label text-blue-800 min-w-[220px]"
                      >
                        <div className="flex items-center gap-2">
                          {card.name}
                          {loadingIds.has(card.id) && (
                            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* ═══ SECTION 1 — Basic Info ═══ */}
                  <SectionHeader label="Basic Info" colSpan={colSpan} />

                  {isAnyLoading ? (
                    <>
                      <SkeletonRow cols={selectedCards.length} />
                      <SkeletonRow cols={selectedCards.length} />
                      <SkeletonRow cols={selectedCards.length} />
                    </>
                  ) : (
                    <>
                      <CompareRow
                        label="Location"
                        values={vals((d) => `${d.city}, ${d.state}`, "—")}
                      />
                      <CompareRow
                        label="Board"
                        values={vals(fmtBoardLabel, "—")}
                      />
                      <CompareRow
                        label="School Type"
                        values={vals(
                          (d) => TYPE_LABELS[d.schoolType] ?? d.schoolType,
                          "—",
                        )}
                      />
                      <CompareRow
                        label="Medium"
                        values={vals(fmtMediumLabel, "—")}
                      />
                      <CompareRow
                        label="Category"
                        values={vals((d) => fmt(d.schoolCategory), "—")}
                      />
                      <CompareRow
                        label="Format"
                        values={vals((d) => fmt(d.schoolFormat), "—")}
                      />
                      <CompareRow
                        label="Classes"
                        values={selectedCards.map((card) => {
                          const d = detailMap[card.id];
                          return formatClassRange(
                            d?.classesOffered ?? card.classesOffered,
                            d?.classesFrom ?? card.classesFrom,
                            d?.classesTo ?? card.classesTo,
                          );
                        })}
                      />
                      <CompareRow
                        label="Est. Year"
                        values={vals((d) => fmt(d.establishedYear), "—")}
                      />
                      <CompareRow
                        label="Timing"
                        values={vals(
                          (d) =>
                            d.startTime && d.endTime
                              ? `${d.startTime} – ${d.endTime}`
                              : "—",
                          "—",
                        )}
                      />
                      <CompareRow
                        label="Working Days"
                        values={vals(
                          (d) =>
                            d.workingDays ? `${d.workingDays} days/week` : "—",
                          "—",
                        )}
                      />
                      <CompareRow
                        label="Languages"
                        values={vals((d) => fmtList(d.languagesOffered), "—")}
                      />
                      <BoolRow
                        label="Uniform"
                        values={vals((d) => Boolean(d.uniformPolicy), null)}
                      />
                      <BoolRow
                        label="Canteen"
                        values={vals((d) => d.canteenAvailable, null)}
                      />
                      <CompareRow
                        label="Total Students"
                        values={vals((d) => fmt(d.totalStudents), "—")}
                      />
                    </>
                  )}

                  {/* ═══ SECTION 2 — Academics ═══ */}
                  <SectionHeader label="Academics" colSpan={colSpan} />
                  {isAnyLoading ? (
                    <>
                      <SkeletonRow cols={selectedCards.length} />
                      <SkeletonRow cols={selectedCards.length} />
                    </>
                  ) : (
                    <>
                      <CompareRow
                        label="Streams"
                        values={vals((d) => fmtList(d.streamsOffered), "—")}
                      />
                      <CompareRow
                        label="Programs"
                        values={vals((d) => fmtList(d.programsList), "—")}
                      />
                      <CompareRow
                        label="Board Results"
                        values={vals(fmtBoardResults, "—")}
                        multiline
                      />
                    </>
                  )}

                  {/* ═══ SECTION 3 — Fee Structure ═══ */}
                  <SectionHeader label="Fee Structure" colSpan={colSpan} />
                  {isAnyLoading ? (
                    <>
                      <SkeletonRow cols={selectedCards.length} />
                      <SkeletonRow cols={selectedCards.length} />
                    </>
                  ) : (
                    <>
                      <CompareRow
                        label="Annual Fee"
                        values={vals(
                          (d) => fmtFee(d.totalAnnualFee ?? d.averageAnnualFee),
                          "—",
                        )}
                      />
                      <CompareRow
                        label="Early Childhood"
                        values={vals((d) => fmtFee(d.earlyChildhoodFee), "—")}
                      />
                      <CompareRow
                        label="Pre-Primary"
                        values={vals((d) => fmtFee(d.prePrimaryFee), "—")}
                      />
                      <CompareRow
                        label="Class 1–5"
                        values={vals((d) => fmtFee(d.class1to5Fee), "—")}
                      />
                      <CompareRow
                        label="Class 6–8"
                        values={vals((d) => fmtFee(d.class6to8Fee), "—")}
                      />
                      <CompareRow
                        label="Class 9–10"
                        values={vals((d) => fmtFee(d.class9to10Fee), "—")}
                      />
                      <CompareRow
                        label="Class 11–12"
                        values={vals((d) => fmtFee(d.class11to12Fee), "—")}
                      />
                      {/* <CompareRow
                        label="Monthly Tuition"
                        values={vals(
                          (d) =>
                            d.tuitionFeeMonthly
                              ? `${fmtFee(d.tuitionFeeMonthly)} / month`
                              : "—",
                          "—",
                        )}
                      /> */}

                      {/* <CompareRow
                        label="Admission Fee"
                        values={vals(
                          (d) => fmtFee(d.admissionFee),
                          "—",
                        )}
                      />
                      <CompareRow
                        label="Transport Fee"
                        values={vals(
                          (d) => fmtFee(d.transportFee),
                          "—",
                        )}
                      /> */}
                    </>
                  )}

                  {/* ═══ SECTION 4 — Admissions ═══ */}
                  <SectionHeader label="Admissions" colSpan={colSpan} />
                  {isAnyLoading ? (
                    <SkeletonRow cols={selectedCards.length} />
                  ) : (
                    <>
                      <BoolRow
                        label="Admissions Open"
                        values={vals((d) => d.admissionOpen, null)}
                      />
                      <CompareRow
                        label="Start Date"
                        values={vals((d) => fmtDate(d.admissionStartDate), "—")}
                      />
                      <CompareRow
                        label="Last Date"
                        values={vals((d) => fmtDate(d.admissionEndDate), "—")}
                      />
                      <CompareRow
                        label="Age Criteria"
                        values={vals((d) => fmt(d.ageCriteria), "—")}
                      />
                      <CompareRow
                        label="Coordinator"
                        values={vals(fmtAdmissionCoordinator, "—")}
                      />
                    </>
                  )}

                  {/* ═══ SECTION 5 — Faculty ═══ */}
                  <SectionHeader label="Faculty" colSpan={colSpan} />
                  {isAnyLoading ? (
                    <SkeletonRow cols={selectedCards.length} />
                  ) : (
                    <>
                      <CompareRow
                        label="Total Teachers"
                        values={vals((d) => fmt(d.totalTeachers), "—")}
                      />
                      <CompareRow
                        label="Qualified"
                        values={vals((d) => fmt(d.qualifiedTeachers), "—")}
                      />
                      <CompareRow
                        label="Qualified %"
                        values={vals(
                          (d) =>
                            fmtQualifiedPercent(
                              d.qualifiedTeachers,
                              d.totalTeachers,
                            ),
                          "—",
                        )}
                      />
                      <CompareRow
                        label="Student:Teacher"
                        values={vals((d) => fmt(d.studentTeacherRatio), "—")}
                      />
                    </>
                  )}

                  {/* ═══ SECTION 6 — Infrastructure ═══ */}
                  <SectionHeader label="Infrastructure" colSpan={colSpan} />
                  {isAnyLoading ? (
                    <SkeletonRow cols={selectedCards.length} />
                  ) : (
                    <>
                      <CompareRow
                        label="Campus Area"
                        values={vals((d) => fmt(d.campusArea), "—")}
                      />
                      <CompareRow
                        label="Classrooms"
                        values={vals((d) => fmt(d.totalClassrooms), "—")}
                      />
                      <CompareRow
                        label="Labs"
                        values={vals((d) => fmt(d.totalLabs), "—")}
                      />
                      <CompareRow
                        label="Library Books"
                        values={vals((d) => fmt(d.libraryBooks), "—")}
                      />
                      <CompareRow
                        label="Total Buses"
                        values={vals((d) => fmt(d.totalBuses), "—")}
                      />
                    </>
                  )}

                  {/* ═══ SECTION 7 — Facilities & Sports ═══ */}
                  <SectionHeader
                    label="Facilities & Sports"
                    colSpan={colSpan}
                  />
                  {isAnyLoading ? (
                    <SkeletonRow cols={selectedCards.length} />
                  ) : (
                    <>
                      <CompareRow
                        label="Facilities"
                        values={vals(
                          (d) =>
                            d.facilitiesList?.length
                              ? `${d.facilitiesList.length} — ${fmtList(d.facilitiesList)}`
                              : "—",
                          "—",
                        )}
                      />
                      <CompareRow
                        label="Sports"
                        values={vals(
                          (d) =>
                            d.sportsList?.length
                              ? `${d.sportsList.length} — ${fmtList(d.sportsList)}`
                              : "—",
                          "—",
                        )}
                      />
                    </>
                  )}

                  {/* ═══ SECTION 8 — Hostel & Transport ═══ */}
                  <SectionHeader label="Hostel & Transport" colSpan={colSpan} />
                  {isAnyLoading ? (
                    <SkeletonRow cols={selectedCards.length} />
                  ) : (
                    <>
                      <BoolRow
                        label="Hostel"
                        values={vals((d) => d.hostelAvailable, null)}
                      />
                      <BoolRow
                        label="Boys Hostel"
                        values={vals((d) => d.hostelBoys, null)}
                      />
                      <BoolRow
                        label="Girls Hostel"
                        values={vals((d) => d.hostelGirls, null)}
                      />
                      <BoolRow
                        label="Mess"
                        values={vals((d) => d.hostelMess, null)}
                      />
                      <CompareRow
                        label="Hostel Capacity"
                        values={vals(
                          (d) =>
                            d.hostelCapacity
                              ? `${d.hostelCapacity} students`
                              : "—",
                          "—",
                        )}
                      />
                      <BoolRow
                        label="Transport"
                        values={vals((d) => d.transportAvailable, null)}
                      />
                      <BoolRow
                        label="GPS Tracking"
                        values={vals((d) => d.gpsTracking, null)}
                      />
                      <CompareRow
                        label="Transport Areas"
                        values={vals((d) => fmt(d.transportAreas), "—")}
                      />
                    </>
                  )}

                  {/* ═══ SECTION 9 — Safety ═══ */}
                  <SectionHeader label="Safety" colSpan={colSpan} />
                  {isAnyLoading ? (
                    <SkeletonRow cols={selectedCards.length} />
                  ) : (
                    <>
                      <BoolRow
                        label="CCTV"
                        values={vals((d) => d.hasCCTV, null)}
                      />
                      <BoolRow
                        label="Security Guards"
                        values={vals((d) => d.hasGuards, null)}
                      />
                      <BoolRow
                        label="Medical Room"
                        values={vals((d) => d.hasMedicalRoom, null)}
                      />
                      <BoolRow
                        label="Fire Safety"
                        values={vals((d) => d.hasFireSafety, null)}
                      />
                      <BoolRow
                        label="Visitor Mgmt"
                        values={vals((d) => d.hasVisitorMgmt, null)}
                      />
                    </>
                  )}

                  {/* ═══ SECTION 10 — Student Life ═══ */}
                  <SectionHeader label="Student Life" colSpan={colSpan} />
                  {isAnyLoading ? (
                    <SkeletonRow cols={selectedCards.length} />
                  ) : (
                    <>
                      <CompareRow
                        label="Clubs"
                        values={vals((d) => fmt(d.clubsActivities), "—")}
                      />
                      <CompareRow
                        label="Annual Events"
                        values={vals((d) => fmt(d.annualEvents), "—")}
                      />
                      <CompareRow
                        label="Edu. Tours"
                        values={vals((d) => fmt(d.educationalTours), "—")}
                      />
                      <CompareRow
                        label="Achievements"
                        values={vals((d) => fmt(d.academicAchievements), "—")}
                      />
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-gray-400 text-center">
              Data shown is as filled by each school. Fields marked — are not
              yet provided by the school.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
