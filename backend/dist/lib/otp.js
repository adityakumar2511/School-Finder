"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.verifyOtpCode = verifyOtpCode;
exports.sendOtpViaSms = sendOtpViaSms;
const crypto_1 = __importDefault(require("crypto"));
const OTP_EXPIRY_MINUTES = 10;
function generateOtp() {
    const code = crypto_1.default.randomInt(100000, 999999).toString();
    const hashedCode = crypto_1.default.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    return { code, hashedCode, expiresAt };
}
function verifyOtpCode(inputCode, storedHash, expiresAt) {
    if (Date.now() > expiresAt.getTime()) {
        return false;
    }
    const inputHash = crypto_1.default.createHash("sha256").update(inputCode).digest("hex");
    return inputHash === storedHash;
}
async function sendOtpViaSms(phone, otp) {
    const apiKey = process.env.FAST2SMS_API_KEY?.trim();
    if (!apiKey) {
        console.warn("[OTP] FAST2SMS_API_KEY not set. OTP not sent.");
        if (process.env.NODE_ENV === "development") {
            console.info(`[OTP DEV] Phone: ${phone} | OTP: ${otp}`);
        }
        return { success: false, error: "sms_not_configured" };
    }
    try {
        const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
                authorization: apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                route: "otp",
                variables_values: otp,
                numbers: phone.replace("+91", "").replace(/\D/g, ""),
            }),
        });
        const data = (await response.json());
        if (!response.ok || data.return === false) {
            console.error("[OTP] Fast2SMS error:", data);
            return { success: false, error: "sms_send_failed" };
        }
        return { success: true };
    }
    catch (err) {
        console.error("[OTP] Fast2SMS exception:", err);
        return { success: false, error: "sms_exception" };
    }
}
