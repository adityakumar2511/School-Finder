import { Request, Response, NextFunction } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export const JWT_ISSUER = "schoolfinder-api";
const JWT_ALGORITHM = "HS256" as const;

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

const tokenBlacklist = new Set<string>();

export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
}

function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new AppError(500, "Server authentication is not configured");
  }
  return secret;
}

export function signAccessToken(payload: {
  id: string;
  role: string;
  email: string;
}): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: jwtExpiresIn,
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
  });
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new AppError(401, "Authentication token is required"));
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    next(new AppError(401, "Authentication token must use Bearer scheme"));
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    next(new AppError(401, "Authentication token is required"));
    return;
  }

  if (token.split(".").length !== 3) {
    next(new AppError(401, "Malformed authentication token"));
    return;
  }

  if (isTokenBlacklisted(token)) {
    next(new AppError(401, "Authentication token has been revoked"));
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
    }) as {
      id: string;
      role: string;
      email: string;
    };

    if (!decoded.id || !decoded.role || !decoded.email) {
      next(new AppError(401, "Invalid authentication token"));
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, "Authentication token has expired"));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, "Invalid authentication token"));
      return;
    }

    if (error instanceof jwt.NotBeforeError) {
      next(new AppError(401, "Authentication token is not yet valid"));
      return;
    }

    next(new AppError(401, "Authentication failed"));
  }
};
