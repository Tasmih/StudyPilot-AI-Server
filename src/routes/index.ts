import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import userRouter from "./user.routes.js";

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

// Placeholders for future endpoint routers:
// apiRouter.use("/study", studyRouter);

export default apiRouter;
