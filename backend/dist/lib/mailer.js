"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.sendOtpEmail = sendOtpEmail;
const crypto_1 = require("crypto");
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
function generateOtp() {
    return String((0, crypto_1.randomInt)(0, 1000000)).padStart(6, "0");
}
async function sendOtpEmail(email, otp, name) {
    console.log(`[OTP] Email: ${email} | OTP: ${otp} | Time: ${new Date().toISOString()}`);
    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Your SchoolFinder Password Reset OTP",
            html: `<div style="font-family:sans-serif;text-align:center;padding:40px">
                  <h2>Password Reset OTP</h2>
                  <p>Use this OTP to reset your password. It expires in 10 minutes.</p>
                  <div style="font-size:48px;font-weight:bold;letter-spacing:12px;margin:32px 0">${otp}</div>
                  <p style="color:#888">If you did not request this, ignore this email.</p>
                </div>`,
        });
    }
    catch (error) {
        console.error("[OTP] Failed to send email:", error);
    }
}
