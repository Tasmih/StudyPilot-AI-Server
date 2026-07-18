import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Enable CORS with Credentials support (required for session cookies with Better Auth)
app.use(
  cors({
    origin: env.NODE_ENV === "production" ? false : true, // Adjust in production
    credentials: true,
  })
);

/**
 * Better Auth Route Handler Placeholder.
 * 
 * IMPORTANT: This must be mounted BEFORE any body parsers (like express.json())
 * because Better Auth needs to parse the raw body stream internally. If global body parsers 
 * consume the request stream first, client authentication requests will hang indefinitely.
 * 
 * Since we are on Express v5, wildcard paths must be named (e.g. *splat).
 */
app.all("/api/auth/*splat", (req, res) => {
  res.status(200).json({
    message: `StudyPilot AI - Better Auth handler placeholder. Route segment requested: ${req.params.splat}`,
  });
});

// Body parsers - mounted AFTER the Better Auth endpoint to avoid body parsing conflicts
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard Health Check API
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "studypilot-ai-server",
    timestamp: new Date().toISOString(),
  });
});

// Centralized Global Error Handler - must be registered last
app.use(errorHandler);

export { app };
