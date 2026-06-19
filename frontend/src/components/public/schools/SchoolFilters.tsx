// frontend/src/components/SchoolFilters.tsx
// 'use client' — Sidebar filters for school listing page
// Reads/writes URL search params via useRouter + useSearchParams

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BoardType  = "CBSE" | "ICSE" | "UP_BOARD" | "OTHER";
type SchoolType = "BOYS" | "GIRLS" | "CO_ED";
type MediumType = "HINDI" | "ENGLISH" | "BOTH";

interface FilterGroup<T extends string> {
  label: string;
  param: string;
  options: { value: T; label: string }[];
}

// ─── Filter Config ────────────────────────────────────────────────────────────

const BOARD_OPTIONS: FilterGroup<BoardType> = {
  label: "Board",
  param: "board",
  options: [
    { value: "CBSE",     label: "CBSE"     },
    { value: "ICSE",     label: "ICSE"     },
    { value: "UP_BOARD", label: "UP Board" },
    { value: "OTHER",    label: "Other"    },
  ],
};

const TYPE_OPTIONS: FilterGroup<SchoolType> = {
  label: "School Type",
  param: "schoolType",
  options: [
    { value: "BOYS",  label: "Boys"  },
    { value: "GIRLS", label: "Girls" },
    { value: "CO_ED", label: "Co-Ed" },
  ],
};

const MEDIUM_OPTIONS: FilterGroup<MediumType> = {
  label: "Medium",
  param: "medium",
  options: [
    { value: "HINDI",   label: "Hindi"          },
    { value: "ENGLISH", label: "English"        },
    { value: "BOTH",    label: "Hindi + English" },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(
  base: URLSearchParams,
  param: string,
  value: string,
  checked: boolean
): string {
  const next = new URLSearchParams(base.toString());
  const existing = next.getAll(param);

  if (checked) {
    if (!existing.includes(value)) next.append(param, value);
  } else {
    next.delete(param);
    existing.filter((v) => v !== value).forEach((v) => next.append(param, v));
  }

  next.delete("page");

  const qs = next.toString();
  return qs ? `/schools?${qs}` : "/schools";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span className="text-label font-body font-semibold text-gray-700 uppercase tracking-wider">
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function CheckboxFilter<T extends string>({
  group,
  searchParams,
  onToggle,
}: {
  group: FilterGroup<T>;
  searchParams: URLSearchParams;
  onToggle: (param: string, value: string, checked: boolean) => void;
}) {
  const selected = searchParams.getAll(group.param);

  return (
    <CollapsibleSection title={group.label}>
      <div className="space-y-2.5">
        {group.options.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    onToggle(group.param, opt.value, e.target.checked)
                  }
                  className="sr-only"
                />
                <div
                  className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                    checked
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300 group-hover:border-blue-400"
                  }`}
                >
                  {checked && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span
                className={`text-body font-body transition-colors ${
                  checked
                    ? "text-blue-700 font-medium"
                    : "text-gray-600 group-hover:text-gray-800"
                }`}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────

const LABEL_MAP: Record<string, string> = {
  CBSE: "CBSE", ICSE: "ICSE", UP_BOARD: "UP Board", OTHER: "Other",
  BOYS: "Boys", GIRLS: "Girls", CO_ED: "Co-Ed",
  HINDI: "Hindi", ENGLISH: "English", BOTH: "Hindi+English",
};

function ActiveChips({
  searchParams,
  onClear,
  onRemove,
}: {
  searchParams: URLSearchParams;
  onClear: () => void;
  onRemove: (param: string, value: string) => void;
}) {
  const chips: { param: string; value: string }[] = [];
  ["board", "schoolType", "medium"].forEach((param) => {
    searchParams.getAll(param).forEach((value) => chips.push({ param, value }));
  });

  const city = searchParams.get("city");
  if (city) chips.push({ param: "city", value: city });

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {chips.map(({ param, value }) => (
        <span
          key={`${param}-${value}`}
          className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-label font-body"
        >
          {LABEL_MAP[value] ?? value}
          <button
            onClick={() => onRemove(param, value)}
            className="hover:text-blue-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1 text-label text-gray-400 hover:text-danger-text transition-colors ml-1"
      >
        <X className="w-3 h-3" /> Clear all
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SchoolFilters({ cities = [] }: { cities?: string[] }) {
  const router    = useRouter();
  const rawParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useCallback(
    (url: string) => router.push(url),
    [router]
  );

  function handleCheckbox(param: string, value: string, checked: boolean) {
    navigate(buildUrl(rawParams, param, value, checked));
  }

  function handleCityChange(city: string) {
    const next = new URLSearchParams(rawParams.toString());
    if (city) {
      next.set("city", city);
    } else {
      next.delete("city");
    }
    next.delete("page");
    navigate(next.toString() ? `/schools?${next.toString()}` : "/schools");
  }

  function handleRemoveChip(param: string, value: string) {
    if (param === "city") {
      const next = new URLSearchParams(rawParams.toString());
      next.delete("city");
      next.delete("page");
      navigate(next.toString() ? `/schools?${next.toString()}` : "/schools");
    } else {
      navigate(buildUrl(rawParams, param, value, false));
    }
  }

  function handleClearAll() {
    navigate("/schools");
  }

  const filtersContent = (
    <div className="space-y-0">
      {/* City dropdown */}
      <CollapsibleSection title="City">
        <select
          value={rawParams.get("city") ?? ""}
          onChange={(e) => handleCityChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-body font-body text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-gray-50"
        >
          <option value="">All Cities</option>
          {cities.filter(Boolean).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </CollapsibleSection>

      <CheckboxFilter
        group={BOARD_OPTIONS}
        searchParams={rawParams}
        onToggle={handleCheckbox}
      />
      <CheckboxFilter
        group={TYPE_OPTIONS}
        searchParams={rawParams}
        onToggle={handleCheckbox}
      />
      <CheckboxFilter
        group={MEDIUM_OPTIONS}
        searchParams={rawParams}
        onToggle={handleCheckbox}
      />
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h2 className="text-label font-heading font-semibold text-gray-800 uppercase tracking-wider">
              Filters
            </h2>
          </div>
          <ActiveChips
            searchParams={rawParams}
            onClear={handleClearAll}
            onRemove={handleRemoveChip}
          />
          {filtersContent}
        </div>
      </aside>

      {/* ── Mobile toggle button ──────────────────────────────────────────── */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-body font-body font-medium text-gray-700 shadow-sm hover:border-blue-300 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          Filters
          {["board", "schoolType", "medium"].some(
            (p) => rawParams.getAll(p).length > 0
          ) || rawParams.get("city") ? (
            <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full" />
          ) : null}
          {mobileOpen ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          )}
        </button>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="mt-2 bg-white rounded-2xl shadow-card border border-gray-100 p-5">
            <ActiveChips
              searchParams={rawParams}
              onClear={handleClearAll}
              onRemove={handleRemoveChip}
            />
            {filtersContent}
          </div>
        )}
      </div>
    </>
  );
}