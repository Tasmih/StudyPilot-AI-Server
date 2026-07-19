import { ObjectId } from "mongodb";

export interface IExploreTemplate {
  _id?: ObjectId | string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating: number;
  tasksCount: number;
  imageUrl?: string;
  createdAt: Date;
}
