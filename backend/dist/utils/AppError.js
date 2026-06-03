"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.AppError = void 0;
/**
 * Operational application error with HTTP status code and machine-readable code.
 */
class AppError extends Error {
    constructor(message, statusCode, code = "INTERNAL_ERROR", context) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        this.context = context;
        this.name = "AppError";
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
exports.Errors = {
    NotFound: (resource) => new AppError(`${resource} not found`, 404, "NOT_FOUND"),
    Unauthorized: (msg = "Unauthorized") => new AppError(msg, 401, "UNAUTHORIZED"),
    Forbidden: (msg = "Access denied") => new AppError(msg, 403, "FORBIDDEN"),
    Conflict: (msg) => new AppError(msg, 409, "CONFLICT"),
    BadRequest: (msg) => new AppError(msg, 400, "BAD_REQUEST"),
    RoleConflict: (msg = "Role mismatch") => new AppError(msg, 403, "ROLE_CONFLICT"),
    AccountDisabled: () => new AppError("Account has been disabled", 403, "ACCOUNT_DISABLED"),
    InvalidToken: () => new AppError("Invalid or expired token", 401, "INVALID_TOKEN"),
    RateLimited: () => new AppError("Too many requests", 429, "RATE_LIMITED"),
};
