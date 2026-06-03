"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const AppError_1 = require("../utils/AppError");
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(AppError_1.Errors.Unauthorized("Authentication required"));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(AppError_1.Errors.Forbidden("Access denied — insufficient permissions"));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
