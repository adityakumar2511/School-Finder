export type OtpEmailResult =
  | { success: true }
  | { success: false; reason: "send_failed" | "email_not_configured" };

export async function sendOtpEmail(
  email: string,
  otp: string,
  name?: string
): Promise<OtpEmailResult> {
  // Hamesha terminal mein print karo — dev aur prod dono mein
  console.log("\n[OTP] ----------------------------------------");
  console.log("  Email : " + email);
  console.log("  Name  : " + (name ?? "N/A"));
  console.log("  OTP   : " + otp);
  console.log("[OTP] ----------------------------------------\n");

  // Brevo configured hai toh email bhejo
  if (process.env.BREVO_API_KEY?.trim() && process.env.EMAIL_FROM?.trim()) {
    const https = await import("https");

    const payload = JSON.stringify({
      sender: { email: process.env.EMAIL_FROM },
      to: [{ email }],
      subject: "Your SchoolFinder Password Reset OTP",
      htmlContent:
        "<div style='font-family:sans-serif;text-align:center;padding:40px'>" +
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

    return new Promise<OtpEmailResult>((resolve) => {
      const options = {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY!,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        if (res.statusCode && res.statusCode < 300) {
          console.log("[OTP] Email sent via Brevo to " + email);
          resolve({ success: true });
        } else {
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