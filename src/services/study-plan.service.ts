import { ObjectId } from "mongodb";
import type { WithId } from "mongodb";
import { db } from "../config/db.js";
import type { IStudyPlan } from "../models/study-plan.model.js";

const collection = db.collection<IStudyPlan>("study_plans");

export const studyPlanService = {
  /**
   * Creates a new study plan.
   */
  async create(userId: string, data: Partial<IStudyPlan>): Promise<IStudyPlan> {
    const newPlan: IStudyPlan = {
      userId,
      title: data.title || "",
      description: data.description || "",
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      topics: data.topics || [],
      tasks: data.tasks || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newPlan);
    return { ...newPlan, _id: result.insertedId };
  },

  /**
   * Retrieves all study plans belonging to the specified user.
   */
  async getAllForUser(userId: string): Promise<WithId<IStudyPlan>[]> {
    return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  },

  /**
   * Retrieves a single study plan by ID if it belongs to the user.
   */
  async getById(id: string, userId: string): Promise<WithId<IStudyPlan> | null> {
    if (!ObjectId.isValid(id)) return null;
    return collection.findOne({ _id: new ObjectId(id), userId });
  },

  /**
   * Updates an existing study plan belonging to the user.
   */
  async update(id: string, userId: string, data: Partial<IStudyPlan>): Promise<WithId<IStudyPlan> | null> {
    if (!ObjectId.isValid(id)) return null;

    const updateData: Partial<IStudyPlan> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : undefined;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : undefined;
    if (data.topics !== undefined) updateData.topics = data.topics;
    if (data.tasks !== undefined) updateData.tasks = data.tasks;

    updateData.updatedAt = new Date();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result;
  },

  /**
   * Deletes a study plan by ID if it belongs to the user.
   */
  async delete(id: string, userId: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId });
    return result.deletedCount > 0;
  },
};
