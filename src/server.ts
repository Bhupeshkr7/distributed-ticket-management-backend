import app from "./app";
import { connectDB } from "./config/db.config";
import { env } from "./config/env.config";
import redisClient from "./config/redis.config";

const startServer = async () => {
  try {
    await redisClient.ping();
    await connectDB("mongodb+srv://bkbhaskar858186_db_user:fu5p8sOBZXDOSAfh@cluster0.ip3uyvj.mongodb.net/");
    await app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
startServer();
