"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.js - UPDATED VERSION
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables FIRST - with explicit path
const envPath = path_1.default.resolve(process.cwd(), '.env');
dotenv_1.default.config({ path: envPath });
// DEBUG: Check if environment variables are loaded
console.log("Environment variables check:");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? `Loaded (length: ${process.env.JWT_SECRET.length})` : "MISSING");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Loaded" : "MISSING");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? `Loaded (length: ${process.env.GEMINI_API_KEY.length})` : "MISSING");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
// Then import other modules
const express_2 = require("inngest/express");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const mood_1 = __importDefault(require("./routes/mood"));
const activity_1 = __importDefault(require("./routes/activity"));
const db_1 = require("./utils/db");
const inngest_1 = __importDefault(require("./inngest"));
const functions_1 = require("./inngest/functions");
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            process.env.NEXT_PUBLIC_APP_URL
        ].filter(Boolean);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            console.log('CORS blocked for origin:', origin);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// Set content-type to JSON for all responses
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    console.log('Origin:', req.headers.origin);
    console.log('Authorization:', req.headers.authorization ? 'Present' : 'Missing');
    next();
});
// Inngest endpoint
app.use("/api/inngest", (0, express_2.serve)({ client: inngest_1.default, functions: functions_1.functions }));
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
app.use("/api/auth", auth_1.default);
app.use("/api/chat", chat_1.default);
app.use("/api/mood", mood_1.default);
app.use("/api/activity", activity_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
            logger_1.logger.info(`Health check: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map