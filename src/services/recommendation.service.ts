import { db } from "../config/db.js";
import type { IRecommendation } from "../models/recommendation.model.js";

const collection = db.collection<IRecommendation>("recommendations");

export const recommendationService = {
  /**
   * Fetches the user's persisted recommendation details.
   */
  async getByUserId(userId: string): Promise<IRecommendation | null> {
    return collection.findOne({ userId });
  },

  /**
   * Saves or updates the user's recommendation results.
   */
  async save(userId: string, data: Partial<IRecommendation>): Promise<IRecommendation> {
    const record: Omit<IRecommendation, "_id"> = {
      userId,
      summary: data.summary || "",
      priorityTopics: data.priorityTopics || [],
      recommendedActions: data.recommendedActions || [],
      studyStrategy: data.studyStrategy || [],
      encouragement: data.encouragement || "",
      generatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { userId },
      { $set: record },
      { upsert: true, returnDocument: "after" }
    );

    return result!;
  },
};
