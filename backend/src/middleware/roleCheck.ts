import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";
import { Errors } from "../utils/AppError";

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(Errors.Unauthorized("Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(Errors.Forbidden("Access denied — insufficient permissions"));
      return;
    }

    next();
  };
};
