import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  updateStudyPlan,
  deleteStudyPlan,
} from "../controllers/study-plan.controller.js";

const studyRouter = Router();

// Apply requireAuth middleware to protect all study plan routes
studyRouter.use(requireAuth);

studyRouter.post("/", createStudyPlan);
studyRouter.get("/", getStudyPlans);
studyRouter.get("/:id", getStudyPlanById);
studyRouter.patch("/:id", updateStudyPlan);
studyRouter.delete("/:id", deleteStudyPlan);

export default studyRouter;
