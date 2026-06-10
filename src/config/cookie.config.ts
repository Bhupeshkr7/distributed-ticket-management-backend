export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
