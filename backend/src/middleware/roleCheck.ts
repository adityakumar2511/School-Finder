import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";
import { Errors } from "../utils/AppError";

// Ordered from least to most privileged — used for >= comparisons
const ADMIN_LEVEL_RANK: Record<string, number> = {
  READ_ONLY: 0,
  READ_WRITE: 1,
  FULL_ACCESS: 2,
};

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

/**
 * requireAdminLevel(level)
 *
 * Must be used AFTER requireRole("ADMIN") — it assumes req.user.role === "ADMIN".
 * Grants access if the user's adminAccessLevel rank >= the required level rank.
 *
 * Example:
 *   router.delete("/schools/:id", requireRole("ADMIN"), requireAdminLevel("FULL_ACCESS"), ...)
 *   router.patch("/schools/:id/approve", requireRole("ADMIN"), requireAdminLevel("READ_WRITE"), ...)
 */
export const requireAdminLevel = (minimumLevel: "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS") => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(Errors.Unauthorized("Authentication required"));
      return;
    }

    if (req.user.role !== "ADMIN") {
      next(Errors.Forbidden("Admin access required"));
      return;
    }

    const userLevel = req.user.adminAccessLevel;

    if (!userLevel || !(userLevel in ADMIN_LEVEL_RANK)) {
      // adminAccessLevel is null or unrecognized — deny
      next(Errors.Forbidden("Admin access level not assigned. Contact a FULL_ACCESS admin."));
      return;
    }

    const userRank = ADMIN_LEVEL_RANK[userLevel];
    const requiredRank = ADMIN_LEVEL_RANK[minimumLevel];

    if (userRank < requiredRank) {
      next(Errors.Forbidden(`This action requires ${minimumLevel} access or higher`));
      return;
    }

    next();
  };
};