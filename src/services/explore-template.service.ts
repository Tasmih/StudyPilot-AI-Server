import { ObjectId } from "mongodb";
import { db } from "../config/db.js";
import type { IExploreTemplate } from "../models/explore-template.model.js";

const collection = db.collection<IExploreTemplate>("explore_templates");

export const exploreTemplateService = {
  /**
   * Fetch a single template by its MongoDB ObjectId.
   */
  async getById(id: string): Promise<IExploreTemplate | null> {
    const query: any = {
      $or: [
        { _id: id }
      ]
    };
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }
    return collection.findOne(query);
  },
  /**
   * Queries catalog templates using filters, search regex, sorting rules, and pagination.
   */
  async queryTemplates(params: {
    search?: string;
    category?: string;
    difficulty?: string;
    sort?: string;
    page: number;
    limit: number;
  }): Promise<{ data: IExploreTemplate[]; total: number }> {
    const { search, category, difficulty, sort, page, limit } = params;
    
    // Combine search and filter criteria using an $and array to prevent $or key collisions
    const conditions: any[] = [];

    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ]
      });
    }

    if (category) {
      conditions.push({ category });
    }

    if (difficulty) {
      conditions.push({
        $or: [
          { difficulty },
          { level: difficulty }
        ]
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    // Sorting configurations
    let sortQuery: any = { createdAt: -1 };
    if (sort === "oldest") {
      sortQuery = { createdAt: 1 };
    } else if (sort === "highest-rating") {
      sortQuery = { rating: -1 };
    } else if (sort === "most-tasks") {
      // Sort by both fields desc for legacy database schemas support
      sortQuery = { tasksCount: -1, tasks: -1 };
    }

    const skip = (page - 1) * limit;
    
    // Perform operations in parallel
    const [total, data] = await Promise.all([
      collection.countDocuments(query),
      collection.find(query).sort(sortQuery).skip(skip).limit(limit).toArray(),
    ]);

    return { data, total };
  },
};
