import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../shared/error/custom.error";
import { env } from "../config/env.config";
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new CustomError("Unauthorized", 401);

    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as { userId: string };
    req.user = { id: payload.userId };

    next();
  } catch (error) {
    if (error instanceof CustomError) return next(error);
    next(new CustomError("Unauthorized", 401));
  }
};
