"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
exports.formatZodErrors = formatZodErrors;
const sanitize_1 = require("../lib/sanitize");
function formatZodErrors(error) {
    const errors = {};
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
const validate = (schema) => (req, _res, next) => {
    try {
        if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
            (0, sanitize_1.sanitizeRequestBody)(req.body);
        }
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next(result.error);
            return;
        }
        req.body = result.data;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validate = validate;
