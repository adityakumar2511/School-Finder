"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUploadField } from "@/components/upload/ImageUploadField";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const MANAGEMENT_TYPES = [
  "Private School", "Government School", "Semi Government School",
  "Aided School", "Unaided School", "Trust Managed School",
  "Society Managed School", "Minority Institution", "Kendriya Vidyalaya",
  "Jawahar Navodaya Vidyalaya", "Sainik School", "Army Public School",
  "Railway School", "Municipal School", "International School", "Other",
];

const CATEGORIES = [
  "Pre Primary", "Primary", "Middle School",
  "Secondary School", "Senior Secondary School", "K-12 School",
];

const FORMATS   = ["Day School", "Boarding School", "Day Boarding School", "Residential School"];
const GENDERS   = ["Co-Educational", "Boys Only", "Girls Only"];
const BOARDS    = ["CBSE", "ICSE", "ISC", "State Board", "IB", "Cambridge IGCSE", "NIOS", "Other"];
const MEDIUMS   = ["English", "Hindi", "Urdu", "Sanskrit", "Bengali", "Marathi", "Tamil", "Telugu", "Gujarati", "Punjabi", "Other"];
const LANGUAGES = ["Hindi", "English", "Sanskrit", "French", "German", "Spanish", "Other"];
const CLASSES   = ["Play Group", "Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
const DAYS      = ["Monday-Friday", "Monday-Saturday", "All 7 days"];

const inputClass = "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";
const inputErrorClass = "border-red-400 bg-red-50/30";
const selectClass = `${inputClass} cursor-pointer`;

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function BasicInfoSection({
  control, register, errors, watch, setValue,
}: SectionProps) {
  const { fields: customFields, append, remove } = useFieldArray({
    control,
    name: "basicInfo.customFields",
  });

  const classesSelected = watch("basicInfo.classesOffered") || [];
  const langsSelected   = watch("basicInfo.languagesOffered") || [];

  function toggleArrayItem(
    field: "basicInfo.classesOffered" | "basicInfo.languagesOffered",
    value: string,
    current: string[]
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
        <h2 className="font-heading text-h2 font-bold text-blue-800">Basic Information</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Core details about your school — name, type, board, and timings
        </p>
      </div>

      {/* ── Identity ───────────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">Identity</p>

          {/* Logo + Cover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">School Logo</Label>
              <ImageUploadField
                value={watch("basicInfo.logoUrl") || ""}
                onChange={(url) => setValue("basicInfo.logoUrl", url)}
                folder="logos"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Cover Image</Label>
              <ImageUploadField
                value={watch("basicInfo.coverImageUrl") || ""}
                onChange={(url) => setValue("basicInfo.coverImageUrl", url)}
                folder="gallery"
              />
            </div>
          </div>

          {/* School Name */}
          <div className="space-y-1.5">
            <Label htmlFor="schoolName" className="font-heading text-label text-gray-800">
              School Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="schoolName"
              placeholder="e.g. Delhi Public School, Varanasi"
              className={`${inputClass} ${errors.basicInfo?.schoolName ? inputErrorClass : ""}`}
              {...register("basicInfo.schoolName")}
            />
            {errors.basicInfo?.schoolName && (
              <p className="font-body text-meta text-red-500">{errors.basicInfo.schoolName.message}</p>
            )}
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="font-heading text-label text-gray-800">School Tagline</Label>
            <Input
              id="tagline"
              placeholder="e.g. Nurturing minds, building futures"
              className={inputClass}
              {...register("basicInfo.tagline")}
            />
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <Label htmlFor="establishedYear" className="font-heading text-label text-gray-800">Established Year</Label>
            <Input
              id="establishedYear"
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              placeholder="e.g. 1995"
              className={`${inputClass} max-w-48`}
              {...register("basicInfo.establishedYear")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Classification ─────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">Classification</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Management Type */}
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Management Type</Label>
              <select className={selectClass} {...register("basicInfo.managementType")}>
                <option value="">Select type</option>
                {MANAGEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">School Category</Label>
              <select className={selectClass} {...register("basicInfo.category")}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">School Format</Label>
              <select className={selectClass} {...register("basicInfo.format")}>
                <option value="">Select format</option>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Gender Type</Label>
              <select className={selectClass} {...register("basicInfo.genderType")}>
                <option value="">Select gender type</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Board */}
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Board Affiliation</Label>
              <select className={selectClass} {...register("basicInfo.board")}>
                <option value="">Select board</option>
                {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Medium of Instruction</Label>
              <select className={selectClass} {...register("basicInfo.medium")}>
                <option value="">Select medium</option>
                {MEDIUMS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Location ───────────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">Location</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">City</Label>
              <Input placeholder="e.g. Varanasi" className={inputClass} {...register("basicInfo.city")} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">State</Label>
              <Input placeholder="e.g. Uttar Pradesh" className={inputClass} {...register("basicInfo.state")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Affiliation Details ────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">Affiliation Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Affiliation Number</Label>
              <Input placeholder="e.g. 2100123" className={inputClass} {...register("basicInfo.affiliationNumber")} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Recognition Number</Label>
              <Input placeholder="Recognition No." className={inputClass} {...register("basicInfo.recognitionNumber")} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Affiliated Since</Label>
              <Input type="number" placeholder="e.g. 2001" className={inputClass} {...register("basicInfo.affiliatedSince")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Classes Offered ────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">Classes Offered</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CLASSES.map((cls) => (
              <label
                key={cls}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  classesSelected.includes(cls)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={classesSelected.includes(cls)}
                  onChange={() => toggleArrayItem("basicInfo.classesOffered", cls, classesSelected)}
                  className="rounded accent-blue-600"
                />
                <span className="font-body text-sm">{cls}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Languages Offered ──────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">Languages Offered</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LANGUAGES.map((lang) => (
              <label
                key={lang}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  langsSelected.includes(lang)
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={langsSelected.includes(lang)}
                  onChange={() => toggleArrayItem("basicInfo.languagesOffered", lang, langsSelected)}
                  className="rounded accent-blue-600"
                />
                <span className="font-body text-sm">{lang}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── School Timings ─────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">School Timings</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Start Time</Label>
              <Input type="time" className={inputClass} {...register("basicInfo.startTime")} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">End Time</Label>
              <Input type="time" className={inputClass} {...register("basicInfo.endTime")} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Working Days</Label>
              <select className={selectClass} {...register("basicInfo.workingDays")}>
                <option value="">Select days</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Custom Fields ──────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">Custom Fields</p>
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
              No custom fields yet. Add any extra details about your school.
            </p>
          )}

          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Field name"
                  className={`${inputClass} flex-1`}
                  {...register(`basicInfo.customFields.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  className={`${inputClass} flex-1`}
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