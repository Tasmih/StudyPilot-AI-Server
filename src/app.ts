import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

import apiRouter from "./routes/index.js";

const app = express();

// Enable CORS with Credentials support (required for session cookies with Better Auth)
const allowedOrigins = ["http://localhost:3000"];
if (env.FRONTEND_URL && env.FRONTEND_URL !== "http://localhost:3000") {
  allowedOrigins.push(env.FRONTEND_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Better Auth routes are now handled by the Next.js frontend

// Body parsers - mounted AFTER the Better Auth endpoint to avoid body parsing conflicts
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "studypilot-ai-server",
    message: "StudyPilot AI Server is running",
  });
});

// Standard Health Check API
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "studypilot-ai-server",
    timestamp: new Date().toISOString(),
  });
});

// Mount main API router
app.use("/api", apiRouter);

// Centralized Global Error Handler - must be registered last
app.use(errorHandler);

export { app };
