"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../../generated/prisma");
const AppError_1 = require("../utils/AppError");
const isDevelopment = () => process.env.NODE_ENV === "development";
function sendError(res, statusCode, payload) {
    res.status(statusCode).json(payload);
}
/**
 * 404 handler for unknown routes — register after all route mounts.
 */
const notFoundHandler = (req, _res, next) => {
    next(AppError_1.Errors.NotFound(`Route ${req.method} ${req.path}`));
};
exports.notFoundHandler = notFoundHandler;
/**
 * Centralized error handler — register last in server.ts.
 */
const errorHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }
    // a) AppError (operational)
    if (err instanceof AppError_1.AppError) {
        if (err.context) {
            console.warn(`[AppError:${err.code}]`, err.message, err.context);
        }
        else {
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
    if (err instanceof zod_1.ZodError) {
        sendError(res, 400, {
            success: false,
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            errors: err.flatten().fieldErrors,
        });
        return;
    }
    // c–e) Prisma known request errors
    if (err instanceof prisma_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const target = err.meta?.target;
            const field = Array.isArray(target) && target.length > 0
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
    if (err instanceof prisma_1.Prisma.PrismaClientValidationError) {
        sendError(res, 400, {
            success: false,
            code: "BAD_REQUEST",
            message: "Database operation failed",
        });
        return;
    }
    // f) JWT errors
    if (err instanceof jsonwebtoken_1.default.JsonWebTokenError ||
        err instanceof jsonwebtoken_1.default.TokenExpiredError ||
        err instanceof jsonwebtoken_1.default.NotBeforeError) {
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
    if (err instanceof Error && err.stack) {
        console.error(err.stack);
    }
    const payload = {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Something went wrong",
    };
    if (isDevelopment() && err instanceof Error && err.stack) {
        payload.stack = err.stack;
    }
    sendError(res, 500, payload);
};
exports.errorHandler = errorHandler;
