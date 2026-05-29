"use client";

import { useState } from "react";
import Link from "next/link";
import { getAdminApiBase } from "@/lib/admin-auth";
import { AUTH_ROUTES } from "@/lib/auth-config";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${getAdminApiBase()}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Unable to process your request. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-success-text/20 bg-success-bg px-4 py-3 text-center">
        <p className="font-body text-body text-success-text">
          If this email is registered, you will receive a reset link shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-xl border border-danger-text/20 bg-danger-bg px-4 py-3">
          <p className="font-body text-label text-danger-text">{error}</p>
        </div>
      )}

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

      <div className="space-y-2 pt-2 text-center font-body text-label text-gray-500">
        <p>
          <Link href={AUTH_ROUTES.parentLogin} className="text-blue-600 hover:text-blue-800">
            Back to parent login
          </Link>
        </p>
        <p>
          <Link href={AUTH_ROUTES.schoolLogin} className="text-blue-600 hover:text-blue-800">
            Back to school admin login
          </Link>
        </p>
      </div>
    </form>
  );
}
