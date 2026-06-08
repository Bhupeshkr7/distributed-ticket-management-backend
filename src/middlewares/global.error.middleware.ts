import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.config";
import type { CustomError } from "../shared/error/custom.error";
import Logger from "../utils/logge.util";
const logger = new Logger("GlobalErrorMiddleware");
export const globalErrorMiddleware = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (env.APP_ENV === "development") {
    logger.error(error.message || "Unhandled error", error);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  res.status(statusCode).json({
    status: "error",
    message,
  });

};
