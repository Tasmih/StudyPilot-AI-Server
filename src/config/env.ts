import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const requiredEnv = [
  "PORT",
  "MONGO_URI",
  "DB_NAME",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
] as const;

export const env = {
  PORT: process.env.PORT || "5000",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  DB_NAME: process.env.DB_NAME || "studypilot_ai",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "development-secret-key-must-be-at-least-32-characters",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  NODE_ENV: process.env.NODE_ENV || "development",
};

// Validate that required env variables are present
const isProduction = env.NODE_ENV === "production";
const missing: string[] = [];

for (const key of requiredEnv) {
  const value = env[key];
  if (!value) {
    if (isProduction || key === "BETTER_AUTH_SECRET") {
      missing.push(key);
    }
  }
}

if (missing.length > 0) {
  throw new Error(
    `Configuration Error: Missing required environment variables: ${missing.join(", ")}`
  );
}
