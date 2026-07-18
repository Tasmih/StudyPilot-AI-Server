import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client, db } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
});
