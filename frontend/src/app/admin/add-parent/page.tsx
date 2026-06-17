"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormSection, FormGrid } from "@/components/shared/form";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { PasswordInput } from "@/components/shared/ui/PasswordInput";
import { parseApiError } from "@/lib/api/error";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function AddParentPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/admin/add-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        reset();
        setTimeout(() => router.push("/admin/users?role=PARENT"), 1500);
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
        Add parent
      </h1>

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          Parent account created. Redirecting…
        </div>
      )}

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Account details">
          <FormGrid columns={2}>
            <FormField
              label="Full name"
              error={errors.name?.message ?? fieldErrors.name}
            >
              <Input {...register("name")} placeholder="Ramesh Kumar" />
            </FormField>

            <FormField
              label="Phone number"
              error={errors.phone?.message ?? fieldErrors.phone}
            >
              <Input {...register("phone")} placeholder="9876543210" />
            </FormField>
          </FormGrid>

          <FormField
            label="Email address"
            error={errors.email?.message ?? fieldErrors.email}
          >
            <Input
              {...register("email")}
              type="email"
              placeholder="ramesh@example.com"
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
        </FormSection>

        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create parent account"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}