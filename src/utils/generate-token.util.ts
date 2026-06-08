import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";
import { nanoid } from "nanoid";

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
  return nanoid(64);
}
