import redisClient from "../../config/redis.config";
// Lua script to safely release a lock only if the ownerId matches

const releaseLockScript = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export async function acquireLock(
  key: string,
  ownerId: string,
  ttl: number
): Promise<boolean> {
  try {
    const result = await redisClient.set(key, ownerId, "EX", ttl, "NX");
    return result === "OK";
  } catch (error) {
    console.error(`[Lock] Failed to acquire lock for ${key}:`, error);
    return false;
  }
}

export async function releaseLock(key: string, ownerId: string): Promise<void> {
  try {
    await redisClient.eval(releaseLockScript, 1, key, ownerId);
  } catch (error) {
    console.error(`[Lock] Failed to release lock for ${key}:`, error);
  }
}
