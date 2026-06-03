"use strict";
/**
 * Request body sanitization helpers used before Zod validation and DB writes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessEmail = exports.preprocessOptionalString = exports.preprocessTrim = exports.preprocessIndianPhone = void 0;
exports.stripDangerousTags = stripDangerousTags;
exports.stripAllHtmlTags = stripAllHtmlTags;
exports.encodeHtmlEntities = encodeHtmlEntities;
exports.sanitizeTextField = sanitizeTextField;
exports.sanitizePlainTextField = sanitizePlainTextField;
exports.isValidIndianPhone = isValidIndianPhone;
exports.normalizeIndianPhone = normalizeIndianPhone;
exports.sanitizeSchoolData = sanitizeSchoolData;
exports.sanitizeRequestBody = sanitizeRequestBody;
const AppError_1 = require("../utils/AppError");
const DANGEROUS_TAG_PATTERN = /<\s*(?:script|iframe|object)\b[^>]*>[\s\S]*?<\/\s*(?:script|iframe|object)\s*>|<\s*(?:script|iframe|object)\b[^>]*\/?>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const INDIAN_PHONE_PATTERN = /^(?:\+91\d{10}|\d{10})$/;
function stripDangerousTags(value) {
    return value.replace(DANGEROUS_TAG_PATTERN, "");
}
function stripAllHtmlTags(value) {
    return value.replace(HTML_TAG_PATTERN, "");
}
function encodeHtmlEntities(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function sanitizeTextField(value) {
    return encodeHtmlEntities(stripDangerousTags(value.trim()));
}
function sanitizePlainTextField(value) {
    return encodeHtmlEntities(stripAllHtmlTags(stripDangerousTags(value.trim())));
}
function isValidIndianPhone(phone) {
    return INDIAN_PHONE_PATTERN.test(phone.trim());
}
function normalizeIndianPhone(phone) {
    const trimmed = phone.trim();
    if (!isValidIndianPhone(trimmed)) {
        throw AppError_1.Errors.BadRequest("Enter a valid phone number (+91XXXXXXXXXX or 10 digits)");
    }
    const plus91Match = /^\+91(\d{10})$/.exec(trimmed);
    return plus91Match ? plus91Match[1] : trimmed;
}
const preprocessIndianPhone = (value) => {
    if (typeof value !== "string")
        return value;
    const trimmed = value.trim();
    if (trimmed === "")
        return trimmed;
    const plus91Match = /^\+91(\d{10})$/.exec(trimmed);
    if (plus91Match)
        return plus91Match[1];
    return trimmed;
};
exports.preprocessIndianPhone = preprocessIndianPhone;
const PLAIN_TEXT_FIELDS = new Set(["description", "address"]);
const URL_FIELDS = new Set(["website", "logoUrl"]);
function sanitizeSchoolData(data) {
    const sanitized = { ...data };
    for (const [key, value] of Object.entries(sanitized)) {
        if (typeof value !== "string")
            continue;
        if (key === "phone") {
            sanitized[key] = normalizeIndianPhone(value);
            continue;
        }
        if (key === "email") {
            sanitized[key] = value.trim().toLowerCase();
            continue;
        }
        if (PLAIN_TEXT_FIELDS.has(key)) {
            sanitized[key] = sanitizePlainTextField(value);
            continue;
        }
        if (URL_FIELDS.has(key)) {
            sanitized[key] = stripDangerousTags(value.trim());
            continue;
        }
        sanitized[key] = sanitizeTextField(value);
    }
    return sanitized;
}
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
