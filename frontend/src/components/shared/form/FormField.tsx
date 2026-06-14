import * as React from "react";
import { Label } from "@/components/shared/ui/label";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Shared style tokens (moved here from per-section files so every
// field across every form section looks identical and only needs
// to be tuned in one place).
// ─────────────────────────────────────────────────────────────

export const inputClass =
  "w-full h-11 px-3 rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors";

export const inputErrorClass = "border-red-400 bg-red-50/30";

export const selectClass = `${inputClass} cursor-pointer appearance-none pr-8`;

export interface FormFieldProps {
  /** Visible label text. Omit if you only need error/wrapper behavior. */
  label?: string;
  /** Adds a red asterisk after the label. */
  required?: boolean;
  /**
   * Validation error message (e.g. from `errors.basicInfo?.schoolName?.message`).
   * When present, the field is wrapped with error styling and the
   * message is rendered below the input — this is the single place
   * field-level errors from `parseApiError()` should be surfaced.
   */
  error?: string;
  /** `htmlFor` / id pairing with the input. Optional — only needed if you want the label to be clickable. */
  htmlFor?: string;
  /** Extra classes for the outer wrapper (default: "space-y-1.5"). */
  className?: string;
  /**
   * The input/select/textarea element. FormField does NOT inject
   * inputClass/selectClass automatically — pass it via the child's
   * className using the exported `inputClass`/`selectClass`/`inputErrorClass`
   * helpers, e.g.:
   *   <Input className={cn(inputClass, error && inputErrorClass)} ... />
   */
  children: React.ReactNode;
}

/**
 * FormField — standard wrapper for a single form control.
 *
 * Renders:
 *   <Label> (optional, with required marker)
 *   {children}  (the actual input/select/textarea)
 *   error message (if `error` is provided)
 *
 * This does not replace the Input/Select/Textarea primitives — it
 * only standardizes the label + spacing + error layout that was
 * previously copy-pasted in every section file.
 */
export function FormField({
  label,
  required,
  error,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="font-heading text-label text-gray-800">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="font-body text-meta text-red-500">{error}</p>
      )}
    </div>
  );
}