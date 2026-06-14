"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

function ToggleRow({
  label, description, checked, onChange,
}: {
  label: string; description?: string; checked: boolean; onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
      <div>
        <p className="font-heading text-label text-gray-800">{label}</p>
        {description && (
          <p className="font-body text-meta text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function HostelSection({
  control, register, watch, setValue,
}: SectionProps) {
  const { fields: customFields, append, remove } = useFieldArray({
    control,
    name: "hostel.customFields",
  });

  const available = watch("hostel.available") ?? false;
  const boys      = watch("hostel.boys")      ?? false;
  const girls     = watch("hostel.girls")     ?? false;
  const mess      = watch("hostel.mess")      ?? false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Hostel</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Boarding and residential facilities for students
        </p>
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <ToggleRow
            label="Hostel Available"
            description="Does your school provide residential / boarding facility?"
            checked={available}
            onChange={(val) => setValue("hostel.available", val)}
          />

          {available && (
            <div className="space-y-4 pt-2">
              <ToggleRow label="Boys Hostel" checked={boys} onChange={(val) => setValue("hostel.boys", val)} />
              <ToggleRow label="Girls Hostel" checked={girls} onChange={(val) => setValue("hostel.girls", val)} />
              <ToggleRow
                label="Mess / Dining Facility"
                description="In-house mess or dining hall available"
                checked={mess}
                onChange={(val) => setValue("hostel.mess", val)}
              />

              <FormField label="Total Hostel Capacity">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 200"
                    className={cn(inputClass, "max-w-48")}
                    {...register("hostel.capacity")}
                  />
                  <span className="font-body text-sm text-gray-400">students</span>
                </div>
              </FormField>
            </div>
          )}
        </CardContent>
      </Card>

      {available && (
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
                Add extra hostel details — warden info, room types, fees, etc.
              </p>
            )}

            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <Input
                    placeholder="Field name"
                    className={cn(inputClass, "flex-1")}
                    {...register(`hostel.customFields.${index}.label`)}
                  />
                  <Input
                    placeholder="Value"
                    className={cn(inputClass, "flex-1")}
                    {...register(`hostel.customFields.${index}.value`)}
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
      )}
    </div>
  );
}