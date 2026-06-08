import { env } from "./env.config";

export const cookieOptions = {
  httpOnly: true,
  secure: env.APP_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

