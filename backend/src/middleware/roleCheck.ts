import { NextFunction, Response } from "express";

import { AuthRequest } from "./auth";

import { AppError } from "../utils/AppError";



export const requireRole = (...roles: string[]) => {

  return (req: AuthRequest, _res: Response, next: NextFunction): void => {

    if (!req.user) {

      next(new AppError(401, "Authentication required"));

      return;

    }



    if (!roles.includes(req.user.role)) {

      next(new AppError(403, "Access denied — insufficient permissions"));

      return;

    }



    next();

  };

};

