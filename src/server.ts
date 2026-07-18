import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

/**
 * Starts the HTTP server and establishes connection to the database.
 */
async function startServer() {
  try {
    // 1. Establish connection to MongoDB before mounting server
    console.log("[Server] Initializing database connection...");
    await connectDB();

    // 2. Bind port and start listening
    app.listen(env.PORT, () => {
      console.log(`[Server] StudyPilot AI Server is running on port ${env.PORT}`);
      console.log(`[Server] Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("[Server] Critical error during server startup:", error);
    process.exit(1);
  }
}

startServer();
