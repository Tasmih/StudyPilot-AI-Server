import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getRecommendations,
  refreshRecommendations,
} from "../controllers/recommendation.controller.js";

const recommendationRouter = Router();

// Secure all recommendation routes using the session verification middleware
recommendationRouter.use(requireAuth);

recommendationRouter.get("/", getRecommendations);
recommendationRouter.post("/refresh", refreshRecommendations);

export default recommendationRouter;
