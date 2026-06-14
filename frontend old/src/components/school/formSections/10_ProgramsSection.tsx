"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const PROGRAMS = [
  "Montessori", "Waldorf / Steiner", "IB PYP", "IB MYP", "IB DP",
  "Cambridge Primary", "Cambridge Lower Secondary", "Cambridge IGCSE",
  "Cambridge A Levels", "STEM Program", "Coding & Robotics",
  "Performing Arts", "Visual Arts", "Music Program", "Sports Academy",
  "Leadership Development", "Gifted & Talented", "Special Needs (Inclusive Ed)",
  "Vocational Training", "Environmental Education", "Model United Nations (MUN)",
  "Debate Club", "Entrepreneurship Program", "Exchange Program",
];

const inputClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function ProgramsSection({
  control,
  register,
  watch,
  setValue,
}: SectionProps) {
  const { fields: customFields, append, remove } = useFieldArray({
    control,
    name: "programs.customFields",
  });

  const selected = watch("programs.items") ?? [];

  function toggle(program: string) {
    const next = selected.includes(program)
      ? selected.filter((p) => p !== program)
      : [...selected, program];
    setValue("programs.items", next);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Programs & Specializations</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Special programs, curriculums, and co-curricular offerings at your school
        </p>
      </div>

      {/* ── Programs Grid ───────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Available Programs
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROGRAMS.map((program) => (
              <label
                key={program}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  selected.includes(program)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(program)}
                  onChange={() => toggle(program)}
                  className="rounded accent-blue-600"
                />
                <span className="font-body text-sm">{program}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Selected chips ──────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {selected.map((program) => (
            <span
              key={program}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-body text-sm"
            >
              {program}
              <button
                type="button"
                onClick={() => toggle(program)}
                className="hover:text-blue-900 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Custom Fields ───────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              Custom Programs
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "", value: "", fieldType: "text" })}
              className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>

          {customFields.length === 0 && (
            <p className="font-body text-meta text-gray-400 text-center py-3">
              Add any program not listed above.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Program name"
                  className={`${inputClass} flex-1`}
                  {...register(`programs.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Details (optional)"
                  className={`${inputClass} flex-1`}
                  {...register(`programs.customFields.${index}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}