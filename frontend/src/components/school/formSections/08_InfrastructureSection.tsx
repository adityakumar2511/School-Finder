"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const inputClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";

const FIELDS: {
  key: keyof {
    campusArea: string;
    classrooms: string;
    labs: string;
    libraryBooks: string;
    hostelCapacity: string;
    buses: string;
  };
  label: string;
  placeholder: string;
  suffix?: string;
}[] = [
  { key: "campusArea",     label: "Campus Area",        placeholder: "e.g. 5",    suffix: "acres" },
  { key: "classrooms",     label: "Number of Classrooms", placeholder: "e.g. 40" },
  { key: "labs",           label: "Number of Labs",     placeholder: "e.g. 8" },
  { key: "libraryBooks",   label: "Library Books",      placeholder: "e.g. 10000", suffix: "books" },
  { key: "hostelCapacity", label: "Hostel Capacity",    placeholder: "e.g. 200",   suffix: "students" },
  { key: "buses",          label: "Number of Buses",    placeholder: "e.g. 15",    suffix: "buses" },
];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function InfrastructureSection({ register }: SectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Infrastructure</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Physical infrastructure details — campus, classrooms, labs, and more
        </p>
      </div>

      {/* ── Infrastructure Stats ────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Campus & Facilities
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map(({ key, label, placeholder, suffix }) => (
              <div key={key} className="space-y-1.5">
                <Label className="font-heading text-label text-gray-800">{label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder={placeholder}
                    className={inputClass}
                    {...register(`infrastructure.${key}`)}
                  />
                  {suffix && (
                    <span className="font-body text-sm text-gray-400 whitespace-nowrap">
                      {suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Info note ───────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="font-body text-sm text-blue-600">
          💡 Accurate infrastructure data helps parents make informed decisions. Enter approximate figures if exact numbers aren't available.
        </p>
      </div>
    </div>
  );
}