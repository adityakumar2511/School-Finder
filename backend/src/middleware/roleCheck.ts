import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";
import { Errors } from "../utils/AppError";
import prisma from "../lib/prisma";

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

export const requireAdminLevel = (
  minimumLevel: "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS"
) => {
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
      next(
        Errors.Forbidden(
          "Admin access level not assigned. Contact a FULL_ACCESS admin."
        )
      );
      return;
    }
    if (ADMIN_LEVEL_RANK[userLevel] < ADMIN_LEVEL_RANK[minimumLevel]) {
      next(
        Errors.Forbidden(
          `This action requires ${minimumLevel} access or higher`
        )
      );
      return;
    }
    next();
  };
};

/**
 * blockIfSuperAdminTarget
 *
 * Use on any route that mutates a user (delete, role change, status change).
 * Fetches target user from DB and throws 403 if isSuperAdmin === true.
 * Always DB-checked — never trusts JWT payload.
 */
export const blockIfSuperAdminTarget = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetId = String(req.params.id).trim();
    if (!targetId) {
      next(Errors.BadRequest("Missing user id"));
      return;
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { isSuperAdmin: true },
    });

    if (!target) {
      // Let the controller handle 404 — not our concern here
      next();
      return;
    }

    if (target.isSuperAdmin) {
      next(
        Errors.Forbidden(
          "Super admin account cannot be modified or deleted"
        )
      );
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
};