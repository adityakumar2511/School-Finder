"use client";

import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setState("loading");

    try {
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
            setForm({ name: "", email: "", message: "" });
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
          <label htmlFor="name" className="form-label block mb-1.5">
            Name
          </label>
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
          <label htmlFor="email" className="form-label block mb-1.5">
            Email
          </label>
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
          <label htmlFor="message" className="form-label block mb-1.5">
            Message
          </label>
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

        {error && (
          <div className="alert-danger text-sm">{error}</div>
        )}

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