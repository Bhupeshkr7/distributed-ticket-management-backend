import { Request, Response, NextFunction } from "express";
import * as service from "./user.service";
import { cookieOptions } from "../../config/cookie.config";
import { generateAccessToken } from "../../utils/generate-token.util";
import { parseDuration } from "../../utils/parse-duration.util";
import { env } from "../../config/env.config";
import { CustomError } from "../../shared/error/custom.error";

const attachAuthCookies = (res: Response, userId: string, refreshToken: string) => {
  const accessToken = generateAccessToken(userId);
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: parseDuration(env.ACCESS_TOKEN_EXPIRES_IN),
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: parseDuration(env.REFRESH_TOKEN_EXPIRES_IN),
  });
};

export const sendSignUpOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.sendSignUpOtp(req.body);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const resendSignUpOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.resendSignUpOtp(req.body);
    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    next(error);
  }
};

export const verifySignUpOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, refreshToken } = await service.verifySignUpOtp(req.body);
    attachAuthCookies(res, user._id.toString(), refreshToken);
    user.password = undefined as any;
    user.refreshToken = undefined as any;
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, refreshToken } = await service.loginUser(req.body);
    attachAuthCookies(res, user._id.toString(), refreshToken);
    user.password = undefined as any;
    user.refreshToken = undefined as any;
    res.status(200).json({ message: "Logged in successfully", user });
  } catch (error) {
    next(error);
  }
};

export const sendForgotPasswordOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.sendForgotPasswordOtp(req.body);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.resetPassword(req.body);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.getMe(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new CustomError("No refresh token", 401);

    const user = await service.refreshAccessToken(refreshToken);
    const accessToken = generateAccessToken(user._id.toString());

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: parseDuration(env.ACCESS_TOKEN_EXPIRES_IN),
    });

    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) await service.logoutUser(refreshToken);

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
