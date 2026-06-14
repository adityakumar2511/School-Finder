"use client";

import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const textareaClass =
  "min-h-[100px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors resize-none";

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

export default function TransportSection({
  register, watch, setValue,
}: SectionProps) {
  const available   = watch("transport.available")   ?? false;
  const gpsTracking = watch("transport.gpsTracking") ?? false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Transport</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          School bus and transport facilities for students
        </p>
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <ToggleRow
            label="Transport Available"
            description="Does your school provide bus / transport service?"
            checked={available}
            onChange={(val) => setValue("transport.available", val)}
          />

          {available && (
            <div className="space-y-4 pt-2">
              <ToggleRow
                label="GPS Tracking on Buses"
                description="Real-time GPS tracking for parent safety"
                checked={gpsTracking}
                onChange={(val) => setValue("transport.gpsTracking", val)}
              />

              <FormField label="Number of Vehicles">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 15"
                    className={cn(inputClass, "max-w-48")}
                    {...register("transport.vehicles")}
                  />
                  <span className="font-body text-sm text-gray-400">buses / vans</span>
                </div>
              </FormField>

              <FormField label="Coverage Areas">
                <Textarea
                  placeholder="e.g. Civil Lines, Allenpur, Naini, Jhunsi, Phaphamau…"
                  className={textareaClass}
                  {...register("transport.coverageAreas")}
                />
                <p className="font-body text-meta text-gray-400 mt-1">
                  List the localities or areas covered by school transport.
                </p>
              </FormField>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}