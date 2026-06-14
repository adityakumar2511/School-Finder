"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, Trophy } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const CURRENT_YEAR = new Date().getFullYear();

export default function BoardResultsSection({
  control,
  register,
  watch,
}: SectionProps) {
  const { fields: results, append, remove } = useFieldArray({
    control,
    name: "boardResults.results",
  });

  const { fields: customFields, append: appendCustom, remove: removeCustom } = useFieldArray({
    control,
    name: "boardResults.customFields",
  });

  function addResult() {
    append({
      year:           String(CURRENT_YEAR),
      class10Percent: "",
      class12Percent: "",
      topperName:     "",
      topScore:       "",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Board Results</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Year-wise board exam performance — Class 10 &amp; Class 12
        </p>
      </div>

      {/* ── Results Repeater ────────────────────────────────── */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
            <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-body text-sm text-gray-400">No board results added yet.</p>
          </div>
        ) : (
          results.map((field, index) => (
            <Card key={field.id} className="border border-gray-100 shadow-card rounded-2xl bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-label font-semibold text-gray-700">
                    Result #{index + 1} — {watch(`boardResults.results.${index}.year`) || "Year"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <FormField label="Year">
                    <Input
                      type="number"
                      min={2000}
                      max={CURRENT_YEAR}
                      placeholder={String(CURRENT_YEAR)}
                      className={inputClass}
                      {...register(`boardResults.results.${index}.year`)}
                    />
                  </FormField>
                  <FormField label="Class 10 Pass %">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="e.g. 98"
                      className={inputClass}
                      {...register(`boardResults.results.${index}.class10Percent`)}
                    />
                  </FormField>
                  <FormField label="Class 12 Pass %">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="e.g. 96"
                      className={inputClass}
                      {...register(`boardResults.results.${index}.class12Percent`)}
                    />
                  </FormField>
                  <FormField label="Topper Name">
                    <Input
                      placeholder="e.g. Priya Sharma"
                      className={inputClass}
                      {...register(`boardResults.results.${index}.topperName`)}
                    />
                  </FormField>
                  <FormField label="Top Score">
                    <Input
                      placeholder="e.g. 498/500"
                      className={inputClass}
                      {...register(`boardResults.results.${index}.topScore`)}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addResult}
          className="w-full rounded-xl border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 font-heading text-sm h-11"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Year Result
        </Button>
      </div>

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
              onClick={() => appendCustom({ label: "", value: "", fieldType: "text" })}
              className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add field
            </Button>
          </div>

          {customFields.length === 0 && (
            <p className="font-body text-meta text-gray-400 text-center py-3">
              Add any extra result details — district rank, distinctions, etc.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={cn(inputClass, "flex-1")}
                  {...register(`boardResults.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  className={cn(inputClass, "flex-1")}
                  {...register(`boardResults.customFields.${index}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustom(index)}
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