import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "PORT",
  "MONGO_URI",
  "DB_NAME",
  "GEMINI_API_KEY",
  "AUTH_SERVER_URL",
] as const;


export const env = {
  PORT: process.env.PORT ?? "5000",

  MONGO_URI: process.env.MONGO_URI ?? "",

  DB_NAME: process.env.DB_NAME ?? "studypilot_ai",



  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY ?? "",

  NODE_ENV:
    process.env.NODE_ENV ?? "development",

  AUTH_SERVER_URL:
    process.env.AUTH_SERVER_URL ?? "",

  FRONTEND_URL:
    process.env.FRONTEND_URL ?? "http://localhost:3000",
};


// Validation
const missing: string[] = [];

for (const key of requiredEnv) {
  if (!env[key]) {
    missing.push(key);
  }
}


if (missing.length > 0) {
  throw new Error(
    `Missing environment variables: ${missing.join(", ")}`
  );
}