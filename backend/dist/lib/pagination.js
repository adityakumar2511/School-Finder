"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PAGE_LIMIT = exports.DEFAULT_ADMIN_PAGE_LIMIT = exports.DEFAULT_SCHOOL_PAGE_LIMIT = void 0;
exports.parsePage = parsePage;
exports.parseLimit = parseLimit;
exports.buildPaginationMeta = buildPaginationMeta;
exports.paginatedResponse = paginatedResponse;
exports.cursorPaginatedResponse = cursorPaginatedResponse;
exports.DEFAULT_SCHOOL_PAGE_LIMIT = 12;
exports.DEFAULT_ADMIN_PAGE_LIMIT = 20;
exports.MAX_PAGE_LIMIT = 50;
function parsePage(value, fallback = 1) {
    const parsed = parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function parseLimit(value, fallback, max = exports.MAX_PAGE_LIMIT) {
    const parsed = parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }
    return Math.min(max, parsed);
}
function buildPaginationMeta(total, page, limit) {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
    };
}
/**
 * Standard paginated API envelope.
 * Includes legacy `alias` key when provided for backward compatibility.
 */
function paginatedResponse(data, pagination, alias) {
    const body = {
        data,
        pagination,
    };
    if (alias) {
        body[alias] = data;
    }
    return body;
}
function cursorPaginatedResponse(data, pagination, alias) {
    const body = {
        data,
        pagination,
    };
    if (alias) {
        body[alias] = data;
    }
    return body;
}
