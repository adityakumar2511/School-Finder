"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpRateLimiter = exports.resetPasswordRateLimiter = exports.forgotPasswordRateLimiter = exports.authRateLimiter = exports.generalRateLimiter = exports.corsMiddleware = exports.helmetMiddleware = void 0;
exports.corsMethodGuard = corsMethodGuard;
exports.applySecurityMiddleware = applySecurityMiddleware;
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ALLOWED_METHODS = ["GET", "POST", "PATCH", "DELETE"];
exports.helmetMiddleware = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: { policy: "credentialless" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
    },
    xXssProtection: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
function getAllowedOrigins() {
    const raw = process.env.FRONTEND_URL?.trim();
    if (!raw) {
        if (process.env.NODE_ENV === "production") {
            return [];
        }
        return ["http://localhost:3000"];
    }
    return raw
        .split(",")
        .map((entry) => entry.trim().replace(/\/$/, ""))
        .filter(Boolean);
}
exports.corsMiddleware = (0, cors_1.default)({
    origin(origin, callback) {
        const allowedOrigins = getAllowedOrigins();
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin not allowed by CORS policy"));
    },
    methods: [...ALLOWED_METHODS],
    credentials: true,
    optionsSuccessStatus: 204,
});
function corsMethodGuard(req, res, next) {
    if (req.method === "OPTIONS") {
        next();
        return;
    }
    if (!ALLOWED_METHODS.includes(req.method)) {
        res.status(405).json({ success: false, message: "Method not allowed" });
        return;
    }
    next();
}
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: FIFTEEN_MINUTES_MS,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: FIFTEEN_MINUTES_MS,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});
exports.forgotPasswordRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: ONE_HOUR_MS,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many password reset requests. Please try again in an hour.",
    },
});
exports.resetPasswordRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: ONE_HOUR_MS,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many reset attempts. Please try again in an hour.",
    },
});
const TEN_MINUTES_MS = 10 * 60 * 1000;
exports.otpRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: TEN_MINUTES_MS,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        code: "RATE_LIMITED",
        message: "Too many OTP requests. Please wait before requesting again.",
    },
});
function applySecurityMiddleware(app) {
    const trustProxy = process.env.TRUST_PROXY === "true" ||
        process.env.NODE_ENV === "production";
    app.set("trust proxy", trustProxy ? 1 : false);
    app.disable("x-powered-by");
    app.use(exports.helmetMiddleware);
    app.use(exports.corsMiddleware);
    app.use(corsMethodGuard);
}
