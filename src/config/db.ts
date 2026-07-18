import { MongoClient, Db } from "mongodb";
import { env } from "./env.js";

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Initializes and connects to the MongoDB server.
 */
export async function connectDB(): Promise<Db> {
  if (db && client) {
    return db;
  }

  try {
    client = new MongoClient(env.MONGO_URI);
    await client.connect();
    db = client.db(env.DB_NAME);
    console.log(`[Database] Successfully connected to MongoDB: ${env.DB_NAME}`);
    return db;
  } catch (error) {
    console.error("[Database] Error connecting to MongoDB:", error);
    throw error;
  }
}

/**
 * Returns the connected Db instance. Throws an error if not connected yet.
 */
export function getDb(): Db {
  if (!db) {
    throw new Error("[Database] Database not initialized. Call connectDB() first.");
  }
  return db;
}

/**
 * Returns the MongoClient instance. Throws an error if not connected yet.
 */
export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error("[Database] MongoClient not initialized. Call connectDB() first.");
  }
  return client;
}
