"use client";

import { Label }  from "@/components/ui/label";
import { Input }  from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Shared classes
// ─────────────────────────────────────────────────────────────

const inputClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";

const inputErrorClass = "border-red-400 bg-red-50/30";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function ContactSection({
  register,
  errors,
}: SectionProps) {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Contact Details</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          How parents can reach your school — phone, email, address, and social media
        </p>
      </div>

      {/* ── Primary Contact ───────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Primary Contact
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Phone Number</Label>
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className={inputClass}
                {...register("contact.phone")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">WhatsApp Number</Label>
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className={inputClass}
                {...register("contact.whatsapp")}
              />
              <p className="font-body text-meta text-gray-400">
                Leave blank if same as phone
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Email Address</Label>
              <Input
                type="email"
                placeholder="e.g. info@yourschool.edu.in"
                className={`${inputClass} ${errors.contact?.email ? inputErrorClass : ""}`}
                {...register("contact.email")}
              />
              {errors.contact?.email && (
                <p className="font-body text-meta text-red-500">
                  {errors.contact.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">School Website</Label>
              <Input
                type="url"
                placeholder="e.g. https://www.yourschool.edu.in"
                className={`${inputClass} ${errors.contact?.website ? inputErrorClass : ""}`}
                {...register("contact.website")}
              />
              {errors.contact?.website && (
                <p className="font-body text-meta text-red-500">
                  {errors.contact.website.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Address & Map ─────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Address &amp; Location
          </p>

          <div className="space-y-1.5">
            <Label className="font-heading text-label text-gray-800">Full Address</Label>
            <textarea
              className="w-full min-h-[90px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors px-3 py-2.5 resize-none outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
              placeholder="Street, locality, city, state, PIN code"
              rows={3}
              {...register("contact.address")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-heading text-label text-gray-800">Google Maps Embed URL</Label>
            <Input
              type="url"
              placeholder="Paste Google Maps embed link here"
              className={inputClass}
              {...register("contact.mapUrl")}
            />
            <p className="font-body text-meta text-gray-400">
              Google Maps → Share → Embed a map → copy the <code className="text-xs bg-gray-100 px-1 rounded">src</code> URL
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Social Media ──────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Social Media
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Facebook Page</Label>
              <Input
                type="url"
                placeholder="https://facebook.com/yourschool"
                className={inputClass}
                {...register("contact.facebook")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Instagram</Label>
              <Input
                type="url"
                placeholder="https://instagram.com/yourschool"
                className={inputClass}
                {...register("contact.instagram")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">YouTube Channel</Label>
              <Input
                type="url"
                placeholder="https://youtube.com/@yourschool"
                className={inputClass}
                {...register("contact.youtube")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">LinkedIn</Label>
              <Input
                type="url"
                placeholder="https://linkedin.com/school/yourschool"
                className={inputClass}
                {...register("contact.linkedin")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Admission Coordinator ─────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <div>
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              Admission Coordinator
            </p>
            <p className="font-body text-meta text-gray-400 mt-0.5">
              Dedicated point of contact for admission enquiries
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="font-heading text-label text-gray-800">Coordinator Name</Label>
              <Input
                placeholder="e.g. Mrs. Priya Sharma"
                className={`${inputClass} sm:max-w-sm`}
                {...register("contact.admissionCoordinatorName")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Coordinator Phone</Label>
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className={inputClass}
                {...register("contact.admissionPhone")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-heading text-label text-gray-800">Coordinator Email</Label>
              <Input
                type="email"
                placeholder="e.g. admissions@yourschool.edu.in"
                className={`${inputClass} ${errors.contact?.admissionEmail ? inputErrorClass : ""}`}
                {...register("contact.admissionEmail")}
              />
              {errors.contact?.admissionEmail && (
                <p className="font-body text-meta text-red-500">
                  {errors.contact.admissionEmail.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}