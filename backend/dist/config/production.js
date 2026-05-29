"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = isProduction;
exports.getListenHost = getListenHost;
exports.logProductionWarnings = logProductionWarnings;
function isProduction() {
    return process.env.NODE_ENV === "production";
}
function getListenHost() {
    return isProduction() ? "0.0.0.0" : "localhost";
}
function logProductionWarnings() {
    if (!isProduction())
        return;
    const required = ["DATABASE_URL", "JWT_SECRET", "FRONTEND_URL"];
    for (const key of required) {
        if (!process.env[key]?.trim()) {
            console.warn(`[Config] Missing required production variable: ${key}`);
        }
    }
    const frontend = process.env.FRONTEND_URL?.trim() ?? "";
    if (frontend.startsWith("http://") && !frontend.includes("localhost")) {
        console.warn("[Config] FRONTEND_URL should use HTTPS in production for secure cookies and CORS.");
    }
}
