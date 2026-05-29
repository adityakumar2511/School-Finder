import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

type AttemptRecord = {
  failures: number;
  firstFailureAt: number;
  blockedUntil?: number;
};

const attempts = new Map<string, AttemptRecord>();

function cleanupExpired() {
  const now = Date.now();
  for (const [key, record] of attempts.entries()) {
    if (record.blockedUntil && record.blockedUntil <= now) {
      attempts.delete(key);
      continue;
    }
    if (!record.blockedUntil && now - record.firstFailureAt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

export function getClientKey(req: Request, email?: string): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : req.ip ?? "unknown";
  const normalizedEmail = email?.trim().toLowerCase() ?? "";
  return `${ip}:${normalizedEmail}`;
}

export function assertLoginAllowed(req: Request, email?: string): void {
  cleanupExpired();
  const key = getClientKey(req, email);
  const record = attempts.get(key);

  if (record?.blockedUntil && record.blockedUntil > Date.now()) {
    throw new AppError(429, "Too many login attempts. Please try again later.");
  }
}

export function recordFailedLogin(req: Request, email?: string): void {
  cleanupExpired();
  const key = getClientKey(req, email);
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || now - existing.firstFailureAt > WINDOW_MS) {
    attempts.set(key, { failures: 1, firstFailureAt: now });
    return;
  }

  const failures = existing.failures + 1;
  if (failures >= MAX_ATTEMPTS) {
    attempts.set(key, {
      failures,
      firstFailureAt: existing.firstFailureAt,
      blockedUntil: now + BLOCK_MS,
    });
    return;
  }

  attempts.set(key, {
    failures,
    firstFailureAt: existing.firstFailureAt,
  });
}

export function recordSuccessfulLogin(req: Request, email?: string): void {
  attempts.delete(getClientKey(req, email));
}

/** Pre-login guard for auth routes */
export function bruteForceGuard(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const email =
      typeof req.body?.email === "string" ? req.body.email : undefined;
    assertLoginAllowed(req, email);
    next();
  } catch (error) {
    next(error);
  }
}
