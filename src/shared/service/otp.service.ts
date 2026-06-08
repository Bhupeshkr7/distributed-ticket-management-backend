import redisClient from "../../config/redis.config";


export const storeOtp = async (email: string, otp: string) => {
  const key = `otp:${email}`;
  await redisClient.set(key, otp, "EX", 300);
}

export const verifyOtp = async (email: string, otp: string) => {
  const key = `otp:${email}`;
  const storedOtp = await redisClient.get(key);
  if (storedOtp === otp) {
    await redisClient.del(key);
    return true;
  }
  return false;
}

export const deleteOtp = async (email: string) => {
  const key = `otp:${email}`;
  await redisClient.del(key);
}
