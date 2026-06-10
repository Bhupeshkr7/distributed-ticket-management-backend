import app from "./app";
import { connectDB } from "./config/db.config";
import { env } from "./config/env.config";
import redisClient from "./config/redis.config";

const startServer = async () => {
  try {
    await redisClient.ping();
    await connectDB(env.MONGO_URI);
    await app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
startServer();
