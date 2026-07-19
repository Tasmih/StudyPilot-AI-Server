import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import userRouter from "./user.routes.js";
import studyRouter from "./study-plan.routes.js";

const apiRouter = Router();

// Test protected authentication route
apiRouter.get("/auth-test", requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user",
    user: req.user,
  });
});

// Mount user routes
apiRouter.use("/users", userRouter);

// Mount study-plan routes
apiRouter.use("/study-plans", studyRouter);

export default apiRouter;
