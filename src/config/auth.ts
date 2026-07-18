import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client, db } from "./db.js";
import { env } from "./env.js";

const hasGoogleAuth = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

if (!hasGoogleAuth && env.NODE_ENV === "production") {
  console.warn(
    "[Auth Warning] Google OAuth is not configured. Google sign-in will not be available."
  );
}

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  socialProviders: {
    ...(hasGoogleAuth && {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    }),
  },
});
