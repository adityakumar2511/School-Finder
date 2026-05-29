"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SchoolDashboardSchool } from "@/lib/school/data";
import ImageUploadField from "@/components/upload/ImageUploadField";

type FormValues = {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  board: string;
  schoolType: string;
  medium: string;
  classesFrom: number;
  classesTo: number;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  admissionFee: string;
  tuitionFeeMonthly: string;
  totalAnnualFee: string;
  transportFee: string;
  hostelFee: string;
  totalStudents: string;
  establishedYear: string;
};

function toFormValues(school: SchoolDashboardSchool): FormValues {
  return {
    name: school.name,
    description: school.description ?? "",
    address: school.address,
    city: school.city,
    state: school.state,
    pincode: school.pincode ?? "",
    board: school.board,
    schoolType: school.schoolType,
    medium: school.medium,
    classesFrom: school.classesFrom,
    classesTo: school.classesTo,
    phone: school.phone,
    email: school.email ?? "",
    website: school.website ?? "",
    logoUrl: school.logoUrl ?? "",
    admissionFee: school.admissionFee?.toString() ?? "",
    tuitionFeeMonthly: school.tuitionFeeMonthly?.toString() ?? "",
    totalAnnualFee: school.totalAnnualFee?.toString() ?? "",
    transportFee: school.transportFee?.toString() ?? "",
    hostelFee: school.hostelFee?.toString() ?? "",
    totalStudents: school.totalStudents?.toString() ?? "",
    establishedYear: school.establishedYear?.toString() ?? "",
  };
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

export default function SchoolProfileForm({
  school,
}: {
  school: SchoolDashboardSchool;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: toFormValues(school),
  });

  const board = watch("board");
  const schoolType = watch("schoolType");
  const medium = watch("medium");

  async function onSubmit(values: FormValues) {
    setMessage(null);
    setError(null);

    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: values.pincode.trim() || null,
      board: values.board,
      schoolType: values.schoolType,
      medium: values.medium,
      classesFrom: Number(values.classesFrom),
      classesTo: Number(values.classesTo),
      phone: values.phone.trim(),
      email: values.email.trim() || null,
      website: values.website.trim() || null,
      logoUrl: values.logoUrl.trim() || null,
      admissionFee: parseOptionalNumber(values.admissionFee),
      tuitionFeeMonthly: parseOptionalNumber(values.tuitionFeeMonthly),
      totalAnnualFee: parseOptionalNumber(values.totalAnnualFee),
      transportFee: parseOptionalNumber(values.transportFee),
      hostelFee: parseOptionalNumber(values.hostelFee),
      totalStudents: parseOptionalNumber(values.totalStudents),
      establishedYear: parseOptionalNumber(values.establishedYear),
    };

    try {
      const res = await fetch("/api/school/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Failed to update school profile");
        return;
      }

      setMessage(
        body.message ??
          "Profile updated. Your school is pending admin re-approval."
      );
      router.refresh();
    } catch {
      setError("Unable to save changes. Try again later.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {message && (
        <div className="alert-success">
          {message}
        </div>
      )}
      {error && (
        <div className="alert-danger">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-blue-800">
          School information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="name">School name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>
          <div className="sm:col-span-2">
            <ImageUploadField
              label="School logo"
              folder="logos"
              hint="Upload a logo for your listing. Changes apply when you save the form."
              previewUrl={watch("logoUrl") || null}
              onUploaded={(url) => setValue("logoUrl", url, { shouldDirty: true })}
              onClear={() => setValue("logoUrl", "", { shouldDirty: true })}
            />
            <input type="hidden" {...register("logoUrl")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-blue-800">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" placeholder="https://" {...register("website")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-blue-800">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" {...register("pincode")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-blue-800">Academics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Board</Label>
            <Select value={board} onValueChange={(v) => setValue("board", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["CBSE", "ICSE", "UP_BOARD", "OTHER"].map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>School type</Label>
            <Select
              value={schoolType}
              onValueChange={(v) => setValue("schoolType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["BOYS", "GIRLS", "CO_ED"].map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Medium</Label>
            <Select value={medium} onValueChange={(v) => setValue("medium", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["HINDI", "ENGLISH", "BOTH"].map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="establishedYear">Established year</Label>
            <Input id="establishedYear" {...register("establishedYear")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classesFrom">Classes from</Label>
            <Input
              id="classesFrom"
              type="number"
              min={1}
              max={12}
              {...register("classesFrom", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classesTo">Classes to</Label>
            <Input
              id="classesTo"
              type="number"
              min={1}
              max={12}
              {...register("classesTo", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalStudents">Total students</Label>
            <Input id="totalStudents" {...register("totalStudents")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-blue-800">Fee structure</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admissionFee">Admission fee (₹)</Label>
            <Input id="admissionFee" {...register("admissionFee")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tuitionFeeMonthly">Monthly tuition (₹)</Label>
            <Input id="tuitionFeeMonthly" {...register("tuitionFeeMonthly")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalAnnualFee">Total annual fee (₹)</Label>
            <Input id="totalAnnualFee" {...register("totalAnnualFee")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transportFee">Transport fee (₹)</Label>
            <Input id="transportFee" {...register("transportFee")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostelFee">Hostel fee (₹)</Label>
            <Input id="hostelFee" {...register("hostelFee")} />
          </div>
        </div>
      </section>

      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
      <p className="text-sm text-gray-500">
        Saving changes will set your school status to pending until an admin
        re-approves your listing.
      </p>
    </form>
  );
}
