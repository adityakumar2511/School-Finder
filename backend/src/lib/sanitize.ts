/**
 * Request body sanitization helpers used before Zod validation.
 */

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
