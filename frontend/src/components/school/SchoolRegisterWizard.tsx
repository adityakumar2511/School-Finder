"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  BookOpen,
  DollarSign,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUTH_ROUTES, ROLE_HOME } from "@/lib/auth-config";
import ImageUploadField from "@/components/upload/ImageUploadField";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schoolRegisterSchema = z
  .object({
    // Step 0 — Account
    ownerName: z.string().min(2, "Name must be at least 2 characters"),
    ownerEmail: z.string().email("Enter a valid email address"),
    ownerPassword: z.string().min(8, "Password must be at least 8 characters"),

    // Step 1 — School info
    schoolName: z.string().min(3, "School name must be at least 3 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    address: z.string().min(5, "Address is required"),
    pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
    email: z
      .string()
      .email("Enter a valid email address")
      .optional()
      .or(z.literal("")),
    website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    description: z.string().optional(),

    // Step 2 — Academic
    board: z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]),
    schoolType: z.enum(["BOYS", "GIRLS", "CO_ED"]),
    medium: z.enum(["HINDI", "ENGLISH", "BOTH"]),
    classesFrom: z.coerce.number().int().min(1).max(12),
    classesTo: z.coerce.number().int().min(1).max(12),
    establishedYear: z.coerce
      .number()
      .int()
      .min(1800)
      .max(new Date().getFullYear())
      .optional()
      .or(z.literal("")),
    totalStudents: z.coerce
      .number()
      .int()
      .nonnegative()
      .optional()
      .or(z.literal("")),

    // Step 3 — Fees (all optional)
    admissionFee: z.coerce.number().min(0).optional().or(z.literal("")),
    tuitionFeeMonthly: z.coerce.number().min(0).optional().or(z.literal("")),
    totalAnnualFee: z.coerce.number().min(0).optional().or(z.literal("")),
    transportFee: z.coerce.number().min(0).optional().or(z.literal("")),
    hostelFee: z.coerce.number().min(0).optional().or(z.literal("")),
  })
  .refine((data) => data.classesFrom <= data.classesTo, {
    message: "Classes To must be ≥ Classes From",
    path: ["classesTo"],
  });

type SchoolRegisterFormData = z.infer<typeof schoolRegisterSchema>;

// ---------------------------------------------------------------------------
// Steps config
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 0, label: "Account", icon: User },
  { id: 1, label: "School Info", icon: Building2 },
  { id: 2, label: "Academic", icon: BookOpen },
  { id: 3, label: "Fees", icon: DollarSign },
] as const;

const STEP_FIELDS: Record<number, (keyof SchoolRegisterFormData)[]> = {
  0: ["ownerName", "ownerEmail", "ownerPassword"],
  1: ["schoolName", "city", "state", "address", "pincode", "phone"],
  2: ["board", "schoolType", "medium", "classesFrom", "classesTo"],
  3: [], // fees optional — no blocking validation
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DRAFT_KEY_PREFIX = "sf_school_draft_";

function getDraftKey(email: string) {
  return `${DRAFT_KEY_PREFIX}${email}`;
}

function optionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function optionalFee(value: number | "" | undefined): number | undefined {
  if (value === "" || value === undefined || Number.isNaN(Number(value)))
    return undefined;
  return Number(value);
}

function optionalInt(value: number | "" | undefined): number | undefined {
  if (value === "" || value === undefined || Number.isNaN(Number(value)))
    return undefined;
  return Number(value);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const inputClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";
const inputErrorClass = "border-danger-text bg-danger-bg/30";
const selectTriggerClass =
  "h-11 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 focus:ring-blue-400";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SchoolRegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftEmail, setDraftEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<SchoolRegisterFormData>({
    resolver: zodResolver(schoolRegisterSchema),
    defaultValues: {
      board: "CBSE",
      schoolType: "CO_ED",
      medium: "ENGLISH",
      classesFrom: 1,
      classesTo: 12,
    },
  });

  // ── Draft: check on mount ──────────────────────────────────────────────
  useEffect(() => {
    try {
      // Look for any draft key
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(DRAFT_KEY_PREFIX)
      );
      if (keys.length > 0) {
        const email = keys[0].replace(DRAFT_KEY_PREFIX, "");
        setDraftEmail(email);
        setShowDraftBanner(true);
      }
    } catch {
      // localStorage unavailable — ignore
    }
  }, []);

  // ── Draft: save on every step advance ──────────────────────────────────
  function saveDraft(email: string) {
    try {
      const data = getValues();
      localStorage.setItem(getDraftKey(email), JSON.stringify({ data, step, logoUrl }));
    } catch {
      // ignore
    }
  }

  function loadDraft(email: string) {
    try {
      const raw = localStorage.getItem(getDraftKey(email));
      if (!raw) return;
      const { data, step: savedStep, logoUrl: savedLogo } = JSON.parse(raw) as {
        data: Partial<SchoolRegisterFormData>;
        step: number;
        logoUrl: string | null;
      };
      reset({ ...data } as SchoolRegisterFormData);
      setStep(savedStep ?? 0);
      if (savedLogo) setLogoUrl(savedLogo);
      setShowDraftBanner(false);
    } catch {
      setShowDraftBanner(false);
    }
  }

  function clearDraft(email: string) {
    try {
      localStorage.removeItem(getDraftKey(email));
    } catch {
      // ignore
    }
  }

  function discardDraft() {
    if (draftEmail) clearDraft(draftEmail);
    setShowDraftBanner(false);
    setDraftEmail(null);
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  async function handleNext() {
    const fields = STEP_FIELDS[step];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }

    // Save draft using ownerEmail as key (available from step 0 onward)
    const email = getValues("ownerEmail");
    if (email) saveDraft(email);

    setStep((s) => s + 1);
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function onSubmit(data: SchoolRegisterFormData) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const payload = {
        name: data.schoolName.trim(),
        ownerEmail: data.ownerEmail.trim(),
        ownerPassword: data.ownerPassword,
        ownerName: data.ownerName.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        address: data.address.trim(),
        pincode: data.pincode.trim(),
        board: data.board,
        schoolType: data.schoolType,
        medium: data.medium,
        classesFrom: data.classesFrom,
        classesTo: data.classesTo,
        phone: data.phone.trim(),
        email: optionalString(data.email),
        website: optionalString(data.website),
        description: optionalString(data.description),
        establishedYear: optionalInt(data.establishedYear),
        totalStudents: optionalInt(data.totalStudents),
        admissionFee: optionalFee(data.admissionFee),
        tuitionFeeMonthly: optionalFee(data.tuitionFeeMonthly),
        totalAnnualFee: optionalFee(data.totalAnnualFee),
        transportFee: optionalFee(data.transportFee),
        hostelFee: optionalFee(data.hostelFee),
        ...(logoUrl ? { logoUrl } : {}),
      };

      const res = await fetch(`${apiUrl}/api/auth/register-school`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err.message === "string"
            ? err.message
            : "Registration failed. Please try again."
        );
      }

      // Clear draft on success
      clearDraft(data.ownerEmail.trim());

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
        <div
          className="absolute inset-0 bg-subtle-pattern pointer-events-none"
          aria-hidden="true"
        />
        <Card className="relative w-full max-w-md border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="px-8 py-10 text-center">
            <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success-text" />
            </div>
            <h2 className="font-heading text-h2 font-bold text-blue-800 mb-2">
              Registration submitted
            </h2>
            <p className="font-body text-body text-gray-400 mb-2">
              Your school profile has been submitted for admin review. You can
              sign in and track your status from the dashboard.
            </p>
            <p className="font-body text-meta text-gray-400 mb-6">
              Redirecting you now…
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 font-heading text-btn rounded-xl h-11"
              >
                <Link href={AUTH_ROUTES.schoolLogin}>Sign in to your account</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="font-heading text-btn rounded-xl h-11 border-gray-100"
                onClick={() => router.push("/")}
              >
                Back to home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div
        className="absolute inset-0 bg-subtle-pattern pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-btn mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-h1 font-bold text-blue-800">
            Register your school
          </h1>
          <p className="font-body text-body text-gray-400 mt-1">
            List your school on SchoolFinder for parents to discover
          </p>
        </div>

        {/* Draft resume banner */}
        {showDraftBanner && draftEmail && (
          <div className="mb-6 flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200/60 rounded-xl">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <p className="font-body text-label text-amber-800">
                You have a saved application for <strong>{draftEmail}</strong>.
                Want to continue where you left off?
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                type="button"
                size="sm"
                className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-heading text-label rounded-lg"
                onClick={() => loadDraft(draftEmail)}
              >
                Resume
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-gray-600 font-heading text-label rounded-lg"
                onClick={discardDraft}
              >
                Discard
              </Button>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = idx === step;
            const done = idx < step;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label font-heading transition-all ${
                    active
                      ? "bg-blue-600 text-white"
                      : done
                        ? "bg-success-bg text-success-text"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-200 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* ── Step 0: Account ─────────────────────────────────── */}
              {step === 0 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-h3 font-semibold text-blue-800 mb-4">
                    Your account
                  </h2>
                  <p className="font-body text-body text-gray-400 -mt-2 mb-2">
                    Create credentials to manage your school profile after approval.
                  </p>

                  <div className="space-y-1.5">
                    <Label htmlFor="ownerName" className="font-heading text-label text-gray-800">
                      Full name <span className="text-danger-text">*</span>
                    </Label>
                    <Input
                      id="ownerName"
                      placeholder="Your full name"
                      autoComplete="name"
                      className={`${inputClass} ${errors.ownerName ? inputErrorClass : ""}`}
                      {...register("ownerName")}
                    />
                    {errors.ownerName && (
                      <p className="font-body text-meta text-danger-text">
                        {errors.ownerName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ownerEmail" className="font-heading text-label text-gray-800">
                      Email address <span className="text-danger-text">*</span>
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
                      <p className="font-body text-meta text-danger-text">
                        {errors.ownerEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ownerPassword" className="font-heading text-label text-gray-800">
                      Password <span className="text-danger-text">*</span>
                    </Label>
                    <PasswordInput
                      id="ownerPassword"
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      className={`${inputClass} ${errors.ownerPassword ? inputErrorClass : ""}`}
                      {...register("ownerPassword")}
                    />
                    {errors.ownerPassword && (
                      <p className="font-body text-meta text-danger-text">
                        {errors.ownerPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200/60">
                    <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                    <p className="font-body text-label text-amber-800">
                      Your listing will be reviewed by our team before going live on SchoolFinder.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Step 1: School Info ──────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-h3 font-semibold text-blue-800 mb-4">
                    School information
                  </h2>

                  <div className="space-y-1.5">
                    <Label htmlFor="schoolName" className="font-heading text-label text-gray-800">
                      School name <span className="text-danger-text">*</span>
                    </Label>
                    <Input
                      id="schoolName"
                      placeholder="Full name of the school"
                      className={`${inputClass} ${errors.schoolName ? inputErrorClass : ""}`}
                      {...register("schoolName")}
                    />
                    {errors.schoolName && (
                      <p className="font-body text-meta text-danger-text">
                        {errors.schoolName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="font-heading text-label text-gray-800">
                        City <span className="text-danger-text">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="Lucknow"
                        className={`${inputClass} ${errors.city ? inputErrorClass : ""}`}
                        {...register("city")}
                      />
                      {errors.city && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="font-heading text-label text-gray-800">
                        State <span className="text-danger-text">*</span>
                      </Label>
                      <Input
                        id="state"
                        placeholder="Uttar Pradesh"
                        className={`${inputClass} ${errors.state ? inputErrorClass : ""}`}
                        {...register("state")}
                      />
                      {errors.state && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="font-heading text-label text-gray-800">
                      Address <span className="text-danger-text">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="Street, area, landmark"
                      className={`${inputClass} ${errors.address ? inputErrorClass : ""}`}
                      {...register("address")}
                    />
                    {errors.address && (
                      <p className="font-body text-meta text-danger-text">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="font-heading text-label text-gray-800">
                        Pincode <span className="text-danger-text">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        maxLength={6}
                        placeholder="226001"
                        className={`${inputClass} ${errors.pincode ? inputErrorClass : ""}`}
                        {...register("pincode")}
                      />
                      {errors.pincode && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.pincode.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="font-heading text-label text-gray-800">
                        Phone <span className="text-danger-text">*</span>
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
                        <p className="font-body text-meta text-danger-text">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="font-heading text-label text-gray-800">
                        School email{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@school.com"
                        className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="website" className="font-heading text-label text-gray-800">
                        Website{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://school.com"
                        className={`${inputClass} ${errors.website ? inputErrorClass : ""}`}
                        {...register("website")}
                      />
                      {errors.website && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.website.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <ImageUploadField
                    label="School logo (optional)"
                    folder="logos"
                    hint="Secure upload with automatic compression. JPEG, PNG, or WebP only."
                    previewUrl={logoUrl}
                    onUploaded={setLogoUrl}
                    onClear={() => setLogoUrl(null)}
                  />

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="font-heading text-label text-gray-800">
                      Description{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="Brief overview of your school"
                      className="rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 resize-none"
                      {...register("description")}
                    />
                  </div>
                </div>
              )}

              {/* ── Step 2: Academic ─────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-h3 font-semibold text-blue-800 mb-4">
                    Academic details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-heading text-label text-gray-800">
                        Board <span className="text-danger-text">*</span>
                      </Label>
                      <Controller
                        name="board"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={selectTriggerClass}>
                              <SelectValue placeholder="Select board" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CBSE">CBSE</SelectItem>
                              <SelectItem value="ICSE">ICSE</SelectItem>
                              <SelectItem value="UP_BOARD">UP Board</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-heading text-label text-gray-800">
                        School type <span className="text-danger-text">*</span>
                      </Label>
                      <Controller
                        name="schoolType"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={selectTriggerClass}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CO_ED">Co-Ed</SelectItem>
                              <SelectItem value="BOYS">Boys</SelectItem>
                              <SelectItem value="GIRLS">Girls</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-heading text-label text-gray-800">
                        Medium <span className="text-danger-text">*</span>
                      </Label>
                      <Controller
                        name="medium"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={selectTriggerClass}>
                              <SelectValue placeholder="Select medium" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ENGLISH">English</SelectItem>
                              <SelectItem value="HINDI">Hindi</SelectItem>
                              <SelectItem value="BOTH">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="classesFrom" className="font-heading text-label text-gray-800">
                        Classes from <span className="text-danger-text">*</span>
                      </Label>
                      <Input
                        id="classesFrom"
                        type="number"
                        min={1}
                        max={12}
                        className={`${inputClass} ${errors.classesFrom ? inputErrorClass : ""}`}
                        {...register("classesFrom")}
                      />
                      {errors.classesFrom && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.classesFrom.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="classesTo" className="font-heading text-label text-gray-800">
                        Classes to <span className="text-danger-text">*</span>
                      </Label>
                      <Input
                        id="classesTo"
                        type="number"
                        min={1}
                        max={12}
                        className={`${inputClass} ${errors.classesTo ? inputErrorClass : ""}`}
                        {...register("classesTo")}
                      />
                      {errors.classesTo && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.classesTo.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="establishedYear" className="font-heading text-label text-gray-800">
                        Established year{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="establishedYear"
                        type="number"
                        min={1800}
                        max={new Date().getFullYear()}
                        placeholder="e.g. 1998"
                        className={`${inputClass} ${errors.establishedYear ? inputErrorClass : ""}`}
                        {...register("establishedYear")}
                      />
                      {errors.establishedYear && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.establishedYear.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="totalStudents" className="font-heading text-label text-gray-800">
                        Total students{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="totalStudents"
                        type="number"
                        min={0}
                        placeholder="e.g. 800"
                        className={`${inputClass} ${errors.totalStudents ? inputErrorClass : ""}`}
                        {...register("totalStudents")}
                      />
                      {errors.totalStudents && (
                        <p className="font-body text-meta text-danger-text">
                          {errors.totalStudents.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3: Fees ─────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-h3 font-semibold text-blue-800 mb-4">
                    Fee structure{" "}
                    <span className="text-gray-400 font-body text-body font-normal">
                      (all optional)
                    </span>
                  </h2>

                  {submitError && (
                    <div className="flex items-center gap-3 p-4 bg-danger-bg rounded-xl border border-danger-text/20">
                      <AlertCircle className="w-5 h-5 text-danger-text flex-shrink-0" />
                      <p className="font-body text-body text-danger-text">
                        {submitError}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                      [
                        { field: "admissionFee" as const, label: "Admission fee (₹)" },
                        { field: "tuitionFeeMonthly" as const, label: "Monthly tuition (₹)" },
                        { field: "totalAnnualFee" as const, label: "Total annual fee (₹)" },
                        { field: "transportFee" as const, label: "Transport fee (₹)" },
                        { field: "hostelFee" as const, label: "Hostel fee (₹)" },
                      ] as const
                    ).map(({ field, label }) => (
                      <div key={field} className="space-y-1.5">
                        <Label
                          htmlFor={field}
                          className="font-heading text-label text-gray-800"
                        >
                          {label}
                        </Label>
                        <Input
                          id={field}
                          type="number"
                          min={0}
                          placeholder="0"
                          className={inputClass}
                          {...register(field)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-info-bg rounded-xl">
                    <CheckCircle className="w-5 h-5 text-info-text flex-shrink-0" />
                    <p className="font-body text-label text-info-text">
                      Fee details help parents compare schools. You can update them later from your dashboard.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Nav buttons ──────────────────────────────────────── */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-xl font-heading text-btn border-gray-100"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="px-6 bg-blue-600 hover:bg-blue-700 font-heading text-btn rounded-xl shadow-btn"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="px-6 bg-amber-400 hover:bg-amber-500 text-amber-900 font-heading text-btn rounded-xl shadow-amber disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit registration
                      </>
                    )}
                  </Button>
                )}
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