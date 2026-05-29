"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
function getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
        throw new AppError_1.AppError(500, "Server authentication is not configured");
    }
    return secret;
}
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next(new AppError_1.AppError(401, "Authentication token is required"));
        return;
    }
    if (!authHeader.startsWith("Bearer ")) {
        next(new AppError_1.AppError(401, "Authentication token must use Bearer scheme"));
        return;
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
        next(new AppError_1.AppError(401, "Authentication token is required"));
        return;
    }
    if (token.split(".").length !== 3) {
        next(new AppError_1.AppError(401, "Malformed authentication token"));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret());
        if (!decoded.id || !decoded.role || !decoded.email) {
            next(new AppError_1.AppError(401, "Invalid authentication token"));
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new AppError_1.AppError(401, "Authentication token has expired"));
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new AppError_1.AppError(401, "Invalid authentication token"));
            return;
        }
        if (error instanceof jsonwebtoken_1.default.NotBeforeError) {
            next(new AppError_1.AppError(401, "Authentication token is not yet valid"));
            return;
        }
        next(new AppError_1.AppError(401, "Authentication failed"));
    }
};
exports.auth = auth;
