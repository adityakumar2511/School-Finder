"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
      "Smart Classrooms",
      "Computer Lab",
      "Science Lab",
      "Physics Lab",
      "Chemistry Lab",
      "Biology Lab",
      "Mathematics Lab",
      "Language Lab",
      "Home Science Lab",
    ],
  },
  {
    heading: "Library & Learning",
    items: ["Library", "Digital Library", "Reading Room", "Audio-Visual Room"],
  },
  {
    heading: "Sports & Recreation",
    items: [
      "Playground",
      "Indoor Sports Hall",
      "Swimming Pool",
      "Gymnasium",
      "Yoga Room",
      "Dance Room",
      "Music Room",
      "Art & Craft Room",
    ],
  },
  {
    heading: "Health & Safety",
    items: [
      "Medical Room / Infirmary",
      "Counselling Room",
      "CCTV Surveillance",
      "Fire Safety System",
      "Security Guards",
    ],
  },
  {
    heading: "Other Amenities",
    items: [
      "Cafeteria / Canteen",
      "Drinking Water (RO)",
      "Auditorium / Hall",
      "Prayer Hall",
      "Parking Area",
      "Generator / Power Backup",
      "Solar Panels",
      "Wi-Fi Campus",
      "Ramps for Differently Abled",
    ],
  },
];

const ALL_PREDEFINED = FACILITY_GROUPS.flatMap((group) => group.items);

type CustomGroupMap = Record<string, string[]>;

function AddCustomItem({ onAdd }: { onAdd: (val: string) => void }) {
  const [input, setInput] = useState("");

  function submit() {
    const value = input.trim();
    if (!value) return;

    onAdd(value);
    setInput("");
  }

  return (
    <div className="flex gap-2 mt-2">
      <Input
        placeholder="+ Add your own..."
        className={cn(inputClass, "flex-1")}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={submit}
        className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add
      </Button>
    </div>
  );
}

function removeItemFromGroups(groups: CustomGroupMap, item: string): CustomGroupMap {
  return Object.fromEntries(
    Object.entries(groups)
      .map(([heading, items]) => [
        heading,
        items.filter((value) => value !== item),
      ])
      .filter(([, items]) => (items as string[]).length > 0),
  ) as CustomGroupMap;
}

export default function FacilitiesSection({ watch, setValue }: SectionProps) {
  const selected = (watch("facilities.items") ?? []) as string[];
  const customGroups =
    ((watch("facilities.customGroups") as CustomGroupMap | undefined) ?? {});

  function setSelected(next: string[]) {
    setValue("facilities.items", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function setCustomGroups(next: CustomGroupMap) {
    setValue("facilities.customGroups", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function toggle(item: string) {
    if (selected.includes(item)) {
      setSelected(selected.filter((value) => value !== item));
      setCustomGroups(removeItemFromGroups(customGroups, item));
      return;
    }

    setSelected([...selected, item]);
  }

  function addCustomToGroup(groupHeading: string, value: string) {
    const val = value.trim();
    if (!val) return;

    if (!selected.includes(val)) {
      setSelected([...selected, val]);
    }

    const currentGroupItems = customGroups[groupHeading] ?? [];
    if (!currentGroupItems.includes(val)) {
      setCustomGroups({
        ...customGroups,
        [groupHeading]: [...currentGroupItems, val],
      });
    }
  }

  function getCustomItemsForGroup(groupHeading: string, groupIndex: number) {
    const groupItems = customGroups[groupHeading] ?? [];

    const savedGroupItems = groupItems.filter(
      (item) => selected.includes(item) && !ALL_PREDEFINED.includes(item),
    );

    // Legacy fallback: old saved custom items have no group information.
    // Show them in the first group only until user removes/re-adds them.
    if (groupIndex !== 0) return savedGroupItems;

    const groupedCustomItems = new Set(
      Object.values(customGroups).flatMap((items) => items),
    );

    const legacyItems = selected.filter(
      (item) => !ALL_PREDEFINED.includes(item) && !groupedCustomItems.has(item),
    );

    return [...savedGroupItems, ...legacyItems];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">
          Facilities
        </h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Infrastructure and amenities available at your school
        </p>
      </div>

      {selected.length > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-heading text-label font-semibold text-blue-700">
            {selected.length}{" "}
            {selected.length === 1 ? "facility" : "facilities"} selected
          </span>
        </div>
      )}

      {FACILITY_GROUPS.map((group, groupIndex) => {
        const customItems = getCustomItemsForGroup(group.heading, groupIndex);

        return (
          <Card
            key={group.heading}
            className="border border-gray-100 shadow-card rounded-2xl bg-white"
          >
            <CardContent className="p-6 space-y-4">
              <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
                {group.heading}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <label
                    key={item}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                      selected.includes(item)
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200",
                    )}
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

                {customItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50 border-blue-300 text-blue-700"
                  >
                    <input
                      type="checkbox"
                      checked
                      onChange={() => toggle(item)}
                      className="rounded accent-blue-600 flex-shrink-0"
                    />

                    <span className="font-body text-body flex-1">{item}</span>

                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      className="text-blue-400 hover:text-blue-700 transition-colors flex-shrink-0"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <AddCustomItem
                onAdd={(value) => addCustomToGroup(group.heading, value)}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
