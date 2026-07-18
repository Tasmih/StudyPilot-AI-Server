import type { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware placeholder.
 * This will validate Better Auth sessions in the next implementation phase.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Placeholder implementation: Allow all requests for now.
  //
  // In the next phase, we will implement this as:
  // try {
  //   const session = await auth.api.getSession({ headers: req.headers });
  //   if (!session) {
  //     return res.status(401).json({ error: "Unauthorized - Session invalid or expired" });
  //   }
  //   req.user = session.user;
  //   req.session = session.session;
  //   next();
  // } catch (error) {
  //   next(error);
  // }

  console.log("[Auth Middleware] requireAuth placeholder executed (Access granted)");
  next();
}
