"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AUTH_ROUTES, ROLE_HOME } from "@/lib/auth-config";

// ---------------------------------------------------------------------------
// Schema — only 4 required fields
// ---------------------------------------------------------------------------

const schoolRegisterSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters"),
  ownerEmail: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  ownerPassword: z.string().min(8, "Password must be at least 8 characters"),
});

type SchoolRegisterFormData = z.infer<typeof schoolRegisterSchema>;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const inputClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";
const inputErrorClass = "border-red-400 bg-red-50/30";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SchoolRegisterWizard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SchoolRegisterFormData>({
    resolver: zodResolver(schoolRegisterSchema),
  });

  // ── Submit ───────────────────────────────────────────────────────────────
  async function onSubmit(data: SchoolRegisterFormData) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const res = await fetch(`${apiUrl}/api/auth/register-school`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.schoolName.trim(),
          ownerEmail: data.ownerEmail.trim(),
          ownerPassword: data.ownerPassword,
          phone: data.phone.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err.message === "string"
            ? err.message
            : "Registration failed. Please try again."
        );
      }

      // Auto sign-in
      const signInResult = await signIn("credentials", {
        email: data.ownerEmail.trim(),
        password: data.ownerPassword,
        authContext: "school",
        redirect: false,
      });

      setSuccess(true);

      setTimeout(() => {
        if (signInResult?.error) {
          router.push(AUTH_ROUTES.schoolLogin + "?registered=true");
        } else {
          router.push(ROLE_HOME.SCHOOL_ADMIN);
          router.refresh();
        }
      }, 1500);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="px-8 py-10 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-heading text-h2 font-bold text-blue-800 mb-2">
              Registration submitted!
            </h2>
            <p className="font-body text-body text-gray-400 mb-6">
              Your school has been submitted for admin review. Complete your
              school profile from the dashboard.
            </p>
            <p className="font-body text-meta text-gray-400">Redirecting…</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-btn mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-h1 font-bold text-blue-800">
            Register your school
          </h1>
          <p className="font-body text-body text-gray-400 mt-1">
            Create your account — complete the profile from your dashboard
          </p>
        </div>

        <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-5">

                {/* School Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="schoolName" className="font-heading text-label text-gray-800">
                    School name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="schoolName"
                    placeholder="e.g. Delhi Public School, Varanasi"
                    className={`${inputClass} ${errors.schoolName ? inputErrorClass : ""}`}
                    {...register("schoolName")}
                  />
                  {errors.schoolName && (
                    <p className="font-body text-meta text-red-500">
                      {errors.schoolName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="ownerEmail" className="font-heading text-label text-gray-800">
                    Email address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="owner@school.com"
                    className={`${inputClass} ${errors.ownerEmail ? inputErrorClass : ""}`}
                    {...register("ownerEmail")}
                  />
                  {errors.ownerEmail && (
                    <p className="font-body text-meta text-red-500">
                      {errors.ownerEmail.message}
                    </p>
                  )}
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="font-heading text-label text-gray-800">
                    Mobile number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    className={`${inputClass} ${errors.phone ? inputErrorClass : ""}`}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="font-body text-meta text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="ownerPassword" className="font-heading text-label text-gray-800">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <PasswordInput
                    id="ownerPassword"
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    className={`${inputClass} ${errors.ownerPassword ? inputErrorClass : ""}`}
                    {...register("ownerPassword")}
                  />
                  {errors.ownerPassword && (
                    <p className="font-body text-meta text-red-500">
                      {errors.ownerPassword.message}
                    </p>
                  )}
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200/60">
                  <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="font-body text-label text-amber-800">
                    Your listing will be reviewed by our team before going live.
                    Complete your school profile from the dashboard after registering.
                  </p>
                </div>

                {/* Error */}
                {submitError && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200/60">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="font-body text-body text-red-600">{submitError}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-heading text-btn rounded-xl shadow-btn disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Registering…
                    </>
                  ) : (
                    "Register school"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center font-body text-label text-gray-400 mt-6">
          Already registered?{" "}
          <Link
            href={AUTH_ROUTES.schoolLogin}
            className="text-blue-600 hover:text-blue-800 font-heading font-semibold transition-colors"
          >
            Sign in to your school account
          </Link>
        </p>
      </div>
    </main>
  );
}