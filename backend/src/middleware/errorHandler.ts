import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma";
import { AppError } from "../utils/AppError";
import { formatZodErrors } from "./validate";

const isDevelopment = (): boolean => process.env.NODE_ENV === "development";

/**
 * 404 handler for unknown routes — register after all route mounts.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

/**
 * Centralized error handler — register last in server.ts.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  let statusCode = 500;
  let message = "Internal server error";
  let errors: Record<string, string> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = formatZodErrors(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = "Resource already exists";
        break;
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Database operation failed";
  } else if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  ) {
    statusCode = 401;
    message = "Authentication failed";
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid request payload";
  } else if (err instanceof Error) {
    if (err.message === "INVALID_SCHOOL_NAME") {
      statusCode = 400;
      message = "School name is required";
    } else if (err.message === "SLUG_GENERATION_FAILED") {
      statusCode = 500;
      message = "Failed to generate school identifier";
    }
  }

  if (statusCode >= 500) {
    console.error("[Error]", err);
  } else if (isDevelopment() && err instanceof Error) {
    console.error(`[${statusCode}] ${message}`, err.message);
  }

  const payload: Record<string, unknown> = {
    success: false,
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  if (isDevelopment() && err instanceof Error && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
