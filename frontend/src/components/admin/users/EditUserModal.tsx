"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";

const editUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number")
      .or(z.literal(""))
      .optional(),
    resetPassword: z.boolean(),
    password: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.resetPassword ||
      (data.password && data.password.trim().length >= 8),
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    },
  );

type EditUserFormValues = z.infer<typeof editUserSchema>;

type Props = {
  userId: string;
  currentName: string | null;
  currentEmail: string;
  currentPhone: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditUserModal({
  userId,
  currentName,
  currentEmail,
  currentPhone,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditUserFormValues | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: currentName ?? "",
      email: currentEmail,
      phone: currentPhone ?? "",
      resetPassword: false,
      password: "",
    },
  });

  const resetPassword = watch("resetPassword");

  function handleClose(next: boolean) {
    if (!next) {
      reset({
        name: currentName ?? "",
        email: currentEmail,
        phone: currentPhone ?? "",
        resetPassword: false,
        password: "",
      });
      setServerError(null);
      setConfirmOpen(false);
      setPendingValues(null);
    }
    onOpenChange(next);
  }

  function onSubmit(values: EditUserFormValues) {
    // Build payload of only changed/filled fields before showing confirmation
    setPendingValues(values);
    setConfirmOpen(true);
  }

  async function handleConfirmedSubmit() {
    if (!pendingValues) return;
    setSubmitting(true);
    setServerError(null);

    const payload: Record<string, string> = {};
    if (pendingValues.name.trim() !== (currentName ?? "")) {
      payload.name = pendingValues.name.trim();
    }
    if (pendingValues.email.trim().toLowerCase() !== currentEmail.toLowerCase()) {
      payload.email = pendingValues.email.trim();
    }
    if ((pendingValues.phone ?? "") !== (currentPhone ?? "")) {
      payload.phone = pendingValues.phone ?? "";
    }
    if (pendingValues.resetPassword && pendingValues.password) {
      payload.password = pendingValues.password;
    }

    if (Object.keys(payload).length === 0) {
      setServerError("No changes to save");
      setSubmitting(false);
      setConfirmOpen(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/account`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to update user account");
      }
      setConfirmOpen(false);
      handleClose(false);
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to update user account",
      );
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit account details</DialogTitle>
            <DialogDescription>
              Update this user&apos;s login credentials. Changes to email or
              password will sign them out of all active sessions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="edit-user-name"
                className="mb-1 block font-body text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="edit-user-name"
                type="text"
                {...register("name")}
                className="h-9 w-full rounded-md border border-gray-200 px-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-danger-text">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-user-email"
                className="mb-1 block font-body text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="edit-user-email"
                type="email"
                {...register("email")}
                className="h-9 w-full rounded-md border border-gray-200 px-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger-text">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-user-phone"
                className="mb-1 block font-body text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                id="edit-user-phone"
                type="text"
                {...register("phone")}
                placeholder="10-digit mobile number"
                className="h-9 w-full rounded-md border border-gray-200 px-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-danger-text">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="rounded-md border border-gray-200 p-3">
              <label className="flex items-center gap-2 font-body text-sm font-medium text-gray-700">
                <input type="checkbox" {...register("resetPassword")} />
                Reset password
              </label>

              {resetPassword && (
                <div className="mt-3">
                  <label
                    htmlFor="edit-user-password"
                    className="mb-1 block font-body text-sm font-medium text-gray-700"
                  >
                    New password
                  </label>
                  <input
                    id="edit-user-password"
                    type="password"
                    {...register("password")}
                    placeholder="Minimum 8 characters"
                    className="h-9 w-full rounded-md border border-gray-200 px-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-danger-text">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {serverError && (
              <p className="text-xs text-danger-text">{serverError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !isDirty}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation — credentials are sensitive, extra step before submit */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm account changes</DialogTitle>
            <DialogDescription>
              This will change the user&apos;s login credentials. If email or
              password is changed, they will be signed out everywhere and must
              log in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Go back
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmedSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}