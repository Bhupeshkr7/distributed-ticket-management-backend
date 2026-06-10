import Redis, { RedisOptions } from 'ioredis';
import Logger from '../utils/logge.util';



const redisClient = new Redis("rediss://default:gQAAAAAAAjZFAAIgcDEzN2RlMzE2YTllZGU0MWUzYmUzNTM5NGIzMTdmNjM3ZQ@evident-mosquito-144965.upstash.io:6379", {
  connectTimeout: 5000,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    if (times >= 5) return null;
    return Math.min(times * 1000, 5000);
  }
});
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

