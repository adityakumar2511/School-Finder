"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAdminApiBase } from "@/lib/admin-auth";
import { AUTH_ROUTES } from "@/lib/auth-config";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMismatchError(null);

    if (newPassword !== confirmPassword) {
      setMismatchError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or expired link");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${getAdminApiBase()}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError("Invalid or expired link");
        return;
      }

      if (body.message) {
        setSuccess(true);
      }
    } catch {
      setError("Invalid or expired link");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl border border-success-text/20 bg-success-bg px-4 py-3">
          <p className="font-body text-body text-success-text">Password reset successful.</p>
        </div>
        <Link href={AUTH_ROUTES.parentLogin} className="btn-primary inline-flex">
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
