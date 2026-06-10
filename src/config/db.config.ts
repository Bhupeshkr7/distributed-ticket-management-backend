import mongoose from "mongoose";
import Logger from "../utils/logge.util";

//fu5p8sOBZXDOSAfh
const logger = new Logger('DBConfig');
export const connectDB = async (mongoURI: string) => {
  try {
    await mongoose.connect(mongoURI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

