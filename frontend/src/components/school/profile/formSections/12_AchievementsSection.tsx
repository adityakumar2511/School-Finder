"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const textareaClass =
  "min-h-[100px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors resize-none";

const FIELDS: { key: "academic" | "sports" | "awards" | "recognitions"; label: string; placeholder: string }[] = [
  { key: "academic",      label: "Academic Achievements",    placeholder: "e.g. 100% board pass rate for 5 consecutive years, 3 students in IIT top 100…" },
  { key: "sports",        label: "Sports Achievements",      placeholder: "e.g. State-level cricket champions 2023, National athletics gold medal…" },
  { key: "awards",        label: "Awards & Honours",         placeholder: "e.g. Best School Award by CBSE 2022, ISO 9001 certified institution…" },
  { key: "recognitions",  label: "Recognitions & Rankings",  placeholder: "e.g. Ranked #1 in district by Education Times 2023…" },
];

export default function AchievementsSection({
  control,
  register,
}: SectionProps) {
  const { fields: customFields, append, remove } = useFieldArray({
    control,
    name: "achievements.customFields",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Achievements</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Showcase your school's accomplishments — academic, sports, awards, and recognition
        </p>
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          {FIELDS.map(({ key, label, placeholder }) => (
            <FormField key={key} label={label}>
              <Textarea
                placeholder={placeholder}
                className={textareaClass}
                {...register(`achievements.${key}`)}
              />
            </FormField>
          ))}
        </CardContent>
      </Card>

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
              Add any other achievements or milestones.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={cn(inputClass, "flex-1")}
                  {...register(`achievements.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  className={cn(inputClass, "flex-1")}
                  {...register(`achievements.customFields.${index}.value`)}
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