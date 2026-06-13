"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Shared classes (match BasicInfoSection exactly)
// ─────────────────────────────────────────────────────────────

const inputClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";

const textareaClass =
  "w-full min-h-[120px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors px-3 py-2.5 resize-y outline-none focus-visible:ring-2 focus-visible:ring-offset-0";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function AboutSchoolSection({
  control,
  register,
}: SectionProps) {
  const { fields: customFields, append, remove } = useFieldArray({
    control,
    name: "about.customFields",
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">About School</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Tell parents about your school's story, values, and leadership
        </p>
      </div>

      {/* ── About ─────────────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            School Overview
          </p>

          <div className="space-y-1.5">
            <Label className="font-heading text-label text-gray-800">About the School</Label>
            <textarea
              className={textareaClass}
              placeholder="Write a brief overview of your school — its history, values, and what makes it unique…"
              rows={5}
              {...register("about.about")}
            />
            <p className="font-body text-meta text-gray-400">
              This appears on your public school profile. Keep it engaging and informative.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Vision & Mission ──────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Vision &amp; Mission
          </p>

          <div className="space-y-1.5">
            <Label className="font-heading text-label text-gray-800">Our Vision</Label>
            <textarea
              className={textareaClass}
              placeholder="What is the long-term vision of your school?"
              rows={3}
              {...register("about.vision")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-heading text-label text-gray-800">Our Mission</Label>
            <textarea
              className={textareaClass}
              placeholder="What is your school's mission statement?"
              rows={3}
              {...register("about.mission")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Principal's Message ───────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Principal's Message
          </p>

          <div className="space-y-1.5">
            <Label className="font-heading text-label text-gray-800">Message from the Principal</Label>
            <textarea
              className={textareaClass}
              placeholder="A personal message from the school principal to parents and students…"
              rows={6}
              {...register("about.principalMessage")}
            />
            <p className="font-body text-meta text-gray-400">
              A personal note builds trust with prospective parents.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Custom Fields ─────────────────────────────────── */}
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
              No custom fields yet. Add any extra details like awards, accreditations, etc.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={`${inputClass} flex-1`}
                  {...register(`about.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  className={`${inputClass} flex-1`}
                  {...register(`about.customFields.${index}.value`)}
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