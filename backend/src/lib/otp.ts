import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 10;

export function generateOtp(): {
  code: string;
  hashedCode: string;
  expiresAt: Date;
} {
  const code = crypto.randomInt(100000, 999999).toString();
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  return { code, hashedCode, expiresAt };
}

export function verifyOtpCode(
  inputCode: string,
  storedHash: string,
  expiresAt: Date
): boolean {
  if (Date.now() > expiresAt.getTime()) {
    return false;
  }

  const inputHash = crypto.createHash("sha256").update(inputCode).digest("hex");
  return inputHash === storedHash;
}

type Fast2SmsResponse = {
  return?: boolean;
  message?: string | string[];
};

export async function sendOtpViaSms(
  phone: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
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

    const data = (await response.json()) as Fast2SmsResponse;

    if (!response.ok || data.return === false) {
      console.error("[OTP] Fast2SMS error:", data);
      return { success: false, error: "sms_send_failed" };
    }

    return { success: true };
  } catch (err) {
    console.error("[OTP] Fast2SMS exception:", err);
    return { success: false, error: "sms_exception" };
  }
}
