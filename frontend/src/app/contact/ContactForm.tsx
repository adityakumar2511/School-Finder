"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/shared/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
const SHEET_WEBHOOK_URL = process.env.NEXT_PUBLIC_CONTACT_SHEET_URL!;

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setState("loading");

    try {
      // 1. Primary save — must succeed for success state
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Something went wrong.");
      }

      setState("success");

      // 2. Non-blocking side effects — failures here never affect the success UI
      emailjs
  .send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      time: new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    },
    EMAILJS_PUBLIC_KEY
  )
  .catch((err) => console.error("EmailJS send failed:", err));
      fetch(SHEET_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(form),
      }).catch((err) => console.error("Sheets sync failed:", err));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="card-premium flex flex-col items-center justify-center py-16 text-center gap-4">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <h3 className="font-semibold text-gray-900 text-lg">Message sent!</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Thanks for reaching out. We'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setForm({ name: "", email: "", phone: "", message: "" });
            setState("idle");
          }}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="card-premium">
      <h2 className="font-semibold text-gray-900 text-lg mb-6">Send us a message</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="form-label block mb-1.5">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="form-input"
            disabled={state === "loading"}
          />
        </div>

        <div>
          <label htmlFor="email" className="form-label block mb-1.5">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="form-input"
            disabled={state === "loading"}
          />
        </div>

        <div>
          <label htmlFor="phone" className="form-label block mb-1.5">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            className="form-input"
            disabled={state === "loading"}
          />
        </div>

        <div>
          <label htmlFor="message" className="form-label block mb-1.5">Message</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us what's on your mind..."
            className="form-input resize-none"
            disabled={state === "loading"}
          />
        </div>

        {error && <div className="alert-danger text-sm">{error}</div>}

        <Button
          onClick={handleSubmit}
          disabled={state === "loading"}
          className="btn-primary w-full"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </div>
    </div>
  );
}