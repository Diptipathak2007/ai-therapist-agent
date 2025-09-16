// server.js - UPDATED VERSION
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

// Load environment variables FIRST - with explicit path
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// DEBUG: Check if environment variables are loaded
console.log("Environment variables check:");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? `Loaded (length: ${process.env.JWT_SECRET.length})` : "MISSING");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Loaded" : "MISSING");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");

// Then import other modules
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import { connectDB } from "./utils/db";
import inngest from "./inngest";
import { functions as inngestFunctions } from "./inngest/functions";

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.NEXT_PUBLIC_APP_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(morgan("dev"));

// Set content-type to JSON for all responses
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('Authorization:', req.headers.authorization ? 'Present' : 'Missing');
  next();
});

// Inngest endpoint
app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));

// Test route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    jwtConfigured: !!process.env.JWT_SECRET,
    dbConfigured: !!process.env.MONGODB_URI
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/activity", activityRouter);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();