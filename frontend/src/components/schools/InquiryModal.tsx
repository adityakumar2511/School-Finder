"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  schoolId: string;
  schoolName: string;
  fullWidth?: boolean;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

const PHONE_PATTERN = /^\d{10}$/;

function getParentToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("sf_parent_token");
}

function clearParentToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("sf_parent_token");
}

export default function InquiryModal({ schoolId, schoolName, fullWidth }: Props) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open && session?.user?.role === "PARENT" && session.user.name) {
      setParentName(session.user.name);
    }
  }, [open, session?.user?.name, session?.user?.role]);

  function resetForm() {
    setParentName(session?.user?.name ?? "");
    setPhone("");
    setMessage("");
    setError(null);
    setSuccess(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedName = parentName.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setError("Parent name is required.");
      return;
    }

    if (!PHONE_PATTERN.test(trimmedPhone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (trimmedMessage.length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    setSubmitting(true);

    try {
      if (!session?.user || session.user.role !== "PARENT") {
        setError("Authentication required.");
        return;
      }

      const token = getParentToken();
      if (!token) {
        setError("Please sign out and sign in again to refresh your session.");
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const inquiryMessage = `Parent name: ${trimmedName}\nPhone: ${trimmedPhone}\n\n${trimmedMessage}`;

      const response = await fetch(`${apiBase}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          message: inquiryMessage,
        }),
      });

      if (response.status === 401) {
        clearParentToken();
        setError("Session expired. Please sign out and sign in again.");
        return;
      }

      const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

      if (!response.ok) {
        setError(
          typeof body.message === "string"
            ? body.message
            : typeof body.error === "string"
              ? body.error
              : "Failed to send inquiry. Please try again."
        );
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 2000);
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderBody() {
    if (status === "loading") {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      );
    }

    if (!session?.user) {
      return (
        <div className="space-y-4 py-2">
          <p className="font-body text-body text-gray-800">
            Please log in to send an inquiry
          </p>
          <Link href="/login" className="btn-primary inline-flex">
            Log in
          </Link>
        </div>
      );
    }

    if (session.user.role === "SCHOOL_ADMIN" || session.user.role === "ADMIN") {
      return (
        <p className="font-body text-body text-gray-800 py-2">
          Only parents can send inquiries
        </p>
      );
    }

    if (session.user.role !== "PARENT") {
      return (
        <p className="font-body text-body text-gray-800 py-2">
          Please log in to send an inquiry
        </p>
      );
    }

    if (success) {
      return (
        <p className="alert-success font-body text-body">
          Inquiry sent successfully
        </p>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="inquiry-parent-name" className="form-label">
            Parent name
          </label>
          <input
            id="inquiry-parent-name"
            type="text"
            value={parentName}
            onChange={(event) => setParentName(event.target.value)}
            className="form-input"
            required
            disabled={submitting}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inquiry-phone" className="form-label">
            Phone number
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
            className="form-input"
            placeholder="10-digit mobile number"
            required
            disabled={submitting}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inquiry-message" className="form-label">
            Message
          </label>
          <textarea
            id="inquiry-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="form-input min-h-[120px] py-3"
            placeholder="Tell the school about your requirements..."
            required
            minLength={10}
            disabled={submitting}
          />
        </div>

        {error && (
          <p className="font-body text-label text-danger-text">{error}</p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`${
            fullWidth ? "w-full" : "inline-block"
          } px-6 py-3 bg-amber-400 hover:bg-amber-500 text-amber-800 font-heading font-semibold text-btn rounded-xl shadow-amber transition-colors`}
        >
          Send inquiry
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send inquiry</DialogTitle>
          <DialogDescription>
            Contact {schoolName} with your question or admission request.
          </DialogDescription>
        </DialogHeader>
        {renderBody()}
      </DialogContent>
    </Dialog>
  );
}
