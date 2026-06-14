"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/auth-config";
import type { Role } from "@/lib/types/database";
import { PasswordInput } from "@/components/shared/ui/PasswordInput";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

// const OTP_SENT_MESSAGE =
//   "If an account exists, an OTP has been sent to your email.";

// Must match backend RESEND_COOLDOWN_MS (2 minutes)
const RESEND_COOLDOWN_SECONDS = 120;

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
  if (value === "SCHOOL_ADMIN" || value === "ADMIN") return value;
  return "PARENT";
}

// ─── OTP digit input ──────────────────────────────────────────────────────────
function OtpDigitInput({
  value,
  onChange,
  onKeyDown,
  onPaste,
  inputRef,
  disabled,
}: {
  value: string;
  onChange: (digit: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  inputRef: (el: HTMLInputElement | null) => void;
  disabled?: boolean;
}) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={1}
      value={value}
      disabled={disabled}
      onChange={(event) => {
        const digit = event.target.value.replace(/\D/g, "").slice(-1);
        onChange(digit);
      }}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      className="form-input h-12 w-11 rounded-xl border border-gray-200 text-center font-heading text-xl text-blue-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      aria-label="OTP digit"
    />
  );
}

// ─── Resend countdown hook ────────────────────────────────────────────────────
function useResendTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(seconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  return { secondsLeft, start, canResend: secondsLeft === 0 };
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

// ─── Main form ────────────────────────────────────────────────────────────────
function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const expectedRole = parseExpectedRole(searchParams.get("role"));

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Role mismatch state — set when backend returns code: "ROLE_MISMATCH"
  const [roleMismatch, setRoleMismatch] = useState<{
    label: string;
    loginHref: string;
  } | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { secondsLeft, start: startTimer, canResend } = useResendTimer();

  const loginHref = ROLE_LOGIN[expectedRole];
  const roleLabel = ROLE_LABELS[expectedRole];
  const otpValue = otpDigits.join("");

  const focusOtpIndex = useCallback((index: number) => {
    otpRefs.current[index]?.focus();
  }, []);

  // ─── Step 1: send OTP ─────────────────────────────────────────────────────
  // ─── Step 1: send OTP ─────────────────────────────────────────────────────
  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setRoleMismatch(null);

    const trimmedEmail = email.trim();

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, expectedRole }),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        const wait = body.retryAfter ?? RESEND_COOLDOWN_SECONDS;
        setError(
          `Please wait ${formatCountdown(wait)} before requesting a new OTP.`,
        );
        return;
      }

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Something went wrong. Please try again.");
        return;
      }

      // Email not registered at all
      if (!body.otpSent && body.code === "USER_NOT_FOUND") {
        setError(
          `No ${roleLabel} account found with this email. Please check your email or register a new account.`,
        );
        return;
      }

      // Account exists but wrong portal
      // Account exists but wrong portal
      if (!body.otpSent && body.code === "ROLE_MISMATCH") {
        const actualRole = body.actualRole as Role | undefined;

        // ADMIN existence kabhi reveal mat karo — generic error dikhao
        if (!actualRole || actualRole === "ADMIN") {
          setError(
            `No ${roleLabel} account found with this email. Please check your email or register a new account.`,
          );
          return;
        }

        if (ROLE_LABELS[actualRole] && ROLE_LOGIN[actualRole]) {
          setRoleMismatch({
            label: ROLE_LABELS[actualRole],
            loginHref: ROLE_LOGIN[actualRole],
          });
        } else {
          setError("No account found with this email for this portal.");
        }
        return;
      }

      // OTP sent successfully
      setEmail(trimmedEmail);
      setStep(2);
      startTimer(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Resend OTP (step 2) ──────────────────────────────────────────────────
  async function handleResend() {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, expectedRole }),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        const wait = body.retryAfter ?? RESEND_COOLDOWN_SECONDS;
        // Sync frontend timer with backend's actual remaining cooldown
        startTimer(wait);
        setError(
          `Please wait ${formatCountdown(wait)} before requesting a new OTP.`,
        );
        return;
      }

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Could not resend OTP. Please try again.");
        return;
      }

      // Resent — restart cooldown, clear old digits
      startTimer(RESEND_COOLDOWN_SECONDS);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => focusOtpIndex(0), 50);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setResendLoading(false);
    }
  }

  // ─── OTP input handlers ───────────────────────────────────────────────────
  function handleOtpChange(index: number, digit: string) {
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) focusOtpIndex(index + 1);
  }

  function handleOtpKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      focusOtpIndex(index - 1);
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
    setOtpDigits(next);
    focusOtpIndex(Math.min(pasted.length, 5));
  }

  // ─── Step 2: verify OTP ───────────────────────────────────────────────────
  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (otpValue.length !== 6) {
      setError("Please enter the full 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue, expectedRole }),
      });

      if (res.status === 429) {
        setError("Too many attempts. Please wait before trying again.");
        return;
      }

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Invalid or expired OTP.");
        return;
      }

      setStep(3);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 3: reset password ───────────────────────────────────────────────
  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setClientError(null);

    if (newPassword.length < 8) {
      setClientError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword,
          confirmPassword,
          expectedRole,
        }),
      });

      if (res.status === 429) {
        setError("Too many attempts. Please try again in an hour.");
        return;
      }

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Unable to reset password. Please try again.");
        return;
      }

      setResetSuccess(true);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  const stepTitle =
    step === 1
      ? "Forgot password"
      : step === 2
        ? "Verify OTP"
        : "Set new password";

  const stepDescription =
    step === 1
      ? `Enter your ${roleLabel} account email to receive a one-time password.`
      : step === 2
        ? `Enter the 6-digit OTP sent to ${email}`
        : "Choose a new password for your account.";

  if (resetSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="alert-success">
          <p className="font-body text-body">Password reset successfully.</p>
        </div>
        <Link href={loginHref} className="btn-primary inline-flex">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-heading text-h2 text-blue-800">{stepTitle}</h1>
        <p className="mt-2 font-body text-body text-gray-500">
          {stepDescription}
        </p>
      </div>

      {step === 2 && (
        <p className="mb-4 text-center font-body text-label text-gray-500">
          OTP sent to{" "}
          <span className="font-semibold text-gray-700">{email}</span>
        </p>
      )}

      {/* Role mismatch card — shown instead of generic error */}
      {roleMismatch && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-body text-label text-amber-800">
            This email is registered as a{" "}
            <span className="font-semibold">{roleMismatch.label}</span> account.
            Please use the{" "}
            <Link
              href={roleMismatch.loginHref}
              className="font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
            >
              {roleMismatch.label} login page
            </Link>{" "}
            to reset your password.
          </p>
        </div>
      )}

      {/* Generic error (not role mismatch) */}
      {(error || clientError) && (
        <div className="alert-danger mb-4">
          <p className="font-body text-label">{clientError ?? error}</p>
        </div>
      )}

      {/* ── Step 1 ── */}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
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
              onChange={(event) => {
                setEmail(event.target.value);
                // Clear role mismatch when user starts typing a new email
                if (roleMismatch) setRoleMismatch(null);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <p className="pt-2 text-center font-body text-label text-gray-500">
            <Link
              href={loginHref}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to {roleLabel} login
            </Link>
          </p>
        </form>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="space-y-4" noValidate>
          <div className="flex justify-center gap-2">
            {otpDigits.map((digit, index) => (
              <OtpDigitInput
                key={index}
                value={digit}
                disabled={loading}
                inputRef={(el) => {
                  otpRefs.current[index] = el;
                }}
                onChange={(value) => handleOtpChange(index, value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                onPaste={handleOtpPaste}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend row */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className="font-body text-label text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {resendLoading
                ? "Resending..."
                : canResend
                  ? "Resend OTP"
                  : `Resend in ${formatCountdown(secondsLeft)}`}
            </button>

            <button
              type="button"
              className="font-body text-label text-gray-500 hover:text-gray-700"
              onClick={() => {
                setStep(1);
                setError(null);
                setOtpDigits(["", "", "", "", "", ""]);
              }}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {/* ── Step 3 ── */}
      {step === 3 && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="form-label">
              New password
            </label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="form-input"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm password
            </label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>

          <p className="pt-2 text-center font-body text-label text-gray-500">
            <Link
              href={loginHref}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to {roleLabel} login
            </Link>
          </p>
        </form>
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
            <p className="text-center font-body text-body text-gray-500">
              Loading...
            </p>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
