"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
async function sendOtpEmail(email, otp, name) {
    // Hamesha terminal mein print karo — dev aur prod dono mein
    console.log("\n[OTP] ----------------------------------------");
    console.log("  Email : " + email);
    console.log("  Name  : " + (name ?? "N/A"));
    console.log("  OTP   : " + otp);
    console.log("[OTP] ----------------------------------------\n");
    // Brevo configured hai toh email bhejo
    if (process.env.BREVO_API_KEY?.trim() && process.env.EMAIL_FROM?.trim()) {
        const { default: https } = await Promise.resolve().then(() => __importStar(require("https")));
        const payload = JSON.stringify({
            sender: { email: process.env.EMAIL_FROM },
            to: [{ email }],
            subject: "Your SchoolFinder Password Reset OTP",
            htmlContent: "<div style='font-family:sans-serif;text-align:center;padding:40px'>" +
                "<h2>Password Reset OTP</h2>" +
                "<p>Hi" +
                (name ? " " + name : "") +
                ", use this OTP to reset your password. It expires in 10 minutes.</p>" +
                "<div style='font-size:48px;font-weight:bold;letter-spacing:12px;margin:32px 0'>" +
                otp +
                "</div>" +
                "<p style='color:#888'>If you did not request this, ignore this email.</p>" +
                "</div>",
        });
        return new Promise((resolve) => {
            const options = {
                hostname: "api.brevo.com",
                path: "/v3/smtp/email",
                method: "POST",
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(payload),
                },
            };
            const req = https.request(options, (res) => {
                if (res.statusCode && res.statusCode < 300) {
                    console.log("[OTP] Email sent via Brevo to " + email);
                    resolve({ success: true });
                }
                else {
                    console.error("[OTP] Brevo returned status: " + res.statusCode);
                    // Email fail hui lekin OTP terminal mein hai — flow continue karo
                    resolve({ success: true });
                }
            });
            req.on("error", (err) => {
                console.error("[OTP] Brevo request error:", err.message);
                // Network error — lekin OTP terminal mein hai — flow continue karo
                resolve({ success: true });
            });
            req.write(payload);
            req.end();
        });
    }
    // Brevo configured nahi — sirf terminal print, flow continue
    console.log("[OTP] Brevo not configured — OTP printed to terminal only.");
    return { success: true };
}
