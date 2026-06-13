"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const inputClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";

const textareaClass =
  "min-h-[100px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors resize-none";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

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
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Total Teachers</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 60"
                className={inputClass}
                {...register("faculty.totalTeachers")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">
                Professionally Qualified Teachers
              </Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 52"
                className={inputClass}
                {...register("faculty.qualifiedTeachers")}
              />
            </div>
          </div>

          {/* Live qualified % indicator */}
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
            Training & Development
          </p>
          <div className="space-y-1.5">
            <Label className="font-heading text-label text-gray-800">
              Training Programs & Workshops
            </Label>
            <Textarea
              placeholder="e.g. Annual teacher training workshops, Cambridge PD programs, CBSE orientation sessions…"
              className={textareaClass}
              {...register("faculty.trainingPrograms")}
            />
            <p className="font-body text-meta text-gray-400">
              Describe any professional development programs your teachers attend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}