"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import type { SectionProps } from "./types";

const textareaClass =
  "min-h-[80px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors resize-none";

export default function ScholarshipsSection({
  control,
  register,
  watch,
}: SectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "scholarships.list",
  });

  function addScholarship() {
    append({ name: "", eligibility: "", benefits: "" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Scholarships</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Financial aid, merit scholarships, and fee concessions offered by your school
        </p>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
            <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-body text-sm text-gray-400">No scholarships added yet.</p>
          </div>
        ) : (
          fields.map((field, index) => (
            <Card key={field.id} className="border border-gray-100 shadow-card rounded-2xl bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-label font-semibold text-gray-700">
                    {watch(`scholarships.list.${index}.name`) || `Scholarship #${index + 1}`}
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

                <FormField label="Scholarship Name">
                  <Input
                    placeholder="e.g. Merit Scholarship, Sports Quota, RTE Scholarship…"
                    className={inputClass}
                    {...register(`scholarships.list.${index}.name`)}
                  />
                </FormField>

                <FormField label="Eligibility Criteria">
                  <Textarea
                    placeholder="e.g. Students scoring above 90% in previous board exams…"
                    className={textareaClass}
                    {...register(`scholarships.list.${index}.eligibility`)}
                  />
                </FormField>

                <FormField label="Benefits">
                  <Textarea
                    placeholder="e.g. 50% fee waiver, full tuition coverage, monthly stipend…"
                    className={textareaClass}
                    {...register(`scholarships.list.${index}.benefits`)}
                  />
                </FormField>
              </CardContent>
            </Card>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addScholarship}
          className="w-full rounded-xl border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 font-heading text-sm h-11"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Scholarship
        </Button>
      </div>
    </div>
  );
}