"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GitCompare,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { SchoolCardProps } from "@/components/public/schools/SchoolCard";

const COMPARE_STORAGE_KEY = "schoolfinder_compare_schools";
const MAX_COMPARE = 3;

const BOARD_LABELS: Record<SchoolCardProps["board"], string> = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  UP_BOARD: "UP Board",
  OTHER: "Other",
};

const TYPE_LABELS: Record<SchoolCardProps["schoolType"], string> = {
  BOYS: "Boys",
  GIRLS: "Girls",
  CO_ED: "Co-Ed",
};

const MEDIUM_LABELS: Record<SchoolCardProps["medium"], string> = {
  HINDI: "Hindi",
  ENGLISH: "English",
  BOTH: "Hindi + English",
};

function readCompareSchools(): SchoolCardProps[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (school): school is SchoolCardProps =>
        Boolean(school?.id) &&
        Boolean(school?.name) &&
        Boolean(school?.slug),
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

function formatFee(value?: number | null) {
  if (!value) return "Fee on request";
  return `₹${value.toLocaleString("en-IN")} / month`;
}

export default function CompareClient({
  schools = [],
}: {
  schools?: SchoolCardProps[];
}) {
  const safeSchools = Array.isArray(schools) ? schools : [];

  const [selectedSchools, setSelectedSchools] = useState<SchoolCardProps[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  useEffect(() => {
    const sync = () => {
      setSelectedSchools(readCompareSchools());
    };

    sync();

    window.addEventListener("storage", sync);
    window.addEventListener("schoolfinder:compare-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("schoolfinder:compare-updated", sync);
    };
  }, []);

  const availableSchools = useMemo(() => {
    const selectedIds = new Set(selectedSchools.map((school) => school.id));
    return safeSchools.filter((school) => !selectedIds.has(school.id));
  }, [safeSchools, selectedSchools]);

  function handleAddSchool() {
    if (!selectedSchoolId) return;

    const school = safeSchools.find((item) => item.id === selectedSchoolId);
    if (!school) return;

    if (selectedSchools.some((item) => item.id === school.id)) {
      setSelectedSchoolId("");
      return;
    }

    if (selectedSchools.length >= MAX_COMPARE) {
      alert("You can compare maximum 3 schools at a time.");
      return;
    }

    const nextSchools = [...selectedSchools, school];
    setSelectedSchools(nextSchools);
    writeCompareSchools(nextSchools);
    setSelectedSchoolId("");
  }

  function handleRemoveSchool(id: string) {
    const nextSchools = selectedSchools.filter((school) => school.id !== id);
    setSelectedSchools(nextSchools);
    writeCompareSchools(nextSchools);
  }

  function handleClearAll() {
    setSelectedSchools([]);
    writeCompareSchools([]);
  }

  return (
    <main className="min-h-screen bg-gray-50">
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
                Select 2–3 schools and compare them on board, medium, classes,
                fees, facilities, and location.
              </p>
            </div>

            {selectedSchools.length > 0 && (
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-8">
          <h2 className="font-heading text-h3 text-blue-800 mb-2">
            Add schools to compare
          </h2>

          <p className="font-body text-body text-gray-500 mb-5">
            You can compare maximum {MAX_COMPARE} schools at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedSchoolId}
              onChange={(event) => setSelectedSchoolId(event.target.value)}
              disabled={selectedSchools.length >= MAX_COMPARE}
              className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-body text-body focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            >
              <option value="">
                {selectedSchools.length >= MAX_COMPARE
                  ? "Maximum 3 schools selected"
                  : "Select a school"}
              </option>

              {availableSchools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} — {school.city}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddSchool}
              disabled={!selectedSchoolId || selectedSchools.length >= MAX_COMPARE}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 text-white font-heading text-btn hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add to compare
            </button>
          </div>

          {safeSchools.length === 0 && (
            <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              No schools loaded. Please check backend connection or approved
              school listings.
            </p>
          )}
        </div>

        {selectedSchools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <GitCompare className="w-8 h-8 text-blue-500" />
            </div>

            <h2 className="font-heading text-h2 text-blue-800 mb-2">
              No schools selected yet
            </h2>

            <p className="font-body text-body text-gray-500 max-w-md mx-auto mb-6">
              Add schools from the dropdown above or click “Compare” from school
              listing cards.
            </p>

            <Link
              href="/schools"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-heading text-btn hover:bg-blue-700 transition-colors"
            >
              Browse Schools
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              {selectedSchools.map((school) => (
                <div
                  key={school.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveSchool(school.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center"
                    aria-label={`Remove ${school.name} from compare`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="font-heading text-h3 text-gray-900 pr-10 mb-2">
                    {school.name}
                  </h3>

                  <p className="font-body text-label text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {school.city}, {school.state}
                  </p>

                  <Link
                    href={`/schools/${school.slug}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View profile
                  </Link>
                </div>
              ))}
            </div>

            {selectedSchools.length < 2 && (
              <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                Add at least one more school to see a proper side-by-side
                comparison.
              </div>
            )}

            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-card">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-4 font-heading text-label text-gray-500 uppercase tracking-wide">
                      Criteria
                    </th>
                    {selectedSchools.map((school) => (
                      <th
                        key={school.id}
                        className="px-5 py-4 font-heading text-label text-gray-800 min-w-56"
                      >
                        {school.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <CompareRow
                    label="Location"
                    values={selectedSchools.map(
                      (school) => `${school.city}, ${school.state}`,
                    )}
                  />
                  <CompareRow
                    label="Board"
                    values={selectedSchools.map(
                      (school) => BOARD_LABELS[school.board],
                    )}
                  />
                  <CompareRow
                    label="School Type"
                    values={selectedSchools.map(
                      (school) => TYPE_LABELS[school.schoolType],
                    )}
                  />
                  <CompareRow
                    label="Medium"
                    values={selectedSchools.map(
                      (school) => MEDIUM_LABELS[school.medium],
                    )}
                  />
                  <CompareRow
                    label="Classes"
                    values={selectedSchools.map(
                      (school) => `${school.classesFrom}–${school.classesTo}`,
                    )}
                  />
                  <CompareRow
                    label="Monthly Fee"
                    values={selectedSchools.map((school) =>
                      formatFee(school.tuitionFeeMonthly),
                    )}
                  />
                  <CompareRow
                    label="Facilities"
                    values={selectedSchools.map((school) =>
                      typeof school.facilitiesCount === "number" &&
                      school.facilitiesCount > 0
                        ? `${school.facilitiesCount} facilities`
                        : "Not specified",
                    )}
                  />
                  <CompareRow
                    label="Featured"
                    values={selectedSchools.map((school) =>
                      school.isFeatured ? "Yes" : "No",
                    )}
                  />
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function CompareRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-5 py-4 font-heading text-label text-gray-500 uppercase tracking-wide bg-gray-50">
        {label}
      </td>

      {values.map((value, index) => (
        <td
          key={`${label}-${index}`}
          className="px-5 py-4 font-body text-body text-gray-700"
        >
          {value}
        </td>
      ))}
    </tr>
  );
}