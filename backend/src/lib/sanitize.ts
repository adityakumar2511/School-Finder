/**
 * Request body sanitization helpers used before Zod validation and DB writes.
 */

import { AppError } from "../utils/AppError";

const DANGEROUS_TAG_PATTERN =
  /<\s*(?:script|iframe|object)\b[^>]*>[\s\S]*?<\/\s*(?:script|iframe|object)\s*>|<\s*(?:script|iframe|object)\b[^>]*\/?>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const INDIAN_PHONE_PATTERN = /^(?:\+91\d{10}|\d{10})$/;

export function stripDangerousTags(value: string): string {
  return value.replace(DANGEROUS_TAG_PATTERN, "");
}

export function stripAllHtmlTags(value: string): string {
  return value.replace(HTML_TAG_PATTERN, "");
}

export function encodeHtmlEntities(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeTextField(value: string): string {
  return encodeHtmlEntities(stripDangerousTags(value.trim()));
}

export function sanitizePlainTextField(value: string): string {
  return encodeHtmlEntities(stripAllHtmlTags(stripDangerousTags(value.trim())));
}

export function isValidIndianPhone(phone: string): boolean {
  return INDIAN_PHONE_PATTERN.test(phone.trim());
}

export function normalizeIndianPhone(phone: string): string {
  const trimmed = phone.trim();

  if (!isValidIndianPhone(trimmed)) {
    throw new AppError(400, "Enter a valid phone number (+91XXXXXXXXXX or 10 digits)");
  }

  const plus91Match = /^\+91(\d{10})$/.exec(trimmed);
  return plus91Match ? plus91Match[1] : trimmed;
}

export const preprocessIndianPhone = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed === "") return trimmed;

  const plus91Match = /^\+91(\d{10})$/.exec(trimmed);
  if (plus91Match) return plus91Match[1];

  return trimmed;
};

const PLAIN_TEXT_FIELDS = new Set(["description", "address"]);
const URL_FIELDS = new Set(["website", "logoUrl"]);

export function sanitizeSchoolData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value !== "string") continue;

    if (key === "phone") {
      (sanitized as Record<string, unknown>)[key] = normalizeIndianPhone(value);
      continue;
    }

    if (key === "email") {
      (sanitized as Record<string, unknown>)[key] = value.trim().toLowerCase();
      continue;
    }

    if (PLAIN_TEXT_FIELDS.has(key)) {
      (sanitized as Record<string, unknown>)[key] = sanitizePlainTextField(value);
      continue;
    }

    if (URL_FIELDS.has(key)) {
      (sanitized as Record<string, unknown>)[key] = stripDangerousTags(value.trim());
      continue;
    }

    (sanitized as Record<string, unknown>)[key] = sanitizeTextField(value);
  }

  return sanitized;
}

export function sanitizeRequestBody(body: Record<string, unknown>): void {
  for (const key of Object.keys(body)) {
    const value = body[key];

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") {
        body[key] = undefined;
      } else if (key.toLowerCase().includes("email")) {
        body[key] = trimmed.toLowerCase();
      } else {
        body[key] = trimmed;
      }
    }
  }
}

export const preprocessTrim = (value: unknown): unknown =>
  typeof value === "string" ? value.trim() : value;

export const preprocessOptionalString = (value: unknown): unknown => {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const preprocessEmail = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim().toLowerCase();
  return trimmed === "" ? undefined : trimmed;
};
