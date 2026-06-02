"use client";

import { useState } from "react";
import Link from "next/link";
import { AUTH_ROUTES } from "@/lib/auth-config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Step = 1 | 2 | 3;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Unable to send OTP. Please try again.");
        return;
      }

      setStep(2);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Invalid OTP. Please try again.");
        return;
      }

      setStep(3);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Unable to resend OTP. Please try again.");
        return;
      }

      setOtp("");
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Unable to reset password. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 font-body text-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-h2 text-blue-800">Forgot password</h1>
          <p className="mt-2 font-body text-body text-gray-500">
            {step === 1 && "Enter your email to receive a one-time password."}
            {step === 2 && "Enter the 6-digit OTP sent to your email."}
            {step === 3 && "Choose a new password for your account."}
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="alert-success">
              <p className="font-body text-body">Password reset successfully.</p>
            </div>
            <Link href={AUTH_ROUTES.parentLogin} className="btn-primary inline-flex">
              Go to login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="alert-danger mb-4">
                <p className="font-body text-label">{error}</p>
              </div>
            )}

            {step === 1 && (
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
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="otp" className="form-label">
                    One-time password
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="form-input text-center text-lg tracking-[0.5em]"
                  />
                </div>

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="w-full font-body text-label text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
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
            )}
          </>
        )}

        {!success && (
          <div className="space-y-2 pt-6 text-center font-body text-label text-gray-500">
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
        )}
      </div>
    </main>
  );
}
