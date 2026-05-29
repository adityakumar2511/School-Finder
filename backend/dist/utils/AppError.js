"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
/**
 * Operational application error with HTTP status code.
 */
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = "AppError";
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
