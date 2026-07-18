import type { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
}

/**
 * Global centralized error handling middleware.
 */
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error to console (or external monitoring systems in production)
  console.error(`[Error] [${req.method} ${req.path}] - Status ${statusCode}:`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      // Only expose stack trace in non-production environments
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
}
