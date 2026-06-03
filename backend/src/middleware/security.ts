import type { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TEN_MINUTES_MS = 10 * 60 * 1000;

const ALLOWED_METHODS = ["GET", "POST", "PATCH", "DELETE"] as const;

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
  max: process.env.NODE_ENV === "development" ? 50 : 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email ?? "").toLowerCase().trim();
    return `${req.ip}-${email}`;
  },
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many password reset requests. Please try again in an hour.",
  },
});

export const resetPasswordRateLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  max: process.env.NODE_ENV === "development" ? 50 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email ?? "").toLowerCase().trim();
    return `${req.ip}-${email}`;
  },
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many reset attempts. Please try again in an hour.",
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: TEN_MINUTES_MS,
  max: process.env.NODE_ENV === "development" ? 50 : 3,
  standardHeaders: true,
  legacyHeaders: false,
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