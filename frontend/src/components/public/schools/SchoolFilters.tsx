// frontend/src/components/public/schools/SchoolFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BoardType  = "CBSE" | "ICSE" | "IB" | "IGCSE" | "NIOS" | "STATE_BOARD" | "OTHER";
type SchoolType = "BOYS" | "GIRLS" | "CO_ED";
type MediumType = "HINDI" | "ENGLISH" | "BOTH" | "OTHER";
type SchoolCategory =
  | "Play School / Preschool"
  | "Pre Primary School"
  | "Primary School"
  | "Upper Primary / Middle School"
  | "Secondary School"
  | "Senior Secondary School";

interface FilterOption<T extends string> {
  value: T;
  label: string;
  hasSubInput?: boolean; // renders a search input below when checked
}

interface FilterGroup<T extends string> {
  label: string;
  param: string;
  options: FilterOption<T>[];
}

// ─── Filter Config ────────────────────────────────────────────────────────────

const BOARD_OPTIONS: FilterGroup<BoardType> = {
  label: "Board",
  param: "board",
  options: [
    { value: "CBSE",        label: "CBSE"        },
    { value: "ICSE",        label: "ICSE"        },
    { value: "IB",          label: "IB"          },
    { value: "IGCSE",       label: "IGCSE"       },
    { value: "NIOS",        label: "NIOS"        },
    { value: "STATE_BOARD", label: "State Board", hasSubInput: true },
    { value: "OTHER",       label: "Other",       hasSubInput: true },
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
    { value: "HINDI",   label: "Hindi"           },
    { value: "ENGLISH", label: "English"         },
    { value: "BOTH",    label: "Hindi + English" },
    { value: "OTHER",   label: "Other"           },
  ],
};

const CATEGORY_OPTIONS: FilterGroup<SchoolCategory> = {
  label: "School Category",
  param: "schoolCategory",
  options: [
    { value: "Play School / Preschool",        label: "Play School / Preschool"        },
    { value: "Pre Primary School",             label: "Pre Primary School"             },
    { value: "Primary School",                 label: "Primary School"                 },
    { value: "Upper Primary / Middle School",  label: "Upper Primary / Middle School"  },
    { value: "Secondary School",               label: "Secondary School"               },
    { value: "Senior Secondary School",        label: "Senior Secondary School"        },
  ],
};

// ─── Label map for chips ──────────────────────────────────────────────────────

const LABEL_MAP: Record<string, string> = {
  CBSE:        "CBSE",
  ICSE:        "ICSE",
  IB:          "IB",
  IGCSE:       "IGCSE",
  NIOS:        "NIOS",
  STATE_BOARD: "State Board",
  OTHER:       "Other",
  BOYS:        "Boys",
  GIRLS:       "Girls",
  CO_ED:       "Co-Ed",
  HINDI:       "Hindi",
  ENGLISH:     "English",
  BOTH:        "Hindi+English",
};

// ─── URL helpers ──────────────────────────────────────────────────────────────

function buildUrl(
  base: URLSearchParams,
  param: string,
  value: string,
  checked: boolean,
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

// Sub-input shown below STATE_BOARD or OTHER when selected
function BoardSubInput({
  paramName,
  placeholder,
  searchParams,
  onChange,
}: {
  paramName: string;
  placeholder: string;
  searchParams: URLSearchParams;
  onChange: (val: string) => void;
}) {
  const value = searchParams.get(paramName) ?? "";

  return (
    <div className="mt-2 ml-6 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-body font-body text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function CheckboxFilter<T extends string>({
  group,
  searchParams,
  onToggle,
  onSubInput,
}: {
  group: FilterGroup<T>;
  searchParams: URLSearchParams;
  onToggle: (param: string, value: string, checked: boolean) => void;
  onSubInput?: (paramName: string, value: string) => void;
}) {
  const selected = searchParams.getAll(group.param);

  return (
    <CollapsibleSection title={group.label}>
      <div className="space-y-2.5">
        {group.options.map((opt) => {
          const checked = selected.includes(opt.value);

          // Determine sub-input param name based on which option
          const subParamName =
            opt.value === "STATE_BOARD"
              ? "stateBoardName"
              : opt.value === "OTHER" && group.param === "board"
                ? "boardOther"
                : null;

          const subPlaceholder =
            opt.value === "STATE_BOARD"
              ? "e.g. UP Board, Maharashtra Board…"
              : "Search school name…";

          return (
            <div key={opt.value}>
              <label className="flex items-center gap-3 cursor-pointer group">
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

              {/* Sub-input: visible only when checked + hasSubInput */}
              {opt.hasSubInput && checked && subParamName && onSubInput && (
                <BoardSubInput
                  paramName={subParamName}
                  placeholder={subPlaceholder}
                  searchParams={searchParams}
                  onChange={(val) => onSubInput(subParamName, val)}
                />
              )}
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────

function ActiveChips({
  searchParams,
  onClear,
  onRemove,
}: {
  searchParams: URLSearchParams;
  onClear: () => void;
  onRemove: (param: string, value: string) => void;
}) {
  const chips: { param: string; value: string; label: string }[] = [];

  ["board", "schoolType", "medium", "schoolCategory"].forEach((param) => {
    searchParams.getAll(param).forEach((value) =>
      chips.push({ param, value, label: LABEL_MAP[value] ?? value }),
    );
  });

  const city = searchParams.get("city");
  if (city) chips.push({ param: "city", value: city, label: city });

  const stateBoardName = searchParams.get("stateBoardName");
  if (stateBoardName)
    chips.push({
      param: "stateBoardName",
      value: stateBoardName,
      label: `State: ${stateBoardName}`,
    });

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {chips.map(({ param, value, label }) => (
        <span
          key={`${param}-${value}`}
          className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-label font-body"
        >
          {label}
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
    [router],
  );

  function handleCheckbox(param: string, value: string, checked: boolean) {
    const next = new URLSearchParams(rawParams.toString());

    if (!checked) {
      // When unchecking STATE_BOARD, also clear stateBoardName
      if (param === "board" && value === "STATE_BOARD") {
        next.delete("stateBoardName");
      }
      // When unchecking OTHER board, also clear boardOther
      if (param === "board" && value === "OTHER") {
        next.delete("boardOther");
      }
    }

    navigate(buildUrl(next, param, value, checked));
  }

  function handleSubInput(paramName: string, value: string) {
    const next = new URLSearchParams(rawParams.toString());
    if (value) {
      next.set(paramName, value);
    } else {
      next.delete(paramName);
    }
    next.delete("page");
    navigate(next.toString() ? `/schools?${next.toString()}` : "/schools");
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
    if (param === "city" || param === "stateBoardName") {
      const next = new URLSearchParams(rawParams.toString());
      next.delete(param);
      next.delete("page");
      navigate(next.toString() ? `/schools?${next.toString()}` : "/schools");
    } else {
      handleCheckbox(param, value, false);
    }
  }

  function handleClearAll() {
    navigate("/schools");
  }

  const hasActiveFilters =
    ["board", "schoolType", "medium"].some(
      (p) => rawParams.getAll(p).length > 0,
    ) ||
    Boolean(rawParams.get("city")) ||
    Boolean(rawParams.get("stateBoardName")) ||
    Boolean(rawParams.get("schoolCategory"));

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
        onSubInput={handleSubInput}
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
      <CheckboxFilter
        group={CATEGORY_OPTIONS}
        searchParams={rawParams}
        onToggle={handleCheckbox}
      />
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
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

      {/* ── Mobile toggle button ──────────────────────────────────────── */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-body font-body font-medium text-gray-700 shadow-sm hover:border-blue-300 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full" />
          )}
          {mobileOpen ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          )}
        </button>

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