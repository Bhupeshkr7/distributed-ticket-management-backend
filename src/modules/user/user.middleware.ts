import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config";
import { CustomError } from "../../shared/error/custom.error";
import { AuthenticatedRequest } from "./user.interface";

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new CustomError("Unauthorized: No token provided", 401);
    }

    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
      id: string;
    };

    if (!decoded?.id) {
      throw new CustomError("Unauthorized: Invalid token", 401);
    }

    req.user = { id: decoded.id };

    next();
  } catch (error) {
    next(new CustomError("Unauthorized", 401));
  }
};
