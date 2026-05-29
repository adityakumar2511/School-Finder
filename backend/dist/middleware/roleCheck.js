"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const AppError_1 = require("../utils/AppError");
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(new AppError_1.AppError(401, "Authentication required"));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new AppError_1.AppError(403, "Access denied — insufficient permissions"));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
