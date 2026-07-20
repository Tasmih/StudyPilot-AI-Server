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

/**
 * POST /api/study-plans/generate
 * Agentic AI study plan builder using Gemini 1.5 Flash.
 * Analyzes constraints, priorities, learning style, and available hours.
 */
export const generateStudyPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const {
      subject,
      goal,
      skillLevel,
      examDate,
      dailyStudyTime,
      preferredStudyDays,
      weakTopics,
      strongTopics,
      preferredLearningStyle,
      additionalInstructions,
      planLength,
    } = req.body;

    // Input Validations
    if (!subject || typeof subject !== "string" || subject.trim() === "") {
      res.status(400).json({ success: false, message: "Subject is required and must be a valid string" });
      return;
    }
    if (!goal || typeof goal !== "string" || goal.trim() === "") {
      res.status(400).json({ success: false, message: "Goal is required and must be a valid string" });
      return;
    }
    if (!skillLevel || !["beginner", "intermediate", "advanced"].includes(skillLevel)) {
      res.status(400).json({ success: false, message: "Valid skillLevel (beginner, intermediate, advanced) is required" });
      return;
    }
    if (!examDate || isNaN(Date.parse(examDate))) {
      res.status(400).json({ success: false, message: "Valid examDate is required" });
      return;
    }
    if (typeof dailyStudyTime !== "number" || dailyStudyTime <= 0 || dailyStudyTime > 24) {
      res.status(400).json({ success: false, message: "Daily study hours must be a positive number between 1 and 24" });
      return;
    }

    const resolvedLength = planLength || "standard";
    const daysRemaining = Math.max(
      1,
      Math.ceil((Date.parse(examDate) - Date.now()) / (1000 * 60 * 60 * 24))
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, message: "Gemini AI API key is not configured on the server" });
      return;
    }

    // Agentic Prompt template enforcing structured output constraints and logical phases
    const prompt = `
You are an expert academic planner. You will generate a highly personalized study plan based on the following student inputs:
- Subject: ${subject}
- Goal: ${goal}
- Skill Level: ${skillLevel}
- Target Exam Date: ${examDate} (${daysRemaining} days remaining)
- Daily Study Time Capacity: ${dailyStudyTime} hours
- Preferred Study Days: ${preferredStudyDays ? preferredStudyDays.join(", ") : "Any days"}
- Weak Topics (focus heavily on these): ${weakTopics ? weakTopics.join(", ") : "None specified"}
- Strong Topics (can be covered faster): ${strongTopics ? strongTopics.join(", ") : "None specified"}
- Preferred Learning Style: ${preferredLearningStyle || "Standard visual/practical learning"}
- Additional Instructions: ${additionalInstructions || "None"}
- Requested Plan Length: ${resolvedLength} (adjust detail level: short, standard, detailed)

Agentic planning steps:
1. Analyze user constraints: There are ${daysRemaining} days remaining until target exam date.
2. Prioritize weak topics: Allocate more study tasks and active revision cycles for: ${weakTopics ? weakTopics.join(", ") : "None"}.
3. Distribute tasks according to daily study time (${dailyStudyTime} hours).
4. Organize into a phased roadmap. If planLength is 'short', generate exactly 2 phases. If 'standard', generate 3 phases. If 'detailed', generate 5 phases.
5. Provide a realistic suggested daily schedule routine list based on their learning style.
6. Provide a concrete revision strategy.

Ensure your output is a strictly formatted JSON object matching this schema. Do not output markdown wrappers like \`\`\`json:
{
  "roadmap": [
    {
      "phaseName": "Phase Name (e.g. Phase 1: Core Fundamentals)",
      "tasks": [
        {
          "id": "task-1",
          "title": "Task title",
          "description": "Concrete explanation of what to study and do",
          "estimatedHours": 4
        }
      ]
    }
  ],
  "dailySchedule": [
    "Specific routine instruction 1",
    "Specific routine instruction 2"
  ],
  "revisionStrategy": "Text detailing the revision intervals and active recall instructions"
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                roadmap: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      phaseName: { type: "STRING" },
                      tasks: {
                        type: "ARRAY",
                        items: {
                          type: "OBJECT",
                          properties: {
                            id: { type: "STRING" },
                            title: { type: "STRING" },
                            description: { type: "STRING" },
                            estimatedHours: { type: "INTEGER" }
                          },
                          required: ["id", "title", "description", "estimatedHours"]
                        }
                      }
                    },
                    required: ["phaseName", "tasks"]
                  }
                },
                dailySchedule: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                },
                revisionStrategy: { type: "STRING" }
              },
              required: ["roadmap", "dailySchedule", "revisionStrategy"]
            }
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Study Planner] Gemini API error response:", errorText);
      
      let parsedError: any = {};
      try {
        parsedError = JSON.parse(errorText);
      } catch {}

      res.status(502).json({
        success: false,
        message: "AI Planner service is temporarily unavailable",
        code: "AI_PROVIDER_ERROR",
        details: process.env.NODE_ENV === "development" ? parsedError : undefined
      });
      return;
    }

    const resData = await response.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error("[Study Planner] Gemini API returned empty response:", JSON.stringify(resData));
      res.status(502).json({
        success: false,
        message: "AI Planner service returned empty response",
        code: "AI_EMPTY_RESPONSE"
      });
      return;
    }

    let cleanedText = rawText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "");
    }
    cleanedText = cleanedText.trim();

    let parsedPlan: any;
    try {
      parsedPlan = JSON.parse(cleanedText);
    } catch (err: any) {
      const startIdx = cleanedText.indexOf("{");
      const endIdx = cleanedText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        try {
          parsedPlan = JSON.parse(cleanedText.substring(startIdx, endIdx + 1));
        } catch (innerErr: any) {
          console.error("[Study Planner] Failed to parse extracted JSON block:", innerErr);
          res.status(502).json({
            success: false,
            message: "AI response contains invalid JSON format",
            code: "AI_INVALID_JSON",
            details: process.env.NODE_ENV === "development" ? { error: innerErr.message, rawText } : undefined
          });
          return;
        }
      } else {
        console.error("[Study Planner] JSON parsing failed and no enclosing braces found:", err);
        res.status(502).json({
          success: false,
          message: "AI response could not be parsed as JSON",
          code: "AI_INVALID_JSON",
          details: process.env.NODE_ENV === "development" ? { error: err.message, rawText } : undefined
        });
        return;
      }
    }

    // Schema Validation
    if (!parsedPlan.roadmap || !Array.isArray(parsedPlan.roadmap)) {
      res.status(502).json({
        success: false,
        message: "AI response schema is invalid or missing roadmap components",
        code: "AI_INVALID_JSON",
        details: process.env.NODE_ENV === "development" ? { error: "Missing roadmap or roadmap is not an array", parsedPlan } : undefined
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: parsedPlan,
    });
  } catch (error) {
    console.error("AI Planner Generation Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during plan generation" });
  }
};
