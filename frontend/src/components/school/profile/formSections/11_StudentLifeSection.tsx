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

const FIELDS: { key: "clubs" | "culturalActivities" | "annualEvents" | "educationalTours"; label: string; placeholder: string }[] = [
  { key: "clubs",             label: "Clubs & Societies",        placeholder: "e.g. Science Club, Eco Club, Literary Society, Photography Club…" },
  { key: "culturalActivities",label: "Cultural Activities",      placeholder: "e.g. Annual cultural fest, dance competitions, drama performances…" },
  { key: "annualEvents",      label: "Annual Events",            placeholder: "e.g. Sports Day, Republic Day, Independence Day, Annual Function…" },
  { key: "educationalTours",  label: "Educational Tours & Trips",placeholder: "e.g. Heritage tours, science museum visits, nature camps…" },
];

export default function StudentLifeSection({
  control,
  register,
}: SectionProps) {
  const { fields: customFields, append, remove } = useFieldArray({
    control,
    name: "studentLife.customFields",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Student Life</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Beyond academics — clubs, events, tours, and cultural life at your school
        </p>
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          {FIELDS.map(({ key, label, placeholder }) => (
            <FormField key={key} label={label}>
              <Textarea
                placeholder={placeholder}
                className={textareaClass}
                {...register(`studentLife.${key}`)}
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
              Add any extra student life details not covered above.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={cn(inputClass, "flex-1")}
                  {...register(`studentLife.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  className={cn(inputClass, "flex-1")}
                  {...register(`studentLife.customFields.${index}.value`)}
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