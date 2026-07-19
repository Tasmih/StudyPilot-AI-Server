import type { Request, Response } from "express";
import { studyPlanService } from "../services/study-plan.service.js";

/**
 * POST /api/study-plans
 * Creates a new study plan owned by the authenticated user.
 */
export const createStudyPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized - User session not found" });
      return;
    }

    const { title, description, startDate, endDate, topics, tasks } = req.body;

    // Validation
    if (!title || typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ success: false, message: "Title is required and must be a non-empty string" });
      return;
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      res.status(400).json({ success: false, message: "Invalid start date format" });
      return;
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      res.status(400).json({ success: false, message: "Invalid end date format" });
      return;
    }

    if (topics && !Array.isArray(topics)) {
      res.status(400).json({ success: false, message: "Topics must be an array of strings" });
      return;
    }

    if (tasks && !Array.isArray(tasks)) {
      res.status(400).json({ success: false, message: "Tasks must be an array" });
      return;
    }

    const plan = await studyPlanService.create(userId, {
      title,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      topics,
      tasks,
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Create StudyPlan Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/study-plans
 * Retrieves all study plans owned by the authenticated user.
 */
export const getStudyPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized - User session not found" });
      return;
    }

    const plans = await studyPlanService.getAllForUser(userId);
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Get StudyPlans Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/study-plans/:id
 * Retrieves a single study plan by ID if owned by the user.
 */
export const getStudyPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (typeof id !== "string") {
      res.status(400).json({ success: false, message: "Invalid ID parameter" });
      return;
    }

    const plan = await studyPlanService.getById(id, userId);
    if (!plan) {
      res.status(404).json({ success: false, message: "Study plan not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Get StudyPlan By Id Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PATCH /api/study-plans/:id
 * Updates specified fields of a study plan by ID if owned by the user.
 */
export const updateStudyPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (typeof id !== "string") {
      res.status(400).json({ success: false, message: "Invalid ID parameter" });
      return;
    }

    const { title, description, startDate, endDate, topics, tasks } = req.body;

    // Validation
    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      res.status(400).json({ success: false, message: "Title must be a non-empty string" });
      return;
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      res.status(400).json({ success: false, message: "Invalid start date format" });
      return;
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      res.status(400).json({ success: false, message: "Invalid end date format" });
      return;
    }

    if (topics !== undefined && !Array.isArray(topics)) {
      res.status(400).json({ success: false, message: "Topics must be an array of strings" });
      return;
    }

    if (tasks !== undefined && !Array.isArray(tasks)) {
      res.status(400).json({ success: false, message: "Tasks must be an array" });
      return;
    }

    const updatedPlan = await studyPlanService.update(id, userId, {
      title,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      topics,
      tasks,
    });

    if (!updatedPlan) {
      res.status(404).json({ success: false, message: "Study plan not found or not owned by user" });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Update StudyPlan Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/study-plans/:id
 * Deletes a study plan by ID if owned by the user.
 */
export const deleteStudyPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (typeof id !== "string") {
      res.status(400).json({ success: false, message: "Invalid ID parameter" });
      return;
    }

    const deleted = await studyPlanService.delete(id, userId);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Study plan not found or not owned by user" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Study plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete StudyPlan Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
