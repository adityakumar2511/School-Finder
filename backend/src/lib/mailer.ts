import { randomInt } from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  name?: string
): Promise<void> {
  console.log(
    `[Reset] Email: ${email} | Link sent | Time: ${new Date().toISOString()}`
  );

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Reset your SchoolFinder password",
      html: `<div style="font-family:sans-serif;text-align:center;padding:40px">
                  <h2>Password Reset</h2>
                  <p>Hi${name ? ` ${name}` : ""}, click the button below to reset your password. This link expires in 1 hour.</p>
                  <a href="${resetLink}" style="display:inline-block;margin:32px 0;padding:14px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Reset Password</a>
                  <p style="color:#888;font-size:14px">If you did not request this, ignore this email.</p>
                </div>`,
    });
  } catch (error) {
    console.error("[Reset] Failed to send email:", error);
  }
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  name?: string
): Promise<void> {
  console.log(
    `[OTP] Email: ${email} | OTP: ${otp} | Time: ${new Date().toISOString()}`
  );

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Your SchoolFinder Password Reset OTP",
      html: `<div style="font-family:sans-serif;text-align:center;padding:40px">
                  <h2>Password Reset OTP</h2>
                  <p>Use this OTP to reset your password. It expires in 10 minutes.</p>
                  <div style="font-size:48px;font-weight:bold;letter-spacing:12px;margin:32px 0">${otp}</div>
                  <p style="color:#888">If you did not request this, ignore this email.</p>
                </div>`,
    });
  } catch (error) {
    console.error("[OTP] Failed to send email:", error);
  }
}
