export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getListenHost(): string {
  return isProduction() ? "0.0.0.0" : "localhost";
}

export function logProductionWarnings(): void {
  if (!isProduction()) return;

  const required = ["DATABASE_URL", "JWT_SECRET", "FRONTEND_URL"] as const;
  for (const key of required) {
    if (!process.env[key]?.trim()) {
      console.warn(`[Config] Missing required production variable: ${key}`);
    }
  }

  const frontend = process.env.FRONTEND_URL?.trim() ?? "";
  if (frontend.startsWith("http://") && !frontend.includes("localhost")) {
    console.warn(
      "[Config] FRONTEND_URL should use HTTPS in production for secure cookies and CORS."
    );
  }
}
