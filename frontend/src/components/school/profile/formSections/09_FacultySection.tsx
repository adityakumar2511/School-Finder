"use client";

import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import type { SectionProps } from "./types";

const textareaClass =
  "min-h-[100px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors resize-none";

export default function FacultySection({ register, watch }: SectionProps) {
  const total = watch("faculty.totalTeachers");
  const qualified = watch("faculty.qualifiedTeachers");

  const qualifiedPercent =
    total && qualified && Number(total) > 0
      ? Math.min(100, Math.round((Number(qualified) / Number(total)) * 100))
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Faculty</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Teaching staff strength, qualifications, and training programs
        </p>
      </div>

      {/* ── Staff Strength ──────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Staff Strength
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Total Teachers">
              <Input
                type="number"
                min={0}
                placeholder="e.g. 60"
                className={inputClass}
                {...register("faculty.totalTeachers")}
              />
            </FormField>

            <FormField label="Professionally Qualified Teachers">
              <Input
                type="number"
                min={0}
                placeholder="e.g. 52"
                className={inputClass}
                {...register("faculty.qualifiedTeachers")}
              />
            </FormField>
          </div>

          {qualifiedPercent !== null && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-gray-500">Qualified faculty ratio</p>
                <p className="font-heading text-sm font-semibold text-blue-700">
                  {qualifiedPercent}%
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${qualifiedPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Training Programs ───────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Training &amp; Development
          </p>

          <FormField label="Training Programs & Workshops">
            <Textarea
              placeholder="e.g. Annual teacher training workshops, Cambridge PD programs, CBSE orientation sessions…"
              className={textareaClass}
              {...register("faculty.trainingPrograms")}
            />
            <p className="font-body text-meta text-gray-400 mt-1">
              Describe any professional development programs your teachers attend.
            </p>
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}