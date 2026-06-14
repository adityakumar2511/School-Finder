"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const OUTDOOR_SPORTS = [
  "Cricket", "Football", "Basketball", "Volleyball", "Kabaddi",
  "Kho-Kho", "Athletics", "Hockey", "Tennis", "Badminton (Outdoor)",
  "Handball", "Baseball", "Softball", "Archery", "Swimming",
];

const INDOOR_SPORTS = [
  "Badminton", "Table Tennis", "Chess", "Carrom", "Boxing",
  "Wrestling", "Gymnastics", "Yoga", "Skating", "Taekwondo",
  "Judo", "Karate", "Shooting", "Billiards",
];

export default function SportsSection({
  control,
  register,
  watch,
  setValue,
}: SectionProps) {
  const { fields: customFields, append, remove } = useFieldArray({
    control,
    name: "sports.customFields",
  });

  const selected = watch("sports.items") ?? [];

  function toggle(sport: string) {
    const next = selected.includes(sport)
      ? selected.filter((s) => s !== sport)
      : [...selected, sport];
    setValue("sports.items", next);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Sports</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Select sports and physical activities offered at your school
        </p>
      </div>

      {/* ── Outdoor Sports ──────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Outdoor Sports
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OUTDOOR_SPORTS.map((sport) => (
              <label
                key={sport}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  selected.includes(sport)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(sport)}
                  onChange={() => toggle(sport)}
                  className="rounded accent-blue-600"
                />
                <span className="font-body text-sm">{sport}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Indoor Sports ───────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Indoor Sports
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INDOOR_SPORTS.map((sport) => (
              <label
                key={sport}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  selected.includes(sport)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(sport)}
                  onChange={() => toggle(sport)}
                  className="rounded accent-blue-600"
                />
                <span className="font-body text-sm">{sport}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Selected Summary ────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {selected.map((sport) => (
            <span
              key={sport}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-body text-sm"
            >
              {sport}
              <button
                type="button"
                onClick={() => toggle(sport)}
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
              Custom Fields
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "", value: "", fieldType: "text" })}
              className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add field
            </Button>
          </div>

          {customFields.length === 0 && (
            <p className="font-body text-meta text-gray-400 text-center py-3">
              Add extra details like coaching staff, achievements, or special programs.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={cn(inputClass, "flex-1")}
                  {...register(`sports.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  className={cn(inputClass, "flex-1")}
                  {...register(`sports.customFields.${index}.value`)}
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