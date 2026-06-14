export type ApiErrorCategory =
  | "field_errors"
  | "conflict"
  | "auth"
  | "server_error"
  | "network";

export interface ParsedApiError {
  category: ApiErrorCategory;
  message: string;
  errors?: Record<string, string>;
}

const PRISMA_CODES = new Set(["P2025", "P2003", "P2002"]);

export async function parseApiError(
  response: Response | null,
  caughtError?: unknown
): Promise<ParsedApiError> {
  // Network failure
  if (response === null || caughtError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[SchoolSetu] Network error:", caughtError);
    }
    return {
      category: "network",
      message: "Couldn't reach the server. Check your connection and try again.",
    };
  }

  // Auth errors
  if (response.status === 401 || response.status === 403) {
    return {
      category: "auth",
      message: "Your session has expired. Please log in again.",
    };
  }

  // Parse body
  let body: {
    success?: boolean;
    code?: string;
    message?: string;
    errors?: Record<string, string | string[]>;
  } = {};

  try {
    body = await response.json();
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.error("[SchoolSetu] Non-JSON error response:", response.status);
    }
    return {
      category: "server_error",
      message:
        "Something went wrong on our end. Please try again. If this keeps happening, contact support.",
    };
  }

  const code = body.code ?? "";

  // Validation errors (field-level)
  if (
    code === "VALIDATION_ERROR" &&
    body.errors &&
    typeof body.errors === "object"
  ) {
    const flatErrors: Record<string, string> = {};
    for (const [field, msgs] of Object.entries(body.errors)) {
      flatErrors[field] = Array.isArray(msgs)
        ? (msgs[0] ?? "Invalid value")
        : msgs;
    }
    if (process.env.NODE_ENV === "development") {
      console.error("[SchoolSetu] Validation errors:", flatErrors);
    }
    return {
      category: "field_errors",
      message:
        body.message ?? "Please fix the highlighted fields and try again.",
      errors: flatErrors,
    };
  }

  // Conflict (duplicate)
  if (response.status === 409 || code === "CONFLICT") {
    return {
      category: "conflict",
      message:
        typeof body.message === "string" && body.message.length > 0
          ? body.message
          : "This entry already exists. Please check and try again.",
    };
  }

  // Prisma / server errors
  if (response.status === 500 || PRISMA_CODES.has(code)) {
    if (process.env.NODE_ENV === "development") {
      console.error("[SchoolSetu] Server error:", {
        status: response.status,
        code,
        body,
      });
    }
    return {
      category: "server_error",
      message:
        "Something went wrong on our end. Please try again. If this keeps happening, contact support.",
    };
  }

  // Fallback
  if (process.env.NODE_ENV === "development") {
    console.error("[SchoolSetu] Unhandled API error:", {
      status: response.status,
      code,
      body,
    });
  }

  return {
    category: "server_error",
    message:
      typeof body.message === "string" && body.message.length > 0
        ? body.message
        : "Something went wrong. Please try again.",
  };
}