import Redis, { RedisOptions } from 'ioredis';
import Logger from '../utils/logge.util';

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),

  connectTimeout: 5000,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    if (times >= 5) return null;
    return Math.min(times * 1000, 5000);
  }
}

export const redisClient = new Redis(redisOptions);
const logger = new Logger('RedisConfig');
redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});
redisClient.on('close', () => {
  logger.warn('Redis connection closed');
});

export default redisClient;

