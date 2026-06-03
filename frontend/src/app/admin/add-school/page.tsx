"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  MapPin,
  BookOpen,
  DollarSign,
  User,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

// ── Zod Schema ──────────────────────────────────────────────────────────────
const addSchoolSchema = z
  .object({
  // Owner
  ownerEmail: z.string().email("Enter a valid email address"),
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  ownerPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),

  // School Info
  name: z.string().min(3, "School name is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  address: z.string().min(5, "Address is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode").optional().or(z.literal("")),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),

  // Academic
  board: z.enum(["CBSE", "ICSE", "UP_BOARD", "OTHER"]),
  schoolType: z.enum(["BOYS", "GIRLS", "CO_ED"]),
  medium: z.enum(["HINDI", "ENGLISH", "BOTH"]),
  classesFrom: z.coerce.number().min(1).max(12),
  classesTo: z.coerce.number().min(1).max(12),
  establishedYear: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(1800).max(new Date().getFullYear()).optional()
  ),
  totalStudents: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(1).optional()
  ),

  // Fees
  admissionFee: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  tuitionFeeMonthly: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  totalAnnualFee: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  transportFee: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  hostelFee: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),

  // Description
  description: z.string().optional(),
})
  .refine((data) => data.classesFrom <= data.classesTo, {
    message: "Classes To must be greater than or equal to Classes From",
    path: ["classesTo"],
  });

type AddSchoolFormData = z.infer<typeof addSchoolSchema>;

// ── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: "Owner Info", icon: User },
  { id: 1, label: "School Info", icon: Building2 },
  { id: 2, label: "Academic", icon: BookOpen },
  { id: 3, label: "Fees", icon: DollarSign },
];

const STEP_FIELDS: Record<number, (keyof AddSchoolFormData)[]> = {
  0: ["ownerEmail", "ownerName"],
  1: ["name", "city", "state", "address", "phone"],
  2: ["board", "schoolType", "medium", "classesFrom", "classesTo"],
  3: [],
};

export default function AdminAddSchoolPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<AddSchoolFormData>({
    resolver: zodResolver(addSchoolSchema),
    defaultValues: {
      board: "CBSE",
      schoolType: "CO_ED",
      medium: "ENGLISH",
      classesFrom: 1,
      classesTo: 10,
    },
  });

  // ── Auth guard ──────────────────────────────────────────────────────────
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

  // ── Logo upload ─────────────────────────────────────────────────────────
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  // ── Next step ───────────────────────────────────────────────────────────
  async function handleNext() {
    const fields = STEP_FIELDS[step];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  }

  function onValidationError(fieldErrors: FieldErrors<AddSchoolFormData>) {
    const firstMessage = Object.values(fieldErrors)
      .map((entry) => entry?.message)
      .find((message): message is string => Boolean(message));

    setErrorMessage(
      firstMessage ??
        "Please complete all required fields. Check earlier steps for errors."
    );
    setSuccessMessage(null);
  }

  function buildPayload(data: AddSchoolFormData, logoUrl?: string) {
    const payload: Record<string, unknown> = { ...data, logoUrl };

    if (!data.ownerPassword?.trim()) {
      delete payload.ownerPassword;
    } else {
      payload.ownerPassword = data.ownerPassword.trim();
    }

    if (!data.pincode?.trim()) delete payload.pincode;
    if (!data.email?.trim()) delete payload.email;
    if (!data.website?.trim()) delete payload.website;
    if (!data.description?.trim()) delete payload.description;

    return payload;
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function onSubmit(data: AddSchoolFormData) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let logoUrl: string | undefined;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = (await uploadRes.json().catch(() => ({}))) as {
          success?: boolean;
          url?: string;
          message?: string;
        };

        if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
          setErrorMessage(
            uploadData.message ?? "Logo upload failed. Try again or continue without a logo."
          );
          return;
        }

        logoUrl = uploadData.url;
      }

      const res = await fetch("/api/admin/add-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(data, logoUrl)),
      });

      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
        success?: boolean;
      };

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setErrorMessage(
            body.message ?? "Session expired. Please log in again as admin."
          );
          return;
        }
        setErrorMessage(
          body.message ?? `Unable to add school (error ${res.status}). Please try again.`
        );
        return;
      }

      const message = body.message ?? "School added successfully";
      setSuccessMessage(message);
      setShowSuccessScreen(true);
    } catch {
      setErrorMessage("Unable to reach the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAddAnother() {
    setShowSuccessScreen(false);
    setSuccessMessage(null);
    setErrorMessage(null);
    setStep(0);
    setLogoFile(null);
    setLogoPreview(null);
    reset();
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (showSuccessScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success-text" />
          </div>
          <h2 className="font-heading text-h2 font-bold text-blue-800 mb-2">
            School added successfully
          </h2>
          <p className="text-gray-400 font-body text-body mb-6">
            {successMessage ??
              "The school was added with approved status and is now live."}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/admin/schools"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-heading text-btn hover:bg-blue-700 transition-colors"
            >
              View schools list
            </Link>
            <button
              type="button"
              onClick={handleAddAnother}
              className="px-5 py-2.5 border border-gray-100 text-gray-800 rounded-xl font-heading text-btn hover:bg-gray-50 transition-colors"
            >
              Add another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
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
            The school will be added with approved status — no admin review required
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = idx === step;
            const done = idx < step;
            return (
              <div key={s.id} className="flex items-center gap-2">
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
                  <ChevronRight className="w-4 h-4 text-gray-100 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit, onValidationError)}>

            {/* ── STEP 0: Owner Info ─────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-heading text-h3 font-semibold text-blue-800 mb-4">
                  Owner Information
                </h2>

                <div>
                  <label className="block font-body text-label text-gray-800 mb-1.5">
                    Owner Email <span className="text-danger-text">*</span>
                  </label>
                  <input
                    {...register("ownerEmail")}
                    type="email"
                    placeholder="owner@school.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                  {errors.ownerEmail && (
                    <p className="text-danger-text font-body text-meta mt-1">{errors.ownerEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-body text-label text-gray-800 mb-1.5">
                    Owner Name <span className="text-danger-text">*</span>
                  </label>
                  <input
                    {...register("ownerName")}
                    type="text"
                    placeholder="Principal / Owner name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                  {errors.ownerName && (
                    <p className="text-danger-text font-body text-meta mt-1">{errors.ownerName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-body text-label text-gray-800 mb-1.5">
                    Owner Password{" "}
                    <span className="text-gray-400">(optional — to create a new account)</span>
                  </label>
                  <input
                    {...register("ownerPassword")}
                    type="password"
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                  {errors.ownerPassword && (
                    <p className="text-danger-text font-body text-meta mt-1">{errors.ownerPassword.message}</p>
                  )}
                  <p className="text-gray-400 font-body text-meta mt-1">
                    If the email is already registered, the existing account will be used
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 1: School Info ────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-heading text-h3 font-semibold text-blue-800 mb-4">
                  School Information
                </h2>

                <div>
                  <label className="block font-body text-label text-gray-800 mb-1.5">
                    School Name <span className="text-danger-text">*</span>
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Full school name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                  {errors.name && (
                    <p className="text-danger-text font-body text-meta mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">
                      City <span className="text-danger-text">*</span>
                    </label>
                    <input
                      {...register("city")}
                      type="text"
                      placeholder="Lucknow"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                    {errors.city && (
                      <p className="text-danger-text font-body text-meta mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">
                      State <span className="text-danger-text">*</span>
                    </label>
                    <input
                      {...register("state")}
                      type="text"
                      placeholder="Uttar Pradesh"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                    {errors.state && (
                      <p className="text-danger-text font-body text-meta mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-body text-label text-gray-800 mb-1.5">
                    Address <span className="text-danger-text">*</span>
                  </label>
                  <input
                    {...register("address")}
                    type="text"
                    placeholder="Street, area, landmark..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                  {errors.address && (
                    <p className="text-danger-text font-body text-meta mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">Pincode</label>
                    <input
                      {...register("pincode")}
                      type="text"
                      maxLength={6}
                      placeholder="226001"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                    {errors.pincode && (
                      <p className="text-danger-text font-body text-meta mt-1">{errors.pincode.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">
                      Phone <span className="text-danger-text">*</span>
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                    {errors.phone && (
                      <p className="text-danger-text font-body text-meta mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">School Email</label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="school@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">Website</label>
                    <input
                      {...register("website")}
                      type="url"
                      placeholder="https://school.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block font-body text-label text-gray-800 mb-1.5">School Logo</label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center border border-gray-100">
                        <Building2 className="w-7 h-7 text-blue-200" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors font-body text-body text-gray-800">
                      <Upload className="w-4 h-4 text-blue-600" />
                      Upload logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-body text-label text-gray-800 mb-1.5">Description</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Write a short description of the school..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2: Academic ───────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-heading text-h3 font-semibold text-blue-800 mb-4">
                  Academic Details
                </h2>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">
                      Board <span className="text-danger-text">*</span>
                    </label>
                    <select
                      {...register("board")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="UP_BOARD">UP Board</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">
                      Type <span className="text-danger-text">*</span>
                    </label>
                    <select
                      {...register("schoolType")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    >
                      <option value="CO_ED">Co-Ed</option>
                      <option value="BOYS">Boys</option>
                      <option value="GIRLS">Girls</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">
                      Medium <span className="text-danger-text">*</span>
                    </label>
                    <select
                      {...register("medium")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    >
                      <option value="ENGLISH">English</option>
                      <option value="HINDI">Hindi</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">
                      Classes From <span className="text-danger-text">*</span>
                    </label>
                    <input
                      {...register("classesFrom")}
                      type="number"
                      min={1}
                      max={12}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                    {errors.classesFrom && (
                      <p className="text-danger-text font-body text-meta mt-1">{errors.classesFrom.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">
                      Classes To <span className="text-danger-text">*</span>
                    </label>
                    <input
                      {...register("classesTo")}
                      type="number"
                      min={1}
                      max={12}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                    {errors.classesTo && (
                      <p className="text-danger-text font-body text-meta mt-1">{errors.classesTo.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">Established Year</label>
                    <input
                      {...register("establishedYear")}
                      type="number"
                      min={1800}
                      max={new Date().getFullYear()}
                      placeholder="1995"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-label text-gray-800 mb-1.5">Total Students</label>
                    <input
                      {...register("totalStudents")}
                      type="number"
                      min={1}
                      placeholder="500"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Fees ───────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-heading text-h3 font-semibold text-blue-800 mb-4">
                  Fee Structure{" "}
                  <span className="text-gray-400 font-body text-body font-normal">(Optional)</span>
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: "admissionFee" as const, label: "Admission Fee (₹)" },
                    { field: "tuitionFeeMonthly" as const, label: "Monthly Tuition (₹)" },
                    { field: "totalAnnualFee" as const, label: "Total Annual Fee (₹)" },
                    { field: "transportFee" as const, label: "Transport Fee/Month (₹)" },
                    { field: "hostelFee" as const, label: "Hostel Fee/Month (₹)" },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block font-body text-label text-gray-800 mb-1.5">{label}</label>
                      <input
                        {...register(field)}
                        type="number"
                        min={0}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 font-body text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>
                  ))}
                </div>

                {/* Info notice */}
                <div className="flex items-center gap-3 p-4 bg-info-bg rounded-xl">
                  <CheckCircle className="w-5 h-5 text-info-text flex-shrink-0" />
                  <p className="font-body text-label text-info-text">
                    This school will be added with <strong>Approved</strong> status — no review pending
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 mt-6 bg-danger-bg rounded-xl border border-danger-text/20"
              >
                <AlertCircle className="w-5 h-5 text-danger-text flex-shrink-0 mt-0.5" />
                <p className="font-body text-body text-danger-text">{errorMessage}</p>
              </div>
            )}

            {successMessage && !showSuccessScreen && (
              <div
                role="status"
                className="flex items-start gap-3 p-4 mt-6 bg-success-bg rounded-xl border border-success-text/20"
              >
                <CheckCircle className="w-5 h-5 text-success-text flex-shrink-0 mt-0.5" />
                <div className="font-body text-body text-success-text">
                  <p>{successMessage}</p>
                  <Link
                    href="/admin/schools"
                    className="mt-2 inline-block font-heading text-btn text-blue-600 hover:text-blue-800"
                  >
                    View schools list →
                  </Link>
                </div>
              </div>
            )}

            {/* ── Navigation buttons ─────────────────────────────────── */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-2.5 border border-gray-100 text-gray-800 rounded-xl font-heading text-btn hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-heading text-btn hover:bg-blue-700 transition-colors shadow-btn"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-amber-800 rounded-xl font-heading text-btn hover:bg-amber-500 transition-colors shadow-amber disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding school...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Add school
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Location icon decoration */}
        <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 font-body text-meta">
          <MapPin className="w-3.5 h-3.5" />
          This school will appear on the approved list immediately
        </div>
      </div>
    </div>
  );
}