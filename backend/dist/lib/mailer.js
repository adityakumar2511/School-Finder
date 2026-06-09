"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.sendOtpEmail = sendOtpEmail;
const crypto_1 = require("crypto");
const resend_1 = require("resend");
function ensureEmailConfigured() {
    if (!process.env.RESEND_API_KEY?.trim() || !process.env.EMAIL_FROM?.trim()) {
        console.warn("[Mailer] RESEND_API_KEY or EMAIL_FROM not set. Email not sent.");
        return { success: false, reason: "email_not_configured" };
    }
    return null;
}
function getResendClient() {
    return new resend_1.Resend(process.env.RESEND_API_KEY);
}
function generateOtp() {
    return String((0, crypto_1.randomInt)(0, 1000000)).padStart(6, "0");
}
async function sendOtpEmail(email, otp, name) {
    const notConfigured = ensureEmailConfigured();
    if (notConfigured) {
        return notConfigured;
    }
    try {
        await getResendClient().emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Your SchoolFinder Password Reset OTP",
            html: `<div style="font-family:sans-serif;text-align:center;padding:40px">
                  <h2>Password Reset OTP</h2>
                  <p>Hi${name ? ` ${name}` : ""}, use this OTP to reset your password. It expires in 10 minutes.</p>
                  <div style="font-size:48px;font-weight:bold;letter-spacing:12px;margin:32px 0">${otp}</div>
                  <p style="color:#888">If you did not request this, ignore this email.</p>
                </div>`,
        });
        return { success: true };
    }
    catch (error) {
        console.error("[OTP] Failed to send email:", error);
        return { success: false, reason: "send_failed" };
    }
}
