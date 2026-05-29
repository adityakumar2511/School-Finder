import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

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

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
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
