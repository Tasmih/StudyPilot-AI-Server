import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

/**
 * requireAuth Middleware
 * Verifies the authenticated request by proxying the session cookie
 * back to the Next.js frontend.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authServerUrl = process.env.AUTH_SERVER_URL;
    if (!authServerUrl) {
      console.error("Auth Middleware Error: AUTH_SERVER_URL is missing from environment variables.");
      res.status(500).json({
        success: false,
        message: "Internal Server Error - Authentication configuration missing",
      });
      return;
    }

    const cookieHeader = req.headers.cookie;
    const authHeader = req.headers.authorization;

    if (!cookieHeader && !authHeader) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Missing authentication credentials",
      });
      return;
    }

    // Ask the Next.js Better Auth server to verify the session
    const response = await fetch(
      `${authServerUrl}/api/auth/get-session`,
      {
        headers: {
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
          ...(authHeader ? { authorization: authHeader } : {}),
        },
      }
    );

    if (!response.ok) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid session",
      });
      return;
    }

    const data = await response.json();

    if (!data || !data.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No active session found",
      });
      return;
    }

    // Attach authenticated user and session to Express request
    req.user = data.user;
    req.session = data.session;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error during authentication verification",
    });
  }
};