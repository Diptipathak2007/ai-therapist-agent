import express, { Request, Response } from "express";
import { serve } from "inngest/express";
import  inngest  from "./inngest/index";              // ✅ named import
import { functions as inngestFunctions } from "./inngest/functions"; // ✅ fixed path
import { logger } from "./utils/logger";
import { connectDB } from "./utils/db";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from backend");
});
// ✅ Correct Inngest serve usage
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: inngestFunctions,
  })
);

const startServer = async () => {
  try {
    await connectDB(); // Ensure DB connection before starting server
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(
        `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
