import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import userRouter from "./user.routes.js";
import studyRouter from "./study-plan.routes.js";
import conversationRouter from "./conversation.routes.js";
import recommendationRouter from "./recommendation.routes.js";
import exploreRouter from "./explore-template.routes.js";

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

// Mount AI conversation routes
apiRouter.use("/ai/conversations", conversationRouter);

// Mount Adaptive AI Recommendations routes
apiRouter.use("/recommendations", recommendationRouter);

// Mount public explore catalog routes
apiRouter.use("/explore", exploreRouter);

// Mount public support routes
import supportRouter from "./support.routes.js";
apiRouter.use("/support", supportRouter);

export default apiRouter;
