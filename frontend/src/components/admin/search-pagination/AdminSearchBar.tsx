"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import Link from "next/link";

type Props = {
  placeholder?: string;
  basePath: string;
  currentQuery?: string;
  /** Distinct states for the state filter dropdown (optional — pass to enable) */
  states?: string[];
  /** Distinct cities for the city filter dropdown (optional — pass to enable) */
  cities?: string[];
  currentState?: string;
  currentCity?: string;
};

export default function AdminSearchBar({
  placeholder = "Search…",
  basePath,
  currentQuery = "",
  states,
  cities,
  currentState = "",
  currentCity = "",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(currentQuery);
  const [pending, startTransition] = useTransition();

  const showLocationFilters = Array.isArray(states);

  function navigate(params: URLSearchParams) {
    params.delete("page");
    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${basePath}?${query}` : basePath);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    navigate(params);
  }

  function onStateChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("state", value);
    else params.delete("state");
    // Changing state invalidates the previously selected city
    params.delete("city");
    navigate(params);
  }

  function onCityChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("city", value);
    else params.delete("city");
    navigate(params);
  }

  const hasQuery = Boolean(
    currentQuery || searchParams.get("q") || currentState || currentCity
  );

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="sm:max-w-sm"
        />
        <Button type="submit" disabled={pending}>
          Search
        </Button>
        {hasQuery && (
          <Button type="button" variant="outline" asChild>
            <Link href={basePath}>Clear</Link>
          </Button>
        )}
      </form>

      {showLocationFilters && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={currentState}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={pending}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 font-body text-sm text-gray-700 sm:max-w-xs"
          >
            <option value="">All states</option>
            {states?.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={currentCity}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={pending || !cities || cities.length === 0}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 font-body text-sm text-gray-700 sm:max-w-xs"
          >
            <option value="">All cities</option>
            {cities?.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}