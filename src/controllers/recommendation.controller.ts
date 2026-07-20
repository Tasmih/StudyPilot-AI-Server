import type { Request, Response } from "express";
import { studyPlanService } from "../services/study-plan.service.js";
import { recommendationService } from "../services/recommendation.service.js";
import type { IRecommendation } from "../models/recommendation.model.js";

/**
 * Helper function to call the Gemini API and structure/persist recommendations
 */
async function generateRecommendationsForUser(userId: string): Promise<IRecommendation | null> {
  const studyPlans = await studyPlanService.getAllForUser(userId);
  if (!studyPlans || studyPlans.length === 0) {
    return null;
  }

  // Format plans and tasks context for Gemini prompt
  const studyPlansText = studyPlans
    .map((plan, index) => {
      const totalTasks = plan.tasks?.length || 0;
      const completedTasks = plan.tasks?.filter((t) => t.completed).length || 0;
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const tasksList =
        plan.tasks?.map((t) => `- [${t.completed ? "x" : " "}] ${t.title}`).join("\n") || "No tasks";

      return `Plan #${index + 1}: ${plan.title}
Description: ${plan.description || "N/A"}
Topics: ${plan.topics?.join(", ") || "None"}
Start Date: ${plan.startDate ? new Date(plan.startDate).toLocaleDateString() : "N/A"}
End Date: ${plan.endDate ? new Date(plan.endDate).toLocaleDateString() : "N/A"}
Tasks Progress: ${percentage}% completed (${completedTasks}/${totalTasks} tasks)
Tasks Details:
${tasksList}`;
    })
    .join("\n---\n");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured on the server");
  }

  const prompt = `You are a highly personalized StudyPilot Academic Recommendation Engine.
Analyze the student's actual study plans and progress data to provide tailored recommendations.

Here is the student's study plan data:
------------------------------
${studyPlansText}
------------------------------

Instructions:
1. Review task completion rates: identify plans that are falling behind or have pending tasks.
2. Review topics: highlight priority topics or weak topics that have not been fully completed.
3. Recommend what the student should study next, revision priorities, and study habits based on their data.
4. Suggest realistic study actions (e.g. revisions, review sessions, practice quizzes) with reasonable estimated minutes (e.g. 30, 45, 60 minutes).
5. Address the student with encouraging, professional academic feedback.
6. Under no circumstances should you output any chain-of-thought text or markdown wrappers like \`\`\`json. Your output must be a single valid JSON object matching the schema below.

Required JSON Schema:
{
  "summary": "Short 2-3 sentence overview of the student's current study state, highlighting recent progress or urgent tasks.",
  "priorityTopics": [
    {
      "topic": "Name of the topic needing attention",
      "reason": "Specific reason referring to completed/incomplete tasks or deadlines",
      "priority": "high" | "medium" | "low"
    }
  ],
  "recommendedActions": [
    {
      "title": "Action title (e.g. 'Review Calculus Chain Rule')",
      "description": "Clear step-by-step recommendation on what to do",
      "type": "study" | "revision" | "practice" | "review",
      "estimatedMinutes": 30,
      "priority": "high" | "medium" | "low"
    }
  ],
  "studyStrategy": [
    "General strategy bullet point 1",
    "General strategy bullet point 2"
  ],
  "encouragement": "An encouraging statement to keep the student motivated."
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
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("[Recommendations] Gemini API error response:", errText);
    throw new Error(`AI Service Error: ${errText}`);
  }

  const resData = await response.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    console.error("[Recommendations] Gemini API returned empty content:", JSON.stringify(resData));
    throw new Error("AI Service returned empty content");
  }

  let cleanedText = rawText.trim();
  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "");
  }
  cleanedText = cleanedText.trim();

  let parsedData: any;
  try {
    parsedData = JSON.parse(cleanedText);
  } catch (err) {
    const startIdx = cleanedText.indexOf("{");
    const endIdx = cleanedText.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
        parsedData = JSON.parse(cleanedText.substring(startIdx, endIdx + 1));
      } catch (innerErr) {
        console.error("[Recommendations] Failed to parse extracted JSON block:", innerErr);
        throw new Error("AI response contains invalid JSON format");
      }
    } else {
      console.error("[Recommendations] JSON parsing failed and no enclosing braces found:", err);
      throw new Error("AI response could not be parsed as JSON");
    }
  }

  // Validation
  if (typeof parsedData.summary !== "string") {
    throw new Error("Invalid structure returned from AI (missing summary)");
  }

  // Save recommendations to database
  return await recommendationService.save(userId, parsedData);
}

/**
 * GET /api/recommendations
 * Retrieves existing user recommendations or generates them if not present.
 */
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized - Session not found" });
      return;
    }

    // Verify study plans presence
    const plans = await studyPlanService.getAllForUser(userId);
    if (!plans || plans.length === 0) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    // Check if recommendations already cached in MongoDB
    const existing = await recommendationService.getByUserId(userId);
    if (existing) {
      res.status(200).json({ success: true, data: existing });
      return;
    }

    // Generate if it is the user's first load
    const recommendations = await generateRecommendationsForUser(userId);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error("Get Recommendations Controller Error:", error);
    if (error.message && error.message.includes("AI Service")) {
      res.status(502).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
};

/**
 * POST /api/recommendations/refresh
 * Clears old recommendations and triggers fresh analysis.
 */
export const refreshRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized - Session not found" });
      return;
    }

    // Verify study plans presence
    const plans = await studyPlanService.getAllForUser(userId);
    if (!plans || plans.length === 0) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    // Always regenerate on manual refresh request
    const recommendations = await generateRecommendationsForUser(userId);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error("Refresh Recommendations Controller Error:", error);
    if (error.message && error.message.includes("AI Service")) {
      res.status(502).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
};
