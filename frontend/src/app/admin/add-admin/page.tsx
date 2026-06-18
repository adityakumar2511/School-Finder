"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { FormField, FormSection, FormGrid } from "@/components/shared/form";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { PasswordInput } from "@/components/shared/ui/PasswordInput";
import { parseApiError } from "@/lib/api/error";
import type { AdminAccessLevel } from "@/lib/types/database";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  adminAccessLevel: z.enum(["READ_ONLY", "READ_WRITE", "FULL_ACCESS"], {
    required_error: "Select an access level",
  }),
});

type FormValues = z.infer<typeof schema>;

const ACCESS_LEVELS: {
  value: AdminAccessLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "READ_ONLY",
    label: "Read-only",
    description: "View stats, schools, users, and inquiries. No mutations.",
  },
  {
    value: "READ_WRITE",
    label: "Read + Add",
    description:
      "All read access plus approve/reject schools, add schools and parents, edit school profiles.",
  },
  {
    value: "FULL_ACCESS",
    label: "Full access",
    description:
      "Everything including delete school, manage user roles/status, and add admins.",
  },
];

export default function AddAdminPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedLevel = watch("adminAccessLevel");

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/admin/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        reset();
        setTimeout(() => router.push("/admin/users?role=ADMIN"), 1500);
        return;
      }

      const parsed = await parseApiError(res);
      if (parsed.category === "field_errors" && parsed.errors) {
        setFieldErrors(parsed.errors);
      } else {
        setServerError(parsed.message);
      }
    } catch {
      setServerError("Couldn't reach the server. Check your connection.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-blue-800 mb-2">
            Admin account created
          </h2>
          <p className="text-gray-400 font-body text-sm mb-6">
            Redirecting to admin users list…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        type="button"
        onClick={() => router.push("/admin/users?role=ADMIN")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-body mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to admins
      </button>

      <h1 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
        Add admin
      </h1>

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Account details">
          <FormField
            label="Full name"
            error={errors.name?.message ?? fieldErrors.name}
          >
            <Input {...register("name")} placeholder="Priya Sharma" />
          </FormField>

          <FormGrid columns={2}>
            <FormField
              label="Email address"
              error={errors.email?.message ?? fieldErrors.email}
            >
              <Input
                {...register("email")}
                type="email"
                placeholder="priya@schoolsetu.in"
              />
            </FormField>

            <FormField
              label="Password"
              error={errors.password?.message ?? fieldErrors.password}
            >
              <PasswordInput
                {...register("password")}
                placeholder="Min. 8 characters"
              />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection
          title="Access level"
          className="mt-6"
        >
          <div className="space-y-3">
            {ACCESS_LEVELS.map(({ value, label, description }) => {
              const selected = selectedLevel === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue("adminAccessLevel", value, {
                      shouldValidate: true,
                    })
                  }
                  className={`w-full text-left rounded-xl border p-4 transition-colors ${
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                        selected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <div className="h-full w-full rounded-full bg-white scale-[0.4]" />
                      )}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-gray-900">
                        {label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {(errors.adminAccessLevel || fieldErrors.adminAccessLevel) && (
            <p className="mt-2 text-xs text-red-600">
              {errors.adminAccessLevel?.message ?? fieldErrors.adminAccessLevel}
            </p>
          )}
        </FormSection>

        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create admin account"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users?role=ADMIN")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}