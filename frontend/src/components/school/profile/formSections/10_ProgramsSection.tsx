"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const PREDEFINED_PROGRAMS = [
  "Montessori",
  "Waldorf / Steiner",
  "IB PYP",
  "IB MYP",
  "IB DP",
  "Cambridge Primary",
  "Cambridge Lower Secondary",
  "Cambridge IGCSE",
  "Cambridge A Levels",
  "STEM Program",
  "Coding & Robotics",
  "Performing Arts",
  "Visual Arts",
  "Music Program",
  "Sports Academy",
  "Leadership Development",
  "Gifted & Talented",
  "Special Needs (Inclusive Ed)",
  "Vocational Training",
  "Environmental Education",
  "Model United Nations (MUN)",
  "Debate Club",
  "Entrepreneurship Program",
  "Exchange Program",
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

export default function ProgramsSection({ watch, setValue }: SectionProps) {
  const selected = (watch("programs.items") ?? []) as string[];

  const customItems = selected.filter(
    (program) => !PREDEFINED_PROGRAMS.includes(program),
  );

  function toggle(program: string) {
    const next = selected.includes(program)
      ? selected.filter((item) => item !== program)
      : [...selected, program];

    setValue("programs.items", next);
  }

  function addCustomProgram(value: string) {
    const val = value.trim();
    if (!val) return;

    if (!selected.includes(val)) {
      setValue("programs.items", [...selected, val]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">
          Programs & Specializations
        </h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Special programs, curriculums, and co-curricular offerings at your
          school
        </p>
      </div>

      {selected.length > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-heading text-label font-semibold text-blue-700">
            {selected.length}{" "}
            {selected.length === 1 ? "program" : "programs"} selected
          </span>
        </div>
      )}

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Available Programs
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Predefined programs */}
            {PREDEFINED_PROGRAMS.map((program) => (
              <label
                key={program}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors",
                  selected.includes(program)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(program)}
                  onChange={() => toggle(program)}
                  className="rounded accent-blue-600 flex-shrink-0"
                />

                <span className="font-body text-sm">{program}</span>
              </label>
            ))}

            {/* Custom programs */}
            {customItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 p-2.5 rounded-xl border bg-blue-50 border-blue-300 text-blue-700"
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggle(item)}
                  className="rounded accent-blue-600 flex-shrink-0"
                />

                <span className="font-body text-sm flex-1">{item}</span>

                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className="text-blue-400 hover:text-blue-700 transition-colors flex-shrink-0"
                  aria-label={`Remove ${item}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <AddCustomItem onAdd={addCustomProgram} />
        </CardContent>
      </Card>
    </div>
  );
}