"use client";

import { Input } from "@/components/shared/ui/input";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const FIELDS: {
  key: keyof {
    campusArea: string;
    classrooms: string;
    labs: string;
    libraryBooks: string;
    hostelCapacity: string;
    buses: string;
    totalStudents: string;
  };
  label: string;
  placeholder: string;
  suffix?: string;
}[] = [
  {
    key: "campusArea",
    label: "Campus Area",
    placeholder: "e.g. 5",
    suffix: "acres",
  },
  {
    key: "classrooms",
    label: "Number of Classrooms",
    placeholder: "e.g. 40",
  },
  {
    key: "labs",
    label: "Number of Labs",
    placeholder: "e.g. 8",
  },
  {
    key: "libraryBooks",
    label: "Library Books",
    placeholder: "e.g. 10000",
    suffix: "books",
  },
  {
    key: "hostelCapacity",
    label: "Hostel Capacity",
    placeholder: "e.g. 200",
    suffix: "students",
  },
  {
    key: "buses",
    label: "Number of Buses",
    placeholder: "e.g. 15",
    suffix: "buses",
  },
  {
    key: "totalStudents",
    label: "Total Students Enrolled",
    placeholder: "e.g. 1200",
    suffix: "students",
  },
];

export default function InfrastructureSection({ register }: SectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">
          Infrastructure
        </h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Physical infrastructure details — campus, classrooms, labs, and more
        </p>
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Campus &amp; Facilities
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map(({ key, label, placeholder, suffix }) => (
              <FormField key={key} label={label}>
                {suffix ? (
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      placeholder={placeholder}
                      className={cn(inputClass, "pr-16")}
                      {...register(`infrastructure.${key}`)}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-gray-400">
                      {suffix}
                    </span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    min={0}
                    placeholder={placeholder}
                    className={inputClass}
                    {...register(`infrastructure.${key}`)}
                  />
                )}
              </FormField>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="font-body text-sm text-blue-600">
          💡 Accurate infrastructure data helps parents make informed decisions.
          Enter approximate figures if exact numbers aren't available.
        </p>
      </div>
    </div>
  );
}