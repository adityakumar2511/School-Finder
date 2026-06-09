import { randomInt } from "crypto";
import { Resend } from "resend";

type EmailNotConfigured = { success: false; reason: "email_not_configured" };

function ensureEmailConfigured(): EmailNotConfigured | null {
  if (!process.env.RESEND_API_KEY?.trim() || !process.env.EMAIL_FROM?.trim()) {
    console.warn("[Mailer] RESEND_API_KEY or EMAIL_FROM not set. Email not sent.");
    return { success: false, reason: "email_not_configured" };
  }
  return null;
}

function getResendClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  name?: string
): Promise<{ success: true } | EmailNotConfigured | { success: false; reason: "send_failed" }> {
  const notConfigured = ensureEmailConfigured();
  if (notConfigured) {
    return notConfigured;
  }

  try {
    await getResendClient().emails.send({
      from: process.env.EMAIL_FROM!,
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
  } catch (error) {
    console.error("[OTP] Failed to send email:", error);
    return { success: false, reason: "send_failed" };
  }
}
