import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { tokenBlacklist } from "../lib/tokenBlacklist";
import { AppError, Errors } from "../utils/AppError";
import { getUserTokenVersion } from "../lib/auth-helpers";

export const JWT_ISSUER = "schoolfinder-api";
const JWT_ALGORITHM = "HS256" as const;

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    adminAccessLevel?: string | null; // Phase E — present only for ADMIN role
  };
}

type AccessTokenPayload = {
  id: string;
  role: string;
  email: string;
  adminAccessLevel?: string | null; // Phase E
  tokenVersion?: number; // forces re-login when incremented server-side
  jti?: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new AppError("Server authentication is not configured", 500, "INTERNAL_ERROR");
  }
  return secret;
}

export function signAccessToken(payload: {
  id: string;
  role: string;
  email: string;
  adminAccessLevel?: string | null; // Phase E — pass only for ADMIN
  tokenVersion?: number; // pass current User.tokenVersion at issue time
}): string {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
    },
    getJwtSecret(),
    {
      expiresIn: jwtExpiresIn,
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
    }
  );
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(Errors.Unauthorized("Authentication token is required"));
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    next(Errors.Unauthorized("Authentication token must use Bearer scheme"));
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    next(Errors.Unauthorized("Authentication token is required"));
    return;
  }

  if (token.split(".").length !== 3) {
    next(Errors.Unauthorized("Malformed authentication token"));
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
    }) as AccessTokenPayload;

    if (decoded.jti && tokenBlacklist.has(decoded.jti)) {
      next(Errors.InvalidToken());
      return;
    }

    if (!decoded.id || !decoded.role || !decoded.email) {
      next(Errors.InvalidToken());
      return;
    }

    // tokenVersion check — DB source of truth. If an admin changes this
    // user's email/password, tokenVersion is bumped and every existing
    // token (regardless of device/session) becomes invalid immediately.
    const currentTokenVersion = await getUserTokenVersion(decoded.id);

    if (currentTokenVersion === null) {
      next(Errors.InvalidToken());
      return;
    }

    if ((decoded.tokenVersion ?? 0) !== currentTokenVersion) {
      next(Errors.InvalidToken());
      return;
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      adminAccessLevel: decoded.adminAccessLevel ?? null, // Phase E
    };
    next();
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.NotBeforeError
    ) {
      next(Errors.InvalidToken());
      return;
    }

    next(Errors.Unauthorized("Authentication failed"));
  }
};