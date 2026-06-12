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
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  GraduationCap,
  IndianRupee,
  Phone,
  ImageIcon,
} from "lucide-react";
import type { SchoolDashboardSchool } from "@/lib/school/data";
import ImageUploadField from "@/components/upload/ImageUploadField";
import SchoolGalleryManager from "@/components/school/SchoolGalleryManager";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormValues = {
  name: string;
  description: string;
  logoUrl: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  board: string;
  schoolType: string;
  medium: string;
  classesFrom: number;
  classesTo: number;
  totalStudents: string;
  establishedYear: string;
  admissionFee: string;
  tuitionFeeMonthly: string;
  totalAnnualFee: string;
  transportFee: string;
  hostelFee: string;
  phone: string;
  email: string;
  website: string;
};

// ─── Steps config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, label: "Basic Info",  icon: Building2,      fields: ["name", "description", "logoUrl"] },
  { id: 1, label: "Location",    icon: MapPin,          fields: ["address", "city", "state", "pincode"] },
  { id: 2, label: "Academics",   icon: GraduationCap,   fields: ["board", "schoolType", "medium", "classesFrom", "classesTo", "totalStudents", "establishedYear"] },
  { id: 3, label: "Fees",        icon: IndianRupee,     fields: ["admissionFee", "tuitionFeeMonthly", "totalAnnualFee", "transportFee", "hostelFee"] },
  { id: 4, label: "Contact",     icon: Phone,           fields: ["phone", "email", "website"] },
  { id: 5, label: "Gallery",     icon: ImageIcon,       fields: [] },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFormValues(school: SchoolDashboardSchool): FormValues {
  return {
    name: school.name,
    description: school.description ?? "",
    logoUrl: school.logoUrl ?? "",
    address: school.address ?? "",
    city: school.city ?? "",
    state: school.state ?? "",
    pincode: school.pincode ?? "",
    board: school.board ?? "OTHER",
    schoolType: school.schoolType ?? "CO_ED",
    medium: school.medium ?? "ENGLISH",
    classesFrom: school.classesFrom ?? 1,
    classesTo: school.classesTo ?? 12,
    totalStudents: school.totalStudents?.toString() ?? "",
    establishedYear: school.establishedYear?.toString() ?? "",
    admissionFee: school.admissionFee?.toString() ?? "",
    tuitionFeeMonthly: school.tuitionFeeMonthly?.toString() ?? "",
    totalAnnualFee: school.totalAnnualFee?.toString() ?? "",
    transportFee: school.transportFee?.toString() ?? "",
    hostelFee: school.hostelFee?.toString() ?? "",
    phone: school.phone ?? "",
    email: school.email ?? "",
    website: school.website ?? "",
  };
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

// Check if a step has all key fields filled
function isStepComplete(stepId: number, values: FormValues): boolean {
  switch (stepId) {
    case 0: return !!(values.name?.trim());
    case 1: return !!(values.address?.trim() && values.city?.trim() && values.state?.trim());
    case 2: return !!(values.board && values.schoolType && values.medium);
    case 3: return true; // fees optional
    case 4: return !!(values.phone?.trim());
    case 5: return true; // gallery optional
    default: return false;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchoolProfileForm({
  school,
  galleryImages = [],
}: {
  school: SchoolDashboardSchool;
  galleryImages?: { id: string; url: string; caption: string | null }[];
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set());

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } =
    useForm<FormValues>({ defaultValues: toFormValues(school) });

  const values = watch();
  const board = watch("board");
  const schoolType = watch("schoolType");
  const medium = watch("medium");

  // ── Save current step ──────────────────────────────────────────────────────

  async function saveStep(stepValues: FormValues) {
    setMessage(null);
    setError(null);

    const payload = {
      name: stepValues.name.trim(),
      description: stepValues.description.trim() || null,
      address: stepValues.address.trim() || "",
      city: stepValues.city.trim() || "",
      state: stepValues.state.trim() || "",
      pincode: stepValues.pincode.trim() || null,
      board: stepValues.board,
      schoolType: stepValues.schoolType,
      medium: stepValues.medium,
      classesFrom: Number(stepValues.classesFrom) || 1,
      classesTo: Number(stepValues.classesTo) || 12,
      phone: stepValues.phone.trim(),
      email: stepValues.email.trim() || null,
      website: stepValues.website.trim() || null,
      logoUrl: stepValues.logoUrl.trim() || null,
      admissionFee: parseOptionalNumber(stepValues.admissionFee),
      tuitionFeeMonthly: parseOptionalNumber(stepValues.tuitionFeeMonthly),
      totalAnnualFee: parseOptionalNumber(stepValues.totalAnnualFee),
      transportFee: parseOptionalNumber(stepValues.transportFee),
      hostelFee: parseOptionalNumber(stepValues.hostelFee),
      totalStudents: parseOptionalNumber(stepValues.totalStudents),
      establishedYear: parseOptionalNumber(stepValues.establishedYear),
    };

    const res = await fetch("/api/school/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.message ?? "Failed to save. Try again.");
      return false;
    }

    setSavedSteps((prev) => new Set(prev).add(currentStep));
    setMessage("Saved!");
    router.refresh();
    return true;
  }

  async function handleSaveAndNext(data: FormValues) {
    if (currentStep === 5) {
      setMessage("All sections saved!");
      return;
    }
    const ok = await saveStep(data);
    if (ok && currentStep < 5) {
      setTimeout(() => {
        setMessage(null);
        setCurrentStep((s) => s + 1);
      }, 600);
    }
  }

  async function handleSaveOnly(data: FormValues) {
    await saveStep(data);
  }

  // ─── Sidebar ───────────────────────────────────────────────────────────────

  const Sidebar = () => (
    <nav className="w-full md:w-56 shrink-0">
      <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const complete = savedSteps.has(step.id) || isStepComplete(step.id, values);
          const active = currentStep === step.id;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => { setMessage(null); setError(null); setCurrentStep(step.id); }}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-heading font-semibold transition-colors whitespace-nowrap
                  ${active
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden text-xs">{step.label}</span>
                {complete && !active && (
                  <CheckCircle className="w-3.5 h-3.5 ml-auto text-green-500 shrink-0" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  // ─── Step panels ───────────────────────────────────────────────────────────

  const inputCls = "h-10 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm";

  const StepBasicInfo = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">School name <span className="text-red-500">*</span></Label>
        <Input id="name" className={inputCls} {...register("name", { required: true })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">About your school</Label>
        <Textarea id="description" rows={4} className="rounded-xl border border-gray-200 bg-gray-50 font-body text-sm" {...register("description")} placeholder="Describe your school, vision, and key highlights..." />
      </div>
      <ImageUploadField
        label="School logo"
        folder="logos"
        hint="Upload a square logo. PNG or JPG, max 5MB."
        previewUrl={watch("logoUrl") || null}
        onUploaded={(url) => setValue("logoUrl", url, { shouldDirty: true })}
        onClear={() => setValue("logoUrl", "", { shouldDirty: true })}
      />
      <input type="hidden" {...register("logoUrl")} />
    </div>
  );

  const StepLocation = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="address">Street address <span className="text-red-500">*</span></Label>
        <Input id="address" className={inputCls} placeholder="e.g. 12, Civil Lines, Near Bus Stand" {...register("address")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
          <Input id="city" className={inputCls} placeholder="e.g. Varanasi" {...register("city")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
          <Input id="state" className={inputCls} placeholder="e.g. Uttar Pradesh" {...register("state")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pincode">Pincode</Label>
        <Input id="pincode" className={inputCls} maxLength={6} placeholder="e.g. 221001" {...register("pincode")} />
      </div>
    </div>
  );

  const StepAcademics = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Board <span className="text-red-500">*</span></Label>
          <Select value={board} onValueChange={(v) => setValue("board", v)}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {[["CBSE","CBSE"],["ICSE","ICSE"],["UP_BOARD","UP Board"],["OTHER","Other"]].map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>School type <span className="text-red-500">*</span></Label>
          <Select value={schoolType} onValueChange={(v) => setValue("schoolType", v)}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {[["BOYS","Boys"],["GIRLS","Girls"],["CO_ED","Co-Ed"]].map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Medium <span className="text-red-500">*</span></Label>
          <Select value={medium} onValueChange={(v) => setValue("medium", v)}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {[["HINDI","Hindi"],["ENGLISH","English"],["BOTH","Both"]].map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="establishedYear">Established year</Label>
          <Input id="establishedYear" className={inputCls} placeholder="e.g. 1995" {...register("establishedYear")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="classesFrom">Classes from</Label>
          <Input id="classesFrom" type="number" min={1} max={12} className={inputCls} {...register("classesFrom", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="classesTo">Classes to</Label>
          <Input id="classesTo" type="number" min={1} max={12} className={inputCls} {...register("classesTo", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="totalStudents">Total students</Label>
          <Input id="totalStudents" className={inputCls} placeholder="e.g. 850" {...register("totalStudents")} />
        </div>
      </div>
    </div>
  );

  const StepFees = () => (
    <div className="space-y-5">
      <p className="text-sm text-gray-500 font-body">All fee fields are optional. Fill what's applicable.</p>
      <div className="grid grid-cols-2 gap-4">
        {[
          { id: "admissionFee",      label: "Admission fee (₹)" },
          { id: "tuitionFeeMonthly", label: "Monthly tuition (₹)" },
          { id: "totalAnnualFee",    label: "Total annual fee (₹)" },
          { id: "transportFee",      label: "Transport fee (₹)" },
          { id: "hostelFee",         label: "Hostel fee (₹)" },
        ].map(({ id, label }) => (
          <div key={id} className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} className={inputCls} placeholder="0" {...register(id as keyof FormValues)} />
          </div>
        ))}
      </div>
    </div>
  );

  const StepContact = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
        <Input id="phone" type="tel" className={inputCls} placeholder="10-digit mobile number" {...register("phone")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">School email</Label>
        <Input id="email" type="email" className={inputCls} placeholder="info@yourschool.com" {...register("email")} />
        <p className="text-xs text-gray-400 font-body">This is your school's public contact email, not your login email.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input id="website" type="url" className={inputCls} placeholder="https://yourschool.com" {...register("website")} />
      </div>
    </div>
  );

  const StepGallery = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 font-body">Upload photos of your campus, classrooms, and facilities. These appear on your public listing.</p>
      <SchoolGalleryManager initialImages={galleryImages} />
    </div>
  );

  const stepPanels = [
    <StepBasicInfo key={0} />,
    <StepLocation key={1} />,
    <StepAcademics key={2} />,
    <StepFees key={3} />,
    <StepContact key={4} />,
    <StepGallery key={5} />,
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <form onSubmit={handleSubmit(handleSaveAndNext)}>
          {/* Step header */}
          <div className="mb-5">
            <h2 className="font-heading font-bold text-lg text-blue-800">
              {STEPS[currentStep].label}
            </h2>
            <p className="text-xs text-gray-400 font-body mt-0.5">
              Step {currentStep + 1} of {STEPS.length}
            </p>
          </div>

          {/* Alerts */}
          {message && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm font-body text-green-700">{message}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm font-body text-red-600">{error}</p>
            </div>
          )}

          {/* Step content */}
          <div className="mb-6">{stepPanels[currentStep]}</div>

          {/* Footer buttons — hide for gallery step */}
          {currentStep !== 5 && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold rounded-xl h-10 px-5"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
                ) : currentStep < STEPS.length - 2 ? (
                  "Save & Next →"
                ) : (
                  "Save"
                )}
              </Button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit(handleSaveOnly)}
                className="text-sm font-heading font-semibold text-gray-500 hover:text-blue-600 transition-colors"
              >
                Save only
              </button>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => { setMessage(null); setError(null); setCurrentStep((s) => s - 1); }}
                  className="ml-auto text-sm font-heading font-semibold text-gray-400 hover:text-gray-600"
                >
                  ← Back
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}