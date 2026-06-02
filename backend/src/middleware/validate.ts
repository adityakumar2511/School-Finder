import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { sanitizeRequestBody } from "../lib/sanitize";

export function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "body";
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return errors;
}

/**
 * Validates and sanitizes `req.body` against a Zod schema.
 * Replaces `req.body` with parsed output on success.
 */
export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
        sanitizeRequestBody(req.body as Record<string, unknown>);
      }

      const result = schema.safeParse(req.body);

      if (!result.success) {
        next(result.error);
        return;
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
