"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Wraps async route handlers and forwards rejected promises to Express error middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
