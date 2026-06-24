"use client";

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import {
  FormField,
  inputClass,
  selectClass,
} from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const PREDEFINED_STREAMS = [
  "Science (PCM)",
  "Science (PCB)",
  "Science (PCMB)",
  "Commerce",
  "Commerce with Maths",
  "Arts / Humanities",
  "Vocational",
];

const CALENDARS = [
  "April – March (Indian)",
  "June – May",
  "January – December",
  "September – August (IB/Cambridge)",
];

// ─────────────────────────────────────────────────────────────
// Same UI pattern as BasicInfo AddCustomItem
// ─────────────────────────────────────────────────────────────

function AddCustomItem({ onAdd }: { onAdd: (val: string) => void }) {
  const [input, setInput] = useState("");

  function submit() {
    const value = input.trim();
    if (!value) return;

    onAdd(value);
    setInput("");
  }

  return (
    <div className="flex gap-2 mt-2">
      <Input
        placeholder="+ Add your own..."
        className={cn(inputClass, "flex-1")}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={submit}
        className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add
      </Button>
    </div>
  );
}

export default function AcademicsSection({
  control,
  register,
  watch,
  setValue,
}: SectionProps) {
  const {
    fields: customFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "academics.customFields",
  });

  const streamsSelected = (watch("academics.streamsOffered") ?? []) as string[];

  const customStreams = streamsSelected.filter(
    (stream) => !PREDEFINED_STREAMS.includes(stream),
  );

  function toggleStream(value: string) {
    const next = streamsSelected.includes(value)
      ? streamsSelected.filter((stream) => stream !== value)
      : [...streamsSelected, value];

    setValue("academics.streamsOffered", next);
  }

  function addCustomStream(value: string) {
    const val = value.trim();
    if (!val) return;

    if (!streamsSelected.includes(val)) {
      setValue("academics.streamsOffered", [...streamsSelected, val]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">
          Academics
        </h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Streams offered, teaching ratio, and academic calendar details
        </p>
      </div>

      {/* ── Streams Offered ───────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              Streams Offered
            </p>
            <p className="font-body text-meta text-gray-400 mt-0.5">
              Applicable for Class 11–12 only. Select all that apply.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Predefined streams */}
            {PREDEFINED_STREAMS.map((stream) => (
              <label
                key={stream}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                  streamsSelected.includes(stream)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200",
                )}
              >
                <input
                  type="checkbox"
                  checked={streamsSelected.includes(stream)}
                  onChange={() => toggleStream(stream)}
                  className="rounded accent-blue-600 flex-shrink-0"
                />
                <span className="font-body text-body">{stream}</span>
              </label>
            ))}

            {/* Custom streams inline */}
            {customStreams.map((stream) => (
              <div
                key={stream}
                className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50 border-blue-300 text-blue-700"
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleStream(stream)}
                  className="rounded accent-blue-600 flex-shrink-0"
                />

                <span className="font-body text-body flex-1">{stream}</span>

                <button
                  type="button"
                  onClick={() => toggleStream(stream)}
                  className="text-blue-400 hover:text-blue-700 transition-colors flex-shrink-0"
                  aria-label={`Remove ${stream}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <AddCustomItem onAdd={addCustomStream} />
        </CardContent>
      </Card>

      {/* ── Teaching Details ──────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Teaching Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Student–Teacher Ratio">
              <Input
                placeholder="e.g. 25:1"
                className={inputClass}
                {...register("academics.studentTeacherRatio")}
              />
              <p className="font-body text-meta text-gray-400 mt-1">
                Average students per teacher
              </p>
            </FormField>

            <FormField label="Academic Calendar">
              <select
                className={selectClass}
                {...register("academics.academicCalendar")}
              >
                <option value="">Select calendar</option>
                {CALENDARS.map((calendar) => (
                  <option key={calendar} value={calendar}>
                    {calendar}
                  </option>
                ))}
              </select>
            </FormField>
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
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add field
            </Button>
          </div>

          {customFields.length === 0 && (
            <p className="font-body text-meta text-gray-400 text-center py-3">
              No custom fields yet. Add extra academic details like curriculum
              type, special pedagogy, etc.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={cn(inputClass, "flex-1")}
                  {...register(`academics.customFields.${index}.label`)}
                />

                <Input
                  placeholder="Value"
                  className={cn(inputClass, "flex-1")}
                  {...register(`academics.customFields.${index}.value`)}
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