import redisClient from "../../config/redis.config";

export async function getOrSetCache<T>(
  key: string,
  ttl: number,
  fetchFunction: () => Promise<T>,
): Promise<T> {
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
    const data = await fetchFunction();
    await redisClient.setex(key, ttl, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error);
    return fetchFunction();
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Error invalidating cache for key ${key}:`, error);
  }
}

export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error(`Error invalidating cache for pattern ${pattern}:`, error);
  }
}

export async function getIdempotency<T>(key: string): Promise<T | null> {
  try {
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached) as T;
    return null;
  } catch (error) {
    console.error(`[Cache] Idempotency check failed for ${key}:`, error);
    return null;
  }
}

export async function setIdempotency<T>(
  key: string,
  data: T,
  ttl: number
): Promise<void> {
  try {
    await redisClient.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error(`[Cache] Idempotency set failed for ${key}:`, error);
  }
}


