"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.JWT_ISSUER = void 0;
exports.signAccessToken = signAccessToken;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenBlacklist_1 = require("../lib/tokenBlacklist");
const AppError_1 = require("../utils/AppError");
exports.JWT_ISSUER = "schoolfinder-api";
const JWT_ALGORITHM = "HS256";
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "7d");
function getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
        throw new AppError_1.AppError("Server authentication is not configured", 500, "INTERNAL_ERROR");
    }
    return secret;
}
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign({
        ...payload,
        jti: crypto_1.default.randomUUID(),
    }, getJwtSecret(), {
        expiresIn: jwtExpiresIn,
        algorithm: JWT_ALGORITHM,
        issuer: exports.JWT_ISSUER,
    });
}
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next(AppError_1.Errors.Unauthorized("Authentication token is required"));
        return;
    }
    if (!authHeader.startsWith("Bearer ")) {
        next(AppError_1.Errors.Unauthorized("Authentication token must use Bearer scheme"));
        return;
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
        next(AppError_1.Errors.Unauthorized("Authentication token is required"));
        return;
    }
    if (token.split(".").length !== 3) {
        next(AppError_1.Errors.Unauthorized("Malformed authentication token"));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret(), {
            algorithms: [JWT_ALGORITHM],
            issuer: exports.JWT_ISSUER,
        });
        if (decoded.jti && tokenBlacklist_1.tokenBlacklist.has(decoded.jti)) {
            next(AppError_1.Errors.InvalidToken());
            return;
        }
        if (!decoded.id || !decoded.role || !decoded.email) {
            next(AppError_1.Errors.InvalidToken());
            return;
        }
        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError ||
            error instanceof jsonwebtoken_1.default.JsonWebTokenError ||
            error instanceof jsonwebtoken_1.default.NotBeforeError) {
            next(AppError_1.Errors.InvalidToken());
            return;
        }
        next(AppError_1.Errors.Unauthorized("Authentication failed"));
    }
};
exports.auth = auth;
