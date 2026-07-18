import type { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth.js";

/**
 * Middleware to require a valid session via Better Auth.
 * Automatically injects the user and session objects into req.user and req.session.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Unauthorized - No active session found.",
          statusCode: 401,
        },
      });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    next(error);
  }
}
