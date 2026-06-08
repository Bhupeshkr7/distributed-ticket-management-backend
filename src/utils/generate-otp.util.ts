
import { randomInt } from "crypto";

export const generateOTP = (length: number = 6): string => {
  if (length <= 0) return "";

  let otp = "";
  for (let i = 0; i < length; i += 1) {
    otp += randomInt(0, 10).toString();
  }

  return otp;
};

export const verifyOTP = (inputOTP: string, actualOTP: string): boolean => {
  return inputOTP === actualOTP;
}
