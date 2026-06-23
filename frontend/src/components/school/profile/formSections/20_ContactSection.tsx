"use client";

import { Input } from "@/components/shared/ui/input";
import { Card, CardContent } from "@/components/shared/ui/card";
import {
  FormField,
  inputClass,
  inputErrorClass,
} from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

export default function ContactSection({ register, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">
          Contact Details
        </h2>
        <p className="font-body text-body text-gray-400 mt-1">
          How parents can reach your school — phone, email, address, location,
          and social media
        </p>
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Primary Contact
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Phone Number">
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

            <FormField
              label="Email Address"
              error={errors.contact?.email?.message}
            >
              <Input
                type="email"
                placeholder="e.g. info@yourschool.edu.in"
                className={cn(inputClass, errors.contact?.email && inputErrorClass)}
                {...register("contact.email")}
              />
            </FormField>

            <FormField
              label="School Website"
              error={errors.contact?.website?.message}
            >
              <Input
                type="url"
                placeholder="e.g. https://www.yourschool.edu.in"
                className={cn(
                  inputClass,
                  errors.contact?.website && inputErrorClass,
                )}
                {...register("contact.website")}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

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
            <FormField
              label="Latitude"
              error={errors.contact?.latitude?.message}
            >
              <Input
                type="number"
                step="any"
                placeholder="e.g. 25.4358"
                className={cn(
                  inputClass,
                  errors.contact?.latitude && inputErrorClass,
                )}
                {...register("contact.latitude")}
              />
            </FormField>

            <FormField
              label="Longitude"
              error={errors.contact?.longitude?.message}
            >
              <Input
                type="number"
                step="any"
                placeholder="e.g. 81.8463"
                className={cn(
                  inputClass,
                  errors.contact?.longitude && inputErrorClass,
                )}
                {...register("contact.longitude")}
              />
            </FormField>
          </div>

          <p className="font-body text-meta text-gray-400">
            Latitude/longitude are optional for now. They will be used for map
            preview and nearby schools after backend update.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-5">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Social Media
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Facebook Page">
              <Input
                type="url"
                placeholder="https://facebook.com/yourschool"
                className={inputClass}
                {...register("contact.facebook")}
              />
            </FormField>

            <FormField label="Instagram">
              <Input
                type="url"
                placeholder="https://instagram.com/yourschool"
                className={inputClass}
                {...register("contact.instagram")}
              />
            </FormField>

            <FormField label="YouTube Channel">
              <Input
                type="url"
                placeholder="https://youtube.com/@yourschool"
                className={inputClass}
                {...register("contact.youtube")}
              />
            </FormField>

            <FormField label="LinkedIn">
              <Input
                type="url"
                placeholder="https://linkedin.com/school/yourschool"
                className={inputClass}
                {...register("contact.linkedin")}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

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
            <FormField label="Coordinator Name" className="sm:col-span-2">
              <Input
                placeholder="e.g. Mrs. Priya Sharma"
                className={cn(inputClass, "sm:max-w-sm")}
                {...register("contact.admissionCoordinatorName")}
              />
            </FormField>

            <FormField label="Coordinator Phone">
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className={inputClass}
                {...register("contact.admissionPhone")}
              />
            </FormField>

            <FormField
              label="Coordinator Email"
              error={errors.contact?.admissionEmail?.message}
            >
              <Input
                type="email"
                placeholder="e.g. admissions@yourschool.edu.in"
                className={cn(
                  inputClass,
                  errors.contact?.admissionEmail && inputErrorClass,
                )}
                {...register("contact.admissionEmail")}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}