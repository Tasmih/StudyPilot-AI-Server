import { Router } from "express";
import { getExploreCatalog, getExploreTemplateById } from "../controllers/explore-template.controller.js";

const exploreRouter = Router();

// Public endpoints (do not require authentication middleware)
exploreRouter.get("/", getExploreCatalog);
exploreRouter.get("/:id", getExploreTemplateById);

export default exploreRouter;
