"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import {
  FormField,
  inputClass,
  inputErrorClass,
  selectClass,
} from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const PHONE_LABELS = ["Office", "Principal", "Admissions", "Reception", "Other"];

export default function ContactSection({ register, errors, control, watch }: SectionProps) {
  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: "contact.additionalPhones" });

  const {
    fields: coordinatorFields,
    append: appendCoordinator,
    remove: removeCoordinator,
  } = useFieldArray({ control, name: "contact.admissionCoordinators" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Contact Details</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          How parents can reach your school — phone, email, address, location, and social media
        </p>
      </div>

      {/* ── Primary Contact ─────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Primary Contact
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Primary Phone Number">
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className={inputClass}
                {...register("contact.phone")}
              />
            </FormField>

            <FormField label="WhatsApp Number">
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className={inputClass}
                {...register("contact.whatsapp")}
              />
              <p className="font-body text-meta text-gray-400 mt-1">
                Leave blank if same as phone
              </p>
            </FormField>

            <FormField label="Email Address" error={errors.contact?.email?.message}>
              <Input
                type="email"
                placeholder="e.g. info@yourschool.edu.in"
                className={cn(inputClass, errors.contact?.email && inputErrorClass)}
                {...register("contact.email")}
              />
            </FormField>

            <FormField label="School Website" error={errors.contact?.website?.message}>
              <Input
                type="url"
                placeholder="e.g. https://www.yourschool.edu.in"
                className={cn(inputClass, errors.contact?.website && inputErrorClass)}
                {...register("contact.website")}
              />
            </FormField>
          </div>

          {/* Additional Phone Numbers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-gray-500 font-medium">Additional Phone Numbers</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendPhone({ number: "", label: "Office" })}
                className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Number
              </Button>
            </div>

            {phoneFields.length === 0 && (
              <p className="font-body text-meta text-gray-400">
                Add more contact numbers — Principal, Admissions desk, etc.
              </p>
            )}

            {phoneFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="w-36 flex-shrink-0">
                  <select
                    className={selectClass}
                    {...register(`contact.additionalPhones.${index}.label`)}
                  >
                    {PHONE_LABELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <Input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  className={cn(inputClass, "flex-1")}
                  {...register(`contact.additionalPhones.${index}.number`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePhone(index)}
                  className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Address & Location ──────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Address &amp; Location
          </p>

          <FormField label="Full Address">
            <textarea
              className="w-full min-h-[90px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors px-3 py-2.5 resize-none outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
              placeholder="Street, locality, city, state, PIN code"
              rows={3}
              {...register("contact.address")}
            />
          </FormField>

          <FormField label="Google Maps Embed URL">
            <Input
              type="url"
              placeholder="Paste Google Maps embed link here"
              className={inputClass}
              {...register("contact.mapUrl")}
            />
            <p className="font-body text-meta text-gray-400 mt-1">
              Google Maps → Share → Embed a map → copy the{" "}
              <code className="text-xs bg-gray-100 px-1 rounded">src</code> URL
            </p>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Latitude" error={errors.contact?.latitude?.message}>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 25.4358"
                className={cn(inputClass, errors.contact?.latitude && inputErrorClass)}
                {...register("contact.latitude")}
              />
            </FormField>
            <FormField label="Longitude" error={errors.contact?.longitude?.message}>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 81.8463"
                className={cn(inputClass, errors.contact?.longitude && inputErrorClass)}
                {...register("contact.longitude")}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Social Media ────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Social Media
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Facebook Page">
              <Input type="url" placeholder="https://facebook.com/yourschool" className={inputClass} {...register("contact.facebook")} />
            </FormField>
            <FormField label="Instagram">
              <Input type="url" placeholder="https://instagram.com/yourschool" className={inputClass} {...register("contact.instagram")} />
            </FormField>
            <FormField label="YouTube Channel">
              <Input type="url" placeholder="https://youtube.com/@yourschool" className={inputClass} {...register("contact.youtube")} />
            </FormField>
            <FormField label="LinkedIn">
              <Input type="url" placeholder="https://linkedin.com/school/yourschool" className={inputClass} {...register("contact.linkedin")} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Admission Coordinators ──────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
                Admission Coordinators
              </p>
              <p className="font-body text-meta text-gray-400 mt-0.5">
                Dedicated contacts for admission enquiries
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCoordinator({ name: "", phone: "", email: "", designation: "" })}
              className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Coordinator
            </Button>
          </div>

          {coordinatorFields.length === 0 && (
            <p className="font-body text-meta text-gray-400 text-center py-3">
              No coordinators added yet. Add at least one admission contact.
            </p>
          )}

          <div className="space-y-4">
            {coordinatorFields.map((field, index) => (
              <div key={field.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm font-semibold text-gray-600">
                    Coordinator #{index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCoordinator(index)}
                    className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Name">
                    <Input
                      placeholder="e.g. Mrs. Priya Sharma"
                      className={inputClass}
                      {...register(`contact.admissionCoordinators.${index}.name`)}
                    />
                  </FormField>
                  <FormField label="Designation">
                    <Input
                      placeholder="e.g. Admissions Head"
                      className={inputClass}
                      {...register(`contact.admissionCoordinators.${index}.designation`)}
                    />
                  </FormField>
                  <FormField label="Phone">
                    <Input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      className={inputClass}
                      {...register(`contact.admissionCoordinators.${index}.phone`)}
                    />
                  </FormField>
                  <FormField label="Email">
                    <Input
                      type="email"
                      placeholder="e.g. admissions@yourschool.edu.in"
                      className={inputClass}
                      {...register(`contact.admissionCoordinators.${index}.email`)}
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}