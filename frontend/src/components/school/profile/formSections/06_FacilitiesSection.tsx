"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const FACILITY_GROUPS: { heading: string; items: string[] }[] = [
  {
    heading: "Classrooms & Labs",
    items: [
      "Smart Classrooms", "Computer Lab", "Science Lab", "Physics Lab",
      "Chemistry Lab", "Biology Lab", "Mathematics Lab", "Language Lab", "Home Science Lab",
    ],
  },
  {
    heading: "Library & Learning",
    items: ["Library", "Digital Library", "Reading Room", "Audio-Visual Room"],
  },
  {
    heading: "Sports & Recreation",
    items: [
      "Playground", "Indoor Sports Hall", "Swimming Pool", "Gymnasium",
      "Yoga Room", "Dance Room", "Music Room", "Art & Craft Room",
    ],
  },
  {
    heading: "Health & Safety",
    items: [
      "Medical Room / Infirmary", "Counselling Room", "CCTV Surveillance",
      "Fire Safety System", "Security Guards",
    ],
  },
  {
    heading: "Other Amenities",
    items: [
      "Cafeteria / Canteen", "Drinking Water (RO)", "Auditorium / Hall",
      "Prayer Hall", "Parking Area", "Generator / Power Backup",
      "Solar Panels", "Wi-Fi Campus", "Ramps for Differently Abled",
    ],
  },
];

export default function FacilitiesSection({
  control,
  register,
  watch,
  setValue,
}: SectionProps) {
  const { fields: customFields, append, remove } = useFieldArray({
    control,
    name: "facilities.customFields",
  });

  const selected = watch("facilities.items") || [];

  function toggle(item: string) {
    const next = selected.includes(item)
      ? selected.filter((v) => v !== item)
      : [...selected, item];
    setValue("facilities.items", next);
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Facilities</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Infrastructure and amenities available at your school
        </p>
      </div>

      {selected.length > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-heading text-label font-semibold text-blue-700">
            {selected.length} {selected.length === 1 ? "facility" : "facilities"} selected
          </span>
        </div>
      )}

      {FACILITY_GROUPS.map((group) => (
        <Card key={group.heading} className="border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="p-6 space-y-4">
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              {group.heading}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selected.includes(item)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(item)}
                    onChange={() => toggle(item)}
                    className="rounded accent-blue-600 flex-shrink-0"
                  />
                  <span className="font-body text-body">{item}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* ── Custom Facilities ─────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
                Other Facilities
              </p>
              <p className="font-body text-meta text-gray-400 mt-0.5">
                Add any facility not listed above
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "", value: "", fieldType: "text" })}
              className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>

          {customFields.length === 0 && (
            <p className="font-body text-meta text-gray-400 text-center py-3">
              No custom facilities yet.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Facility name (e.g. Robotics Lab)"
                  className={cn(inputClass, "flex-1")}
                  {...register(`facilities.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Details (optional)"
                  className={cn(inputClass, "flex-1")}
                  {...register(`facilities.customFields.${index}.value`)}
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