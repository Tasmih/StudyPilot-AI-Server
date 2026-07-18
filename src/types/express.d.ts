import "express";

declare global {
  namespace Express {
    interface Request {
      // Injected by our auth session verification middleware
      user?: any;
      session?: any;
    }
  }
}
