import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://diptipathak2007_db_user:dipti@therapy.vmw9qs6.mongodb.net/ai-therapy?retryWrites=true&w=majority&appName=therapy";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("✅ Connected to MongoDB");
  } catch (error) {
    logger.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
