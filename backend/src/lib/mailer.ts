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

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  name?: string
): Promise<void | EmailNotConfigured> {
  const notConfigured = ensureEmailConfigured();
  if (notConfigured) {
    return notConfigured;
  }

  console.log(
    `[Reset] Email: ${email} | Link sent | Time: ${new Date().toISOString()}`
  );

  try {
    await getResendClient().emails.send({
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

// Preserved Resend OTP email implementation (replaced by Brevo stub below)
// export async function sendOtpEmailResend(
//   email: string,
//   otp: string,
//   name?: string
// ): Promise<void | EmailNotConfigured> {
//   const notConfigured = ensureEmailConfigured();
//   if (notConfigured) {
//     return notConfigured;
//   }
//
//   console.log(
//     `[OTP] Email: ${email} | OTP: ${otp} | Time: ${new Date().toISOString()}`
//   );
//
//   try {
//     await getResendClient().emails.send({
//       from: process.env.EMAIL_FROM!,
//       to: email,
//       subject: "Your SchoolFinder Password Reset OTP",
//       html: `<div style="font-family:sans-serif;text-align:center;padding:40px">
//                   <h2>Password Reset OTP</h2>
//                   <p>Use this OTP to reset your password. It expires in 10 minutes.</p>
//                   <div style="font-size:48px;font-weight:bold;letter-spacing:12px;margin:32px 0">${otp}</div>
//                   <p style="color:#888">If you did not request this, ignore this email.</p>
//                 </div>`,
//     });
//   } catch (error) {
//     console.error("[OTP] Failed to send email:", error);
//   }
// }

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  // TODO: Brevo email integration — uncomment when BREVO_API_KEY is configured
  // const client = new Brevo.TransactionalEmailsApi()
  // ... Brevo implementation here
  console.log(
    `[sendOtpEmail] Would send OTP ${otp} to ${to} — email disabled, using terminal only`
  );
}
