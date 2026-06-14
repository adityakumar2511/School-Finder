"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const inputClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";

const SUGGESTIONS = [
  "Admission Form", "Fee Structure", "Prospectus",
  "School Calendar", "Syllabus", "Transport Route Map",
  "Hostel Rules", "Uniform List",
];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function DownloadsSection({
  control,
  register,
  watch,
}: SectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "downloads.files",
  });

  function addFile(label = "") {
    append({ label, url: "" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Downloads</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Documents and files parents can download — forms, prospectus, fee charts
        </p>
      </div>

      {/* ── Quick Add Suggestions ───────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-3">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Quick Add
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addFile(s)}
                className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 font-body text-sm hover:bg-blue-100 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Files List ──────────────────────────────────────── */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
            <FileDown className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-body text-sm text-gray-400">
              No files added yet. Use Quick Add above or add manually.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <Card
              key={field.id}
              className="border border-gray-100 shadow-card rounded-2xl bg-white"
            >
              <CardContent className="p-4">
                <div className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-heading text-label text-gray-700">File Label</Label>
                      <Input
                        placeholder="e.g. Admission Form 2025"
                        className={inputClass}
                        {...register(`downloads.files.${index}.label`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-heading text-label text-gray-700">File URL</Label>
                      <Input
                        type="url"
                        placeholder="https://…"
                        className={inputClass}
                        {...register(`downloads.files.${index}.url`)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* URL preview */}
                {watch(`downloads.files.${index}.url`) && (
                  <a
                    href={watch(`downloads.files.${index}.url`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 ml-0.5 inline-flex items-center gap-1 font-body text-xs text-blue-500 hover:underline"
                  >
                    <FileDown className="w-3 h-3" /> Preview link
                  </a>
                )}
              </CardContent>
            </Card>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => addFile()}
          className="w-full rounded-xl border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 font-heading text-sm h-11"
        >
          <Plus className="w-4 h-4 mr-2" /> Add File
        </Button>
      </div>
    </div>
  );
}