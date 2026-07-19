import { ObjectId } from "mongodb";

export interface IStudyPlan {
  _id?: ObjectId;
  userId: string; // Stored as a string representing user.id from Next.js Better Auth
  title: string;
  description?: string;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  topics?: string[];
  tasks?: IStudyPlanTask[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudyPlanTask {
  id: string;
  title: string;
  completed: boolean;
}
