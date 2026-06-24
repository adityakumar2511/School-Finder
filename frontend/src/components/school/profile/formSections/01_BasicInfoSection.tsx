"use client";

import React from "react";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { ImageUploadField } from "@/components/shared/upload/ImageUploadField";
import {
  FormField,
  inputClass,
  inputErrorClass,
  selectClass,
} from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const MANAGEMENT_TYPES = [
  "Private School",
  "Government School",
  "Semi Government School",
  "Aided School",
  "Unaided School",
  "Trust Managed School",
  "Society Managed School",
  "Minority Institution",
  "Kendriya Vidyalaya",
  "Jawahar Navodaya Vidyalaya",
  "Sainik School",
  "Army Public School",
  "Railway School",
  "Municipal School",
  "International School",
  "Other",
];

const CATEGORIES = [
  "Play School / Preschool",
  "Pre Primary School",
  "Primary School",
  "Upper Primary / Middle School",
  "Secondary School",
  "Senior Secondary School",
];

const FORMATS = [
  "Day School",
  "Boarding School",
  "Day Boarding School",
  "Residential School",
];

const GENDERS: { label: string; value: string }[] = [
  { label: "Co-Educational", value: "CO_ED" },
  { label: "Boys Only", value: "BOYS" },
  { label: "Girls Only", value: "GIRLS" },
];

const BOARDS: { label: string; value: string }[] = [
  { label: "CBSE", value: "CBSE" },
  { label: "ICSE", value: "ICSE" },
  { label: "UP Board", value: "UP_BOARD" },
  { label: "Other", value: "OTHER" },
];

const MEDIUMS = ["English", "Hindi", "Both"];

const LANGUAGES = [
  "Hindi",
  "English",
  "Sanskrit",
  "French",
  "German",
  "Spanish",
];

const CLASSES = [
  "Daycare / Creche",
  "Toddler",
  "Play Group",
  "Pre-Nursery",
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

const DAYS = ["Monday-Friday", "Monday-Saturday", "All 7 days"];

// ─────────────────────────────────────────────────────────────
// Reusable inline custom item adder
// ─────────────────────────────────────────────────────────────

function AddCustomItem({ onAdd }: { onAdd: (val: string) => void }) {
  const [input, setInput] = React.useState("");

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
            if (input.trim()) {
              onAdd(input.trim());
              setInput("");
            }
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (input.trim()) {
            onAdd(input.trim());
            setInput("");
          }
        }}
        className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Add
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function BasicInfoSection({
  control,
  register,
  errors,
  watch,
  setValue,
}: SectionProps) {
  const {
    fields: customFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "basicInfo.customFields",
  });

  const classesSelected = watch("basicInfo.classesOffered") || [];
  const langsSelected = watch("basicInfo.languagesOffered") || [];

  function toggleArrayItem(
    field: "basicInfo.classesOffered" | "basicInfo.languagesOffered",
    value: string,
    current: string[],
  ) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, next);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">
          Basic Information
        </h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Core details about your school — name, type, board, and timings
        </p>
      </div>

      {/* ── Identity ───────────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Identity
          </p>

          {/* Logo + Cover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="School Logo">
              <ImageUploadField
                value={watch("basicInfo.logoUrl") || ""}
                onChange={(url) => setValue("basicInfo.logoUrl", url)}
                folder="logos"
              />
            </FormField>
            <FormField label="Cover Image">
              <ImageUploadField
                value={watch("basicInfo.coverImageUrl") || ""}
                onChange={(url) => setValue("basicInfo.coverImageUrl", url)}
                folder="gallery"
              />
            </FormField>
          </div>

          {/* School Name */}
          <FormField
            label="School Name"
            required
            htmlFor="schoolName"
            error={errors.basicInfo?.schoolName?.message}
          >
            <Input
              id="schoolName"
              placeholder="e.g. Delhi Public School, Varanasi"
              className={cn(
                inputClass,
                errors.basicInfo?.schoolName && inputErrorClass,
              )}
              {...register("basicInfo.schoolName")}
            />
          </FormField>

          {/* Tagline */}
          <FormField label="School Tagline" htmlFor="tagline">
            <Input
              id="tagline"
              placeholder="e.g. Nurturing minds, building futures"
              className={inputClass}
              {...register("basicInfo.tagline")}
            />
          </FormField>

          {/* Established Year */}
          <FormField label="Established Year" htmlFor="establishedYear">
            <Input
              id="establishedYear"
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              placeholder="e.g. 1995"
              className={cn(inputClass, "max-w-48")}
              {...register("basicInfo.establishedYear")}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ── Classification ─────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Classification
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Management Type">
              <select
                className={selectClass}
                {...register("basicInfo.managementType")}
              >
                <option value="">Select type</option>
                {MANAGEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="School Category">
              <select
                className={selectClass}
                {...register("basicInfo.category")}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="School Format">
              <select className={selectClass} {...register("basicInfo.format")}>
                <option value="">Select format</option>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Gender Type">
              <select
                className={selectClass}
                {...register("basicInfo.genderType")}
              >
                <option value="">Select gender type</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Board Affiliation">
              <select className={selectClass} {...register("basicInfo.board")}>
                <option value="">Select board</option>
                {BOARDS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Medium of Instruction">
              <select className={selectClass} {...register("basicInfo.medium")}>
                <option value="">Select medium</option>
                {MEDIUMS.map((m) => (
                  <option key={m} value={m.toUpperCase()}>
                    {m}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Location ───────────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Location
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="City">
              <Input
                placeholder="e.g. Varanasi"
                className={inputClass}
                {...register("basicInfo.city")}
              />
            </FormField>
            <FormField label="State">
              <Input
                placeholder="e.g. Uttar Pradesh"
                className={inputClass}
                {...register("basicInfo.state")}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Affiliation Details ────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Affiliation Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Affiliation Number">
              <Input
                placeholder="e.g. 2100123"
                className={inputClass}
                {...register("basicInfo.affiliationNumber")}
              />
            </FormField>
            <FormField label="Recognition Number">
              <Input
                placeholder="Recognition No."
                className={inputClass}
                {...register("basicInfo.recognitionNumber")}
              />
            </FormField>
            <FormField label="Affiliated Since">
              <Input
                type="number"
                placeholder="e.g. 2001"
                className={inputClass}
                {...register("basicInfo.affiliatedSince")}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Classes Offered ────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Classes Offered
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CLASSES.map((cls) => (
              <label
                key={cls}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors",
                  classesSelected.includes(cls)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200",
                )}
              >
                <input
                  type="checkbox"
                  checked={classesSelected.includes(cls)}
                  onChange={() =>
                    toggleArrayItem(
                      "basicInfo.classesOffered",
                      cls,
                      classesSelected,
                    )
                  }
                  className="rounded accent-blue-600"
                />
                <span className="font-body text-sm">{cls}</span>
              </label>
            ))}

            {/* Custom added classes as checkboxes */}
            {classesSelected
              .filter((c) => !CLASSES.includes(c))
              .map((cls) => (
                <label
                  key={cls}
                  className="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors bg-blue-50 border-blue-300 text-blue-700"
                >
                  <input
                    type="checkbox"
                    checked
                    onChange={() =>
                      toggleArrayItem(
                        "basicInfo.classesOffered",
                        cls,
                        classesSelected,
                      )
                    }
                    className="rounded accent-blue-600"
                  />
                  <span className="font-body text-sm">{cls}</span>
                </label>
              ))}
          </div>

          <AddCustomItem
            onAdd={(val) => {
              if (!classesSelected.includes(val)) {
                setValue("basicInfo.classesOffered", [...classesSelected, val]);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* ── Languages Offered ──────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Languages Offered
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LANGUAGES.map((lang) => (
              <label
                key={lang}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors",
                  langsSelected.includes(lang)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200",
                )}
              >
                <input
                  type="checkbox"
                  checked={langsSelected.includes(lang)}
                  onChange={() =>
                    toggleArrayItem(
                      "basicInfo.languagesOffered",
                      lang,
                      langsSelected,
                    )
                  }
                  className="rounded accent-blue-600"
                />
                <span className="font-body text-sm">{lang}</span>
              </label>
            ))}

            {/* Custom added languages as checkboxes */}
            {langsSelected
              .filter((l) => !LANGUAGES.includes(l))
              .map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors bg-blue-50 border-blue-300 text-blue-700"
                >
                  <input
                    type="checkbox"
                    checked
                    onChange={() =>
                      toggleArrayItem(
                        "basicInfo.languagesOffered",
                        lang,
                        langsSelected,
                      )
                    }
                    className="rounded accent-blue-600"
                  />
                  <span className="font-body text-sm">{lang}</span>
                </label>
              ))}
          </div>

          <AddCustomItem
            onAdd={(val) => {
              if (!langsSelected.includes(val)) {
                setValue("basicInfo.languagesOffered", [...langsSelected, val]);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* ── School Timings ─────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            School Timings
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField label="Start Time">
              <Input
                type="time"
                className={inputClass}
                {...register("basicInfo.startTime")}
              />
            </FormField>
            <FormField label="End Time">
              <Input
                type="time"
                className={inputClass}
                {...register("basicInfo.endTime")}
              />
            </FormField>
            <FormField label="Working Days">
              <select
                className={selectClass}
                {...register("basicInfo.workingDays")}
              >
                <option value="">Select days</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Uniform & Canteen ─────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Uniform &amp; Canteen
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Uniform Policy">
              <select
                className={selectClass}
                {...register("basicInfo.uniformPolicy")}
              >
                <option value="">Select policy</option>
                <option value="Mandatory">Mandatory</option>
                <option value="Optional">Optional</option>
                <option value="No Uniform">No Uniform</option>
              </select>
            </FormField>

            <FormField label="Canteen / Tiffin Service">
              <select
                className={selectClass}
                {...register("basicInfo.canteenAvailable")}
              >
                <option value="">Select option</option>
                <option value="Yes - Veg Only">Yes — Veg Only</option>
                <option value="Yes - Veg & Non-Veg">
                  Yes — Veg &amp; Non-Veg
                </option>
                <option value="Tiffin Service Only">Tiffin Service Only</option>
                <option value="No">No</option>
              </select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Custom Fields ──────────────────────────────────── */}
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
              No custom fields yet. Add any extra details about your school.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={cn(inputClass, "flex-1")}
                  {...register(`basicInfo.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  className={cn(inputClass, "flex-1")}
                  {...register(`basicInfo.customFields.${index}.value`)}
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
