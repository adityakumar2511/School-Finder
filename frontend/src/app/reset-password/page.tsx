"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAdminApiBase } from "@/lib/admin-auth";
import { AUTH_ROUTES } from "@/lib/auth-config";
import type { Role } from "@/lib/types/database";

const INVALID_RESET_MESSAGE =
  "This reset link is invalid or has expired. Please request a new one.";

const ROLE_LOGIN: Record<Role, string> = {
  PARENT: AUTH_ROUTES.parentLogin,
  SCHOOL_ADMIN: AUTH_ROUTES.schoolLogin,
  ADMIN: AUTH_ROUTES.adminLogin,
};

const FORGOT_PASSWORD_ROLE: Record<Role, string> = {
  PARENT: "PARENT",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  ADMIN: "ADMIN",
};

function parseRole(value: string | null): Role {
  if (value === "SCHOOL_ADMIN" || value === "ADMIN") {
    return value;
  }
  return "PARENT";
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const role = parseRole(searchParams.get("role"));

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  const loginHref = ROLE_LOGIN[role];
  const forgotHref = `/forgot-password?role=${FORGOT_PASSWORD_ROLE[role]}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMismatchError(null);

    if (newPassword !== confirmPassword) {
      setMismatchError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError(INVALID_RESET_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${getAdminApiBase()}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
          expectedRole: role,
        }),
      });

      if (!res.ok) {
        setError(INVALID_RESET_MESSAGE);
        return;
      }

      setSuccess(true);
    } catch {
      setError(INVALID_RESET_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl border border-danger-text/20 bg-danger-bg px-4 py-3">
          <p className="font-body text-label text-danger-text">{INVALID_RESET_MESSAGE}</p>
        </div>
        <Link href={forgotHref} className="btn-primary inline-flex">
          Request a new reset link
        </Link>
        <p className="font-body text-label text-gray-500">
          <Link href={loginHref} className="text-blue-600 hover:text-blue-800">
            Back to login
          </Link>
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl border border-success-text/20 bg-success-bg px-4 py-3">
          <p className="font-body text-body text-success-text">Password reset successful.</p>
        </div>
        <Link href={loginHref} className="btn-primary inline-flex">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {(error || mismatchError) && (
        <div className="rounded-xl border border-danger-text/20 bg-danger-bg px-4 py-3">
          <p className="font-body text-label text-danger-text">
            {mismatchError ?? error}
          </p>
          {error && (
            <p className="mt-2 font-body text-label">
              <Link href={forgotHref} className="text-blue-600 hover:text-blue-800">
                Request a new reset link
              </Link>
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="form-label">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="form-input"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="form-input"
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Resetting..." : "Reset password"}
      </button>

      <p className="text-center font-body text-label text-gray-500">
        <Link href={loginHref} className="text-blue-600 hover:text-blue-800">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 font-body text-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-h2 text-blue-800">Reset password</h1>
          <p className="mt-2 font-body text-body text-gray-500">
            Choose a new password for your account.
          </p>
        </div>
        <Suspense
          fallback={
            <p className="text-center font-body text-body text-gray-500">Loading...</p>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
