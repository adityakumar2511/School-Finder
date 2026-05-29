import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps async route handlers and forwards rejected promises to Express error middleware.
 */
export const asyncHandler = <TReq extends Request = Request>(
  fn: AsyncRequestHandler<TReq>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };
};
