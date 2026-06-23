import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import * as Sentry from "@sentry/node";
import { Prisma } from "../../generated/prisma";
import { AppError, Errors } from "../utils/AppError";

const isDevelopment = (): boolean => process.env.NODE_ENV === "development";

type ErrorPayload = {
  success: false;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
};

function sendError(res: Response, statusCode: number, payload: ErrorPayload): void {
  res.status(statusCode).json(payload);
}

function captureUnhandledError(err: unknown, req: Request): void {
  if (!process.env.SENTRY_DSN?.trim()) return;

  Sentry.withScope((scope) => {
    scope.setTag("http.method", req.method);
    scope.setTag("http.path", req.path);

    scope.setContext("request", {
      method: req.method,
      path: req.path,
      route: req.route?.path,
    });

    Sentry.captureException(err);
  });
}

/**
 * 404 handler for unknown routes — register after all route mounts.
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(Errors.NotFound(`Route ${req.method} ${req.path}`));
};

/**
 * Centralized error handler — register last in server.ts.
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  // a) AppError (operational)
  if (err instanceof AppError) {
    if (err.context) {
      console.warn(`[AppError:${err.code}]`, err.message, err.context);
    } else {
      console.warn(`[AppError:${err.code}]`, err.message);
    }

    sendError(res, err.statusCode, {
      success: false,
      code: err.code,
      message: err.message,
    });
    return;
  }

  // b) ZodError
  if (err instanceof ZodError) {
    sendError(res, 400, {
      success: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: err.flatten().fieldErrors as Record<string, string[]>,
    });
    return;
  }

  // c–e) Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target;

      const field =
        Array.isArray(target) && target.length > 0
          ? String(target[0])
          : typeof target === "string"
            ? target
            : undefined;

      const message = field
        ? `A record with this ${field} already exists`
        : "A record with this value already exists";

      sendError(res, 409, {
        success: false,
        code: "CONFLICT",
        message,
      });
      return;
    }

    if (err.code === "P2025") {
      sendError(res, 404, {
        success: false,
        code: "NOT_FOUND",
        message: "Record not found",
      });
      return;
    }

    if (err.code === "P2003") {
      sendError(res, 409, {
        success: false,
        code: "CONFLICT",
        message: "Related record not found",
      });
      return;
    }

    console.warn("[Prisma]", err.code, err.message);

    sendError(res, 400, {
      success: false,
      code: "BAD_REQUEST",
      message: "Database operation failed",
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 400, {
      success: false,
      code: "BAD_REQUEST",
      message: "Database operation failed",
    });
    return;
  }

  // f) JWT errors
  if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError ||
    err instanceof jwt.NotBeforeError
  ) {
    sendError(res, 401, {
      success: false,
      code: "INVALID_TOKEN",
      message: "Invalid or expired token",
    });
    return;
  }

  // g) Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, 400, {
      success: false,
      code: "INVALID_JSON",
      message: "Invalid JSON in request body",
    });
    return;
  }

  // Legacy string error codes from slug helpers
  if (err instanceof Error) {
    if (err.message === "INVALID_SCHOOL_NAME") {
      sendError(res, 400, {
        success: false,
        code: "BAD_REQUEST",
        message: "School name is required",
      });
      return;
    }

    if (err.message === "SLUG_GENERATION_FAILED") {
      captureUnhandledError(err, req);

      sendError(res, 500, {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Failed to generate school identifier",
      });
      return;
    }
  }

  // h) Unknown errors
  console.error("[UnhandledError]", err);
  captureUnhandledError(err, req);

  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }

  const payload: ErrorPayload = {
    success: false,
    code: "INTERNAL_ERROR",
    message: "Something went wrong",
  };

  if (isDevelopment() && err instanceof Error && err.stack) {
    payload.stack = err.stack;
  }

  sendError(res, 500, payload);
};