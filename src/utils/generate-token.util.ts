import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";
import crypto from "crypto";

export const generateAccessToken = (userId: string) => {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { userId },
    env.ACCESS_TOKEN_SECRET,
    options
  );
};

export const generateRefreshToken = () => {
  // 32 bytes = 64 hex characters, equivalent to nanoid(64)
  return crypto.randomBytes(32).toString('hex');
}
