"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth-config";
import type { Role } from "@/lib/types/database";
import { getAdminApiBase } from "@/lib/admin-auth";

const API_BASE = getAdminApiBase().replace(/\/$/, "");

const ROLE_LABELS: Record<Role, string> = {
  PARENT: "parent",
  SCHOOL_ADMIN: "school admin",
  ADMIN: "admin",
};

const ROLE_LOGIN: Record<Role, string> = {
  PARENT: AUTH_ROUTES.parentLogin,
  SCHOOL_ADMIN: AUTH_ROUTES.schoolLogin,
  ADMIN: AUTH_ROUTES.adminLogin,
};

function parseExpectedRole(value: string | null): Role {
  if (value === "SCHOOL_ADMIN" || value === "ADMIN") {
    return value;
  }
  return "PARENT";
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const expectedRole = parseExpectedRole(searchParams.get("role"));

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          expectedRole,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Unable to process your request. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = ROLE_LOGIN[expectedRole];
  const roleLabel = ROLE_LABELS[expectedRole];

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-heading text-h2 text-blue-800">Forgot password</h1>
        <p className="mt-2 font-body text-body text-gray-500">
          {submitted
            ? "Check your inbox for further instructions."
            : `Enter your ${roleLabel} account email to receive a password reset link.`}
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4 text-center">
          <div className="alert-success">
            <p className="font-body text-body">
              If an account with this email exists, you&apos;ll receive a reset link shortly.
            </p>
          </div>
          <Link href={loginHref} className="btn-primary inline-flex">
            Back to login
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="alert-danger mb-4">
              <p className="font-body text-label">{error}</p>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="pt-6 text-center font-body text-label text-gray-500">
            <Link href={loginHref} className="text-blue-600 hover:text-blue-800">
              Back to {roleLabel} login
            </Link>
          </p>
        </>
      )}
    </>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 font-body text-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <Suspense
          fallback={
            <p className="text-center font-body text-body text-gray-500">Loading...</p>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
