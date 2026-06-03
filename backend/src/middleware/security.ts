import type { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TEN_MINUTES_MS = 10 * 60 * 1000;

const ALLOWED_METHODS = ["GET", "POST", "PATCH", "DELETE"] as const;

const IS_DEV = process.env.NODE_ENV === "development";

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: { policy: "credentialless" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  xXssProtection: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

function getAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    return ["http://localhost:3000"];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS policy"));
  },
  methods: [...ALLOWED_METHODS],
  credentials: true,
  optionsSuccessStatus: 204,
});

export function corsMethodGuard(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.method === "OPTIONS") {
    next();
    return;
  }

  if (!ALLOWED_METHODS.includes(req.method as (typeof ALLOWED_METHODS)[number])) {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  next();
}

/**
 * Normalise the client IP so the key is always a non-empty string.
 * In development, Express may report "::1" (IPv6 loopback) or undefined
 * when trust proxy is off — we collapse both to "127.0.0.1".
 */
function normaliseIp(req: Request): string {
  const raw = req.ip ?? req.socket?.remoteAddress ?? "";
  if (!raw || raw === "::1" || raw === "::ffff:127.0.0.1") return "127.0.0.1";
  return raw;
}

export const generalRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
  },
});

export const forgotPasswordRateLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  // Production: 3 attempts/hour per IP+email. Development: 50 (effectively unlimited for testing).
  max: IS_DEV ? 50 : 3,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting entirely in development so testing is never blocked.
  skip: () => IS_DEV,
  keyGenerator: (req) => {
    const ip = normaliseIp(req);
    const email = (req.body?.email ?? "").toLowerCase().trim();
    return `fgpw-${ip}-${email}`;
  },
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many password reset requests. Please try again in an hour.",
  },
});

export const resetPasswordRateLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  max: IS_DEV ? 50 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => IS_DEV,
  keyGenerator: (req) => {
    const ip = normaliseIp(req);
    const email = (req.body?.email ?? "").toLowerCase().trim();
    return `rspw-${ip}-${email}`;
  },
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many reset attempts. Please try again in an hour.",
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: TEN_MINUTES_MS,
  max: IS_DEV ? 50 : 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => IS_DEV,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many OTP requests. Please wait before requesting again.",
  },
});

export function applySecurityMiddleware(app: Express): void {
  const trustProxy =
    process.env.TRUST_PROXY === "true" ||
    process.env.NODE_ENV === "production";
  app.set("trust proxy", trustProxy ? 1 : false);
  app.disable("x-powered-by");

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(corsMethodGuard);
}