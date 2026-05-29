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
const validate_1 = require("./validate");
const isDevelopment = () => process.env.NODE_ENV === "development";
/**
 * 404 handler for unknown routes — register after all route mounts.
 */
const notFoundHandler = (_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
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
    let statusCode = 500;
    let message = "Internal server error";
    let errors;
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = "Validation failed";
        errors = (0, validate_1.formatZodErrors)(err);
    }
    else if (err instanceof prisma_1.Prisma.PrismaClientKnownRequestError) {
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
    }
    else if (err instanceof prisma_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Database operation failed";
    }
    else if (err instanceof jsonwebtoken_1.default.JsonWebTokenError ||
        err instanceof jsonwebtoken_1.default.TokenExpiredError) {
        statusCode = 401;
        message = "Authentication failed";
    }
    else if (err instanceof SyntaxError && "body" in err) {
        statusCode = 400;
        message = "Invalid request payload";
    }
    else if (err instanceof Error) {
        if (err.message === "INVALID_SCHOOL_NAME") {
            statusCode = 400;
            message = "School name is required";
        }
        else if (err.message === "SLUG_GENERATION_FAILED") {
            statusCode = 500;
            message = "Failed to generate school identifier";
        }
    }
    if (statusCode >= 500) {
        console.error("[Error]", err);
    }
    else if (isDevelopment() && err instanceof Error) {
        console.error(`[${statusCode}] ${message}`, err.message);
    }
    const payload = {
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
exports.errorHandler = errorHandler;
