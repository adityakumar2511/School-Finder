"use strict";
/**
 * Request body sanitization helpers used before Zod validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessEmail = exports.preprocessOptionalString = exports.preprocessTrim = void 0;
exports.sanitizeRequestBody = sanitizeRequestBody;
function sanitizeRequestBody(body) {
    for (const key of Object.keys(body)) {
        const value = body[key];
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed === "") {
                body[key] = undefined;
            }
            else if (key.toLowerCase().includes("email")) {
                body[key] = trimmed.toLowerCase();
            }
            else {
                body[key] = trimmed;
            }
        }
    }
}
const preprocessTrim = (value) => typeof value === "string" ? value.trim() : value;
exports.preprocessTrim = preprocessTrim;
const preprocessOptionalString = (value) => {
    if (value === null || value === undefined)
        return undefined;
    if (typeof value !== "string")
        return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
};
exports.preprocessOptionalString = preprocessOptionalString;
const preprocessEmail = (value) => {
    if (typeof value !== "string")
        return value;
    const trimmed = value.trim().toLowerCase();
    return trimmed === "" ? undefined : trimmed;
};
exports.preprocessEmail = preprocessEmail;
