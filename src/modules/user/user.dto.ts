import { z } from "zod";

export const sendSignUpOtpDTO = z.object({
  email: z.string().email("Invalid email address"),
});

export const signupUserDTO = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
});

export const loginUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const forgotPasswordOtpDTO = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordDTO = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
  newPassword: z.string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[^a-z0-9]/, "Include at least one special character"),
});

export const updateUserDTO = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

export type SendSignUpOtpDTO = z.infer<typeof sendSignUpOtpDTO>;
export type SignupUserDTO = z.infer<typeof signupUserDTO>;
export type LoginUserDTO = z.infer<typeof loginUserDTO>;
export type ForgotPasswordOtpDTO = z.infer<typeof forgotPasswordOtpDTO>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordDTO>;
export type UpdateUserDTO = z.infer<typeof updateUserDTO>;
