import dns from "dns";

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

import { MongoClient, Db } from "mongodb";
import { env } from "./env.js";


export const client = new MongoClient(env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
});
export const db = client.db(env.DB_NAME);

/**
 * Initializes and connects to the MongoDB server.
 */
export async function connectDB(): Promise<Db> {
  try {
    await client.connect();
    console.log(`[Database] Successfully connected to MongoDB: ${env.DB_NAME}`);
    return db;
  } catch (error) {
    console.error("[Database] Error connecting to MongoDB:", error);
    throw error;
  }
}


/**
 * Closes the active MongoDB connection gracefully.
 */
export async function closeDB(): Promise<void> {
  if (client) {
    try {
      await client.close();
      console.log("[Database] Active MongoDB connection closed gracefully.");
    } catch (error) {
      console.error("[Database] Error closing MongoDB connection:", error);
      throw error;
    }
  }
}

