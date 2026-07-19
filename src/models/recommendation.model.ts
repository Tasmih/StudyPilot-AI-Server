import { ObjectId } from "mongodb";

export interface IRecommendationAction {
  title: string;
  description: string;
  type: "study" | "revision" | "practice" | "review";
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
}

export interface IRecommendationTopic {
  topic: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface IRecommendation {
  _id?: ObjectId;
  userId: string;
  summary: string;
  priorityTopics: IRecommendationTopic[];
  recommendedActions: IRecommendationAction[];
  studyStrategy: string[];
  encouragement: string;
  generatedAt: Date;
}
