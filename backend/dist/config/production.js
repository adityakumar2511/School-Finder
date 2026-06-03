"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = isProduction;
exports.getListenHost = getListenHost;
exports.validateStartupEnv = validateStartupEnv;
function isProduction() {
    return process.env.NODE_ENV === "production";
}
function getListenHost() {
    return isProduction() ? "0.0.0.0" : "localhost";
}
function getEnvValue(key) {
    return process.env[key]?.trim() ?? "";
}
function isEnvMissing(key) {
    return getEnvValue(key) === "";
}
function validateStartupEnv() {
    const production = isProduction();
    const missing = [];
    const alwaysRequired = [
        "DATABASE_URL",
        "JWT_SECRET",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ];
    const productionRequired = ["FRONTEND_URL"];
    for (const key of alwaysRequired) {
        if (isEnvMissing(key)) {
            missing.push(key);
        }
    }
    if (production) {
        for (const key of productionRequired) {
            if (isEnvMissing(key)) {
                missing.push(key);
            }
        }
        if (process.env.NODE_ENV !== "production") {
            missing.push("NODE_ENV (must be 'production')");
        }
    }
    if (missing.length > 0) {
        const message = `[Config] Missing required environment variable(s): ${missing.join(", ")}`;
        if (production) {
            console.error(message);
            process.exit(1);
        }
        console.warn(message);
    }
    const emailVars = ["RESEND_API_KEY", "EMAIL_FROM"];
    const missingEmail = emailVars.filter((key) => isEnvMissing(key));
    if (missingEmail.length > 0) {
        console.warn(`[Config] Email not configured. Missing: ${missingEmail.join(", ")}. ` +
            "Password reset emails will not be sent.");
    }
    if (production) {
        const frontend = getEnvValue("FRONTEND_URL");
        if (frontend.startsWith("http://") && !frontend.includes("localhost")) {
            console.warn("[Config] FRONTEND_URL should use HTTPS in production for secure cookies and CORS.");
        }
    }
}
