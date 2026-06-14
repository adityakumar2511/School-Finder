"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { PasswordInput } from "@/components/shared/ui/PasswordInput";
import { FormField, inputClass, inputErrorClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const addSchoolSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters"),
  ownerEmail: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  ownerPassword: z.string().min(8, "Password must be at least 8 characters"),
});

type AddSchoolFormData = z.infer<typeof addSchoolSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminAddSchoolPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [createdSchool, setCreatedSchool] = useState<{
    name: string;
    slug: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddSchoolFormData>({
    resolver: zodResolver(addSchoolSchema),
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    router.replace("/");
    return null;
  }

  async function onSubmit(data: AddSchoolFormData) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/add-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.schoolName.trim(),
          ownerEmail: data.ownerEmail.trim(),
          ownerPassword: data.ownerPassword,
          phone: data.phone.trim(),
          // Admin-added schools are immediately APPROVED
          // defaults handled by backend
        }),
      });

      const body = await res.json().catch(() => ({})) as {
        message?: string;
        school?: { name: string; slug: string };
      };

      if (!res.ok) {
        setErrorMessage(body.message ?? `Error ${res.status}. Please try again.`);
        return;
      }

      setCreatedSchool(body.school ?? null);
      setShowSuccessScreen(true);
    } catch {
      setErrorMessage("Unable to reach the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (showSuccessScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-heading text-h2 font-bold text-blue-800 mb-2">
            School added successfully
          </h2>
          <p className="text-gray-400 font-body text-body mb-2">
            The school is now live with Approved status.
            The school admin can complete the profile from their dashboard.
          </p>
          {createdSchool && (
            <p className="font-body text-label text-gray-500 mb-6">
              School:{" "}
              <Link
                href={`/schools/${createdSchool.slug}`}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                {createdSchool.name}
              </Link>
            </p>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/admin/schools"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-heading text-btn hover:bg-blue-700 transition-colors"
            >
              View schools list
            </Link>
            <button
              type="button"
              onClick={() => {
                setShowSuccessScreen(false);
                setCreatedSchool(null);
                setErrorMessage(null);
                reset();
              }}
              className="px-5 py-2.5 border border-gray-100 text-gray-800 rounded-xl font-heading text-btn hover:bg-gray-50 transition-colors"
            >
              Add another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-body text-body mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Dashboard
          </button>
          <h1 className="font-heading text-h1 font-bold text-blue-800">
            Add school
          </h1>
          <p className="text-gray-400 font-body text-body mt-1">
            School will be added with Approved status — no review required.
            Admin can complete the profile later.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-5">

              {/* School Name */}
              <FormField label="School name" required error={errors.schoolName?.message}>
                <Input
                  {...register("schoolName")}
                  type="text"
                  placeholder="e.g. Delhi Public School, Varanasi"
                  className={cn(inputClass, errors.schoolName && inputErrorClass)}
                />
              </FormField>

              {/* Owner Email */}
              <FormField label="Owner email" required error={errors.ownerEmail?.message}>
                <Input
                  {...register("ownerEmail")}
                  type="email"
                  placeholder="owner@school.com"
                  className={cn(inputClass, errors.ownerEmail && inputErrorClass)}
                />
              </FormField>

              {/* Mobile */}
              <FormField label="Mobile number" required error={errors.phone?.message}>
                <Input
                  {...register("phone")}
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  className={cn(inputClass, errors.phone && inputErrorClass)}
                />
              </FormField>

              {/* Password */}
              <FormField label="Password" required error={errors.ownerPassword?.message}>
                <PasswordInput
                  {...register("ownerPassword")}
                  placeholder="Min 8 characters"
                  className={cn(inputClass, errors.ownerPassword && inputErrorClass)}
                />
                <p className="text-gray-400 font-body text-meta mt-1">
                  Share these credentials with the school admin to login
                </p>
              </FormField>

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="font-body text-label text-blue-700">
                  School will be created with <strong>Approved</strong> status.
                  School admin can fill in remaining details (address, board, fees etc.)
                  from their dashboard.
                </p>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200/60">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="font-body text-body text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-amber-900 rounded-xl font-heading text-btn hover:bg-amber-500 transition-colors shadow-amber disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding school…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Add school
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}