"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const textareaClass =
  "w-full min-h-[100px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors px-3 py-2.5 resize-y outline-none focus-visible:ring-2 focus-visible:ring-offset-0";

export default function AdmissionsSection({
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
    name: "admissions.customFields",
  });

  const admissionOpen = watch("admissions.admissionOpen") || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">
          Admissions
        </h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Admission status, important dates, eligibility criteria, and process
        </p>
      </div>

      {/* ── Admission Status ──────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Admission Status
          </p>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div>
              <p className="font-heading text-label font-semibold text-gray-800">
                Admissions Open
              </p>
              <p className="font-body text-meta text-gray-400 mt-0.5">
                Toggle to show parents that you are currently accepting
                applications
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={admissionOpen}
              onClick={() =>
                setValue("admissions.admissionOpen", !admissionOpen)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                admissionOpen ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  admissionOpen ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-heading font-semibold ${
              admissionOpen
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${admissionOpen ? "bg-green-500" : "bg-gray-400"}`}
            />
            {admissionOpen ? "Admissions Open" : "Admissions Closed"}
          </div>
        </CardContent>
      </Card>

      {/* ── Important Dates ───────────────────────────────── */}
      {/* ── Important Dates ───────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Important Dates
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Application Start Date">
              <Input
                type="date"
                className={inputClass}
                {...register("admissions.startDate")}
              />
            </FormField>
            <FormField label="Last Date to Apply">
              <Input
                type="date"
                min={watch("admissions.startDate") || undefined}
                className={inputClass}
                {...register("admissions.endDate")}
              />
              {(() => {
                const start = watch("admissions.startDate");
                const end = watch("admissions.endDate");
                if (start && end && end < start) {
                  return (
                    <p className="text-red-500 text-sm mt-1 font-body">
                      Last date cannot be before application start date
                    </p>
                  );
                }
                return null;
              })()}
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Eligibility & Documents ───────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Eligibility &amp; Documents
          </p>

          <FormField label="Age Criteria">
            <Input
              placeholder="e.g. Minimum 5 years as on 31st March for Class 1"
              className={inputClass}
              {...register("admissions.ageCriteria")}
            />
          </FormField>

          <FormField label="Required Documents">
            <textarea
              className={textareaClass}
              placeholder={`List documents required at the time of admission, e.g.\n• Birth certificate\n• Previous school TC\n• Aadhar card copy\n• Passport size photos`}
              rows={4}
              {...register("admissions.requiredDocuments")}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ── Admission Process ─────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              Admission Process
            </p>
            <p className="font-body text-meta text-gray-400 mt-0.5">
              Describe step-by-step how parents can apply
            </p>
          </div>

          <textarea
            className={textareaClass}
            placeholder={`e.g.\n1. Fill online application form on the school website\n2. Pay registration fee of ₹500\n3. Appear for interaction / entrance test\n4. Document verification\n5. Fee payment and admission confirmation`}
            rows={6}
            {...register("admissions.admissionProcess")}
          />
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
              onClick={() =>
                append({ label: "", value: "", fieldType: "text" })
              }
              className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add field
            </Button>
          </div>

          {customFields.length === 0 && (
            <p className="font-body text-meta text-gray-400 text-center py-3">
              No custom fields yet. Add details like registration fee, lottery
              date, etc.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={cn(inputClass, "flex-1")}
                  {...register(`admissions.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  className={cn(inputClass, "flex-1")}
                  {...register(`admissions.customFields.${index}.value`)}
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
