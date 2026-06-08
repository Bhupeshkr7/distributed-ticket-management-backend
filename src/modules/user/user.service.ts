import bcrypt from "bcrypt";
import { env } from "../../config/env.config";
import { CustomError } from "../../shared/error/custom.error";
import { sendMail } from "../../shared/service/mail.service";
import { storeOtp, verifyOtp } from "../../shared/service/otp.service";
import { generateOTP } from "../../utils/generate-otp.util";
import { generateRefreshToken } from "../../utils/generate-token.util";
import { parseDuration } from "../../utils/parse-duration.util";
import { getOrSetCache, invalidateCache } from "../../utils/redis/redis.cache";
import { CacheKeys, CacheTTL } from "../../utils/redis/redis.keys";
import Logger from "../../utils/logge.util";
import {
  ForgotPasswordOtpDTO,
  LoginUserDTO,
  ResetPasswordDTO,
  SendSignUpOtpDTO,
  SignupUserDTO,
} from "./user.dto";
import { UserModel } from "./user.model";

const logger = new Logger("UserService");

const sendOtpMail = async (email: string, otp: string, subject: string, context: string) => {
  await sendMail({
    to: email,
    subject,
    html: `<p>Your OTP to ${context} is: <strong>${otp}</strong></p><p>Valid for 5 minutes.</p>`,
  });
};

export const sendSignUpOtp = async (data: SendSignUpOtpDTO) => {
  const user = await UserModel.findOne({ email: data.email }).lean();
  if (user) throw new CustomError("User with this email already exists", 400);

  const otp = generateOTP();
  await storeOtp(data.email, otp);
  await sendOtpMail(data.email, otp, "Your OTP for Sign Up", "sign up");
};

export const resendSignUpOtp = async (data: SendSignUpOtpDTO) => {
  const user = await UserModel.findOne({ email: data.email }).lean();
  if (user) throw new CustomError("User with this email already exists", 400);

  const otp = generateOTP();
  await storeOtp(data.email, otp);
  await sendOtpMail(data.email, otp, "Your OTP for Sign Up", "sign up");
};

export const verifySignUpOtp = async (data: SignupUserDTO) => {
  const { otp, ...userData } = data;

  const isValidOtp = await verifyOtp(userData.email, otp);
  if (!isValidOtp) throw new CustomError("Invalid or expired OTP", 400);

  try {
    const user = await UserModel.create(userData);
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    user.expiresAt = new Date(Date.now() + parseDuration(env.REFRESH_TOKEN_EXPIRES_IN));
    await user.save();
    return { user, refreshToken };
  } catch (error: any) {
    if (error.code === 11000) throw new CustomError("User with this email already exists", 400);
    throw error;
  }
};

export const loginUser = async (data: LoginUserDTO) => {
  const user = await UserModel.findOne({ email: data.email }).select("+password");
  if (!user) throw new CustomError("Invalid email or password", 401);

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new CustomError("Invalid email or password", 401);

  const refreshToken = generateRefreshToken();
  user.refreshToken = refreshToken;
  user.expiresAt = new Date(Date.now() + parseDuration(env.REFRESH_TOKEN_EXPIRES_IN));
  await user.save();

  await invalidateCache(CacheKeys.userDetail(user._id.toString()));

  return { user, refreshToken };
};

export const sendForgotPasswordOtp = async (data: ForgotPasswordOtpDTO) => {
  const user = await UserModel.findOne({ email: data.email }).lean();
  if (!user) throw new CustomError("No account found with this email", 404);

  const otp = generateOTP();
  await storeOtp(data.email, otp);
  await sendOtpMail(data.email, otp, "Your OTP for Password Reset", "reset your password");
};

export const resetPassword = async (data: ResetPasswordDTO) => {
  const isValidOtp = await verifyOtp(data.email, data.otp);
  if (!isValidOtp) throw new CustomError("Invalid or expired OTP", 400);

  const user = await UserModel.findOne({ email: data.email });
  if (!user) throw new CustomError("No account found with this email", 404);

  user.password = data.newPassword;
  await user.save();

  await invalidateCache(CacheKeys.userDetail(user._id.toString()));
};

export const getMe = async (userId: string) => {
  const key = CacheKeys.userDetail(userId);
  return await getOrSetCache(key, CacheTTL.USER_DETAIL, async () => {
    const user = await UserModel.findById(userId).select("-password -refreshToken -expiresAt").lean();
    if (!user) throw new CustomError("User not found", 404);
    return user;
  });
};
export const refreshAccessToken = async (refreshToken: string) => {
  const user = await UserModel.findOne({ refreshToken });
  if (!user) throw new CustomError("Invalid refresh token", 401);
  if (!user.expiresAt || user.expiresAt < new Date()) {
    throw new CustomError("Refresh token expired, please login again", 401);
  }
  return user;
};
export const logoutUser = async (refreshToken: string) => {
  const user = await UserModel.findOneAndUpdate(
    { refreshToken },
    { refreshToken: null, expiresAt: null }
  ).lean();
  
  if (user) {
    await invalidateCache(CacheKeys.userDetail(user._id.toString()));
  }
};
