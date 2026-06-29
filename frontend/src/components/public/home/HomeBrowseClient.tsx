"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Filter, MapPin } from "lucide-react";
import SchoolCard, {
  type SchoolCardProps,
} from "@/components/public/schools/SchoolCard";

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 6;


type BrowseSchool = SchoolCardProps & {
  board?: string | null;
  stateBoardName?: string | null;
  managementType?: string | null;
};
type HomeBrowseClientProps = {
  schools: BrowseSchool[];
  states: string[];
  cities: string[];
};

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getBoardLabel(school: BrowseSchool) {
  if (school.board === "STATE_BOARD" && school.stateBoardName) {
    return school.stateBoardName;
  }

  return school.board ? formatLabel(school.board) : "";
}

function getManagementType(school: BrowseSchool) {
  return String(school.managementType ?? "").trim();
}

export default function HomeBrowseClient({
  schools,
  states,
  cities,
}: HomeBrowseClientProps) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedManagementType, setSelectedManagementType] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const boardOptions = useMemo(() => {
    return Array.from(
      new Set(
        schools
          .map((school) => getBoardLabel(school))
          .filter((board): board is string => Boolean(board)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [schools]);

  const managementOptions = useMemo(() => {
    return Array.from(
      new Set(
        schools
          .map((school) => getManagementType(school))
          .filter((management): management is string => Boolean(management)),
      ),
    )
      .map(formatLabel)
      .sort((a, b) => a.localeCompare(b));
  }, [schools]);

  const cityOptions = useMemo(() => {
    if (!selectedState) {
      return cities;
    }

    return Array.from(
      new Set(
        schools
          .filter((school) => school.state === selectedState)
          .map((school) => school.city)
          .filter((city): city is string => Boolean(city)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [cities, schools, selectedState]);

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const schoolBoard = getBoardLabel(school);
      const schoolManagement = formatLabel(getManagementType(school));

      const stateMatch = selectedState ? school.state === selectedState : true;
      const cityMatch = selectedCity ? school.city === selectedCity : true;
      const boardMatch = selectedBoard ? schoolBoard === selectedBoard : true;
      const managementMatch = selectedManagementType
        ? schoolManagement === selectedManagementType
        : true;

      return stateMatch && cityMatch && boardMatch && managementMatch;
    });
  }, [
    schools,
    selectedBoard,
    selectedCity,
    selectedManagementType,
    selectedState,
  ]);

  const visibleSchools = filteredSchools.slice(0, visibleCount);
  const hasMoreSchools = visibleCount < filteredSchools.length;

  const schoolsUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (selectedState) {
      params.set("state", selectedState);
    }

    if (selectedCity) {
      params.set("city", selectedCity);
    }

    if (selectedBoard) {
      params.set("board", selectedBoard);
    }

    const query = params.toString();

    return query ? `/schools?${query}` : "/schools";
  }, [selectedBoard, selectedCity, selectedState]);

  const resetVisibleCount = () => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("");
    resetVisibleCount();
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    resetVisibleCount();
  };

  const handleBoardChange = (value: string) => {
    setSelectedBoard(value);
    resetVisibleCount();
  };

  const handleManagementTypeChange = (value: string) => {
    setSelectedManagementType(value);
    resetVisibleCount();
  };

  const handleClearFilters = () => {
    setSelectedState("");
    setSelectedCity("");
    setSelectedBoard("");
    setSelectedManagementType("");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="home-browse-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            Browse Schools
          </p>

          <h2
            id="home-browse-heading"
            className="mt-2 font-heading text-3xl font-bold text-blue-800"
          >
            Start Your School Search
          </h2>

          <p className="mt-3 font-body text-gray-500">
            Filter schools by state, city, board, and management type. Future me
            jaise-jaise new schools add honge, dropdown automatically update
            hote rahenge.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-gray-100 bg-gray-50 p-5 shadow-card sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Filter className="h-5 w-5 text-blue-600" aria-hidden />
            </div>

            <div>
              <h3 className="font-heading text-xl font-semibold text-blue-800">
                Browse by Filters
              </h3>
              <p className="font-body text-sm text-gray-500">
                Select filters to shortlist schools faster.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              id="home-state-filter"
              label="State"
              value={selectedState}
              onChange={handleStateChange}
              placeholder="All States"
              options={states}
            />

            <FilterSelect
              id="home-city-filter"
              label="City"
              value={selectedCity}
              onChange={handleCityChange}
              placeholder="All Cities"
              options={cityOptions}
            />

            <FilterSelect
              id="home-board-filter"
              label="Board"
              value={selectedBoard}
              onChange={handleBoardChange}
              placeholder="All Boards"
              options={boardOptions}
            />

            <FilterSelect
              id="home-management-filter"
              label="Management Type"
              value={selectedManagementType}
              onChange={handleManagementTypeChange}
              placeholder="All Management Types"
              options={managementOptions}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-body text-sm text-gray-500">
              Showing{" "}
              <span className="font-heading font-semibold text-blue-800">
                {Math.min(visibleSchools.length, filteredSchools.length)}
              </span>{" "}
              of{" "}
              <span className="font-heading font-semibold text-blue-800">
                {filteredSchools.length}
              </span>{" "}
              schools
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>

              <Link href={schoolsUrl} className="btn-primary">
                View Full Listing
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-2xl font-bold text-blue-800">
              Available Schools
            </h3>

            <p className="mt-1 font-body text-sm text-gray-500">
              Showing first {visibleSchools.length} result
              {visibleSchools.length === 1 ? "" : "s"} based on selected
              filters.
            </p>
          </div>

          <Link
            href="/schools"
            className="font-heading text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Explore all schools
          </Link>
        </div>

        {visibleSchools.length > 0 ? (
          <>
            <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleSchools.map((school) => (
                <div key={school.id} className="h-full">
                  <SchoolCard {...school} />
                </div>
              ))}
            </div>

            {hasMoreSchools ? (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) => count + LOAD_MORE_COUNT)
                  }
                  className="btn-primary"
                >
                  View More Schools
                  <ChevronDown className="ml-2 h-4 w-4" aria-hidden />
                </button>

                <p className="mt-3 font-body text-sm text-gray-500">
                  {filteredSchools.length - visibleSchools.length} more school
                  {filteredSchools.length - visibleSchools.length === 1
                    ? ""
                    : "s"}{" "}
                  available
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-gray-50 py-16 text-center">
            <MapPin
              className="mx-auto mb-3 h-10 w-10 text-gray-300"
              aria-hidden
            />
            <h3 className="font-heading text-xl font-semibold text-blue-800">
              No schools found
            </h3>
            <p className="mt-2 font-body text-sm text-gray-500">
              Try selecting another state, city, board, or management type.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-heading text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="form-input h-12 appearance-none pr-10"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {formatLabel(option)}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      </div>
    </div>
  );
}