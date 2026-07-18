import { Server } from "http";
import { app } from "./app.js";
import { connectDB, closeDB } from "./config/db.js";
import { env } from "./config/env.js";

let server: Server | null = null;

/**
 * Starts the HTTP server and establishes connection to the database.
 */
async function startServer() {
  try {
    // 1. Establish connection to MongoDB before mounting server
    console.log("[Server] Initializing database connection...");
    await connectDB();

    // 2. Bind port and start listening
    server = app.listen(env.PORT, () => {
      console.log(`[Server] StudyPilot AI Server is running on port ${env.PORT}`);
      console.log(`[Server] Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("[Server] Critical error during server startup:", error);
    process.exit(1);
  }
}

/**
 * Gracefully shuts down the HTTP server and database client.
 */
async function gracefulShutdown(signal: string) {
  console.log(`[Server] Received ${signal} signal. Commencing graceful teardown...`);
  
  if (server) {
    server.close(async (err) => {
      if (err) {
        console.error("[Server] Error closing HTTP server:", err);
      } else {
        console.log("[Server] HTTP server closed successfully.");
      }
      try {
        await closeDB();
        console.log("[Server] Teardown complete. Exiting.");
        process.exit(0);
      } catch (dbErr) {
        console.error("[Server] Failed to close database client safely:", dbErr);
        process.exit(1);
      }
    });
  } else {
    try {
      await closeDB();
      process.exit(0);
    } catch (dbErr) {
      process.exit(1);
    }
  }
}

// Hook lifecycle process listeners
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

startServer();

