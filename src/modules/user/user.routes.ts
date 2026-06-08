import { Router } from "express";
import {
  sendSignUpOtpController,
  resendSignUpOtpController,
  verifySignUpOtpController,
  loginController,
  sendForgotPasswordOtpController,
  resetPasswordController,
  getMeController,
  refreshTokenController,
  logoutController,
} from "./user.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";

export const userRouter = Router();

userRouter.post("/send-otp", sendSignUpOtpController);
userRouter.post("/resend-otp", resendSignUpOtpController);
userRouter.post("/verify-otp", verifySignUpOtpController);
userRouter.post("/login", loginController);
userRouter.post("/forgot-password", sendForgotPasswordOtpController);
userRouter.post("/reset-password", resetPasswordController);
userRouter.post("/refresh", refreshTokenController);
userRouter.post("/logout", authenticate, logoutController);
userRouter.get("/me", authenticate, getMeController);
