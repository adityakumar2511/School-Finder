"use client";

import { useFieldArray } from "react-hook-form";
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { ImageUploadField } from "@/components/shared/upload/ImageUploadField";
import { FormField, inputClass, selectClass } from "@/components/shared/form/FormField";
import type { SectionProps } from "./types";

const CATEGORIES = [
  { value: "campus",    label: "Campus"    },
  { value: "classroom", label: "Classroom" },
  { value: "sports",    label: "Sports"    },
  { value: "events",    label: "Events"    },
  { value: "other",     label: "Other"     },
];

export default function GallerySection({
  control, register, watch, setValue,
}: SectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "gallery.images",
  });

  function handleUploaded(url: string) {
    append({ url, caption: "", category: "campus" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Gallery</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Showcase your school — campus, classrooms, sports facilities, and events
        </p>
      </div>

      {/* ── Upload ──────────────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              Add Photos
            </p>
            <span className="font-body text-meta text-gray-400">
              {fields.length} photo{fields.length !== 1 ? "s" : ""} added
            </span>
          </div>

          <ImageUploadField
            label="Upload photo"
            folder="gallery"
            hint="Images are automatically compressed. Max 5MB each."
            onUploaded={handleUploaded}
          />
        </CardContent>
      </Card>

      {/* ── Image Grid ──────────────────────────────────────── */}
      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
          <ImagePlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="font-body text-sm text-gray-400">No photos yet. Upload your first image above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const url = watch(`gallery.images.${index}.url`);
            return (
              <Card
                key={field.id}
                className="border border-gray-100 shadow-card rounded-2xl bg-white overflow-hidden"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4 items-start">
                    <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {url ? (
                        <Image
                          src={url}
                          alt={`Gallery image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImagePlus className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Caption">
                        <Input
                          placeholder="e.g. Annual Sports Day 2024"
                          className={inputClass}
                          {...register(`gallery.images.${index}.caption`)}
                        />
                      </FormField>
                      <FormField label="Category">
                        <select
                          className={selectClass}
                          {...register(`gallery.images.${index}.category`)}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>

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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {fields.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {CATEGORIES.map((cat) => {
            const count = fields.filter(
              (_, i) => watch(`gallery.images.${i}.category`) === cat.value
            ).length;
            if (count === 0) return null;
            return (
              <span
                key={cat.value}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-body text-sm"
              >
                {cat.label}
                <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs font-heading">
                  {count}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}