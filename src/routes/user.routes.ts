import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

const userRouter = Router();

/**
 * GET /api/users/me
 * Protected endpoint returning the authenticated user profile.
 */
userRouter.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default userRouter;
