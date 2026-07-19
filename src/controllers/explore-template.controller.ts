import { ObjectId } from "mongodb";
import type { Request, Response } from "express";
import { exploreTemplateService } from "../services/explore-template.service.js";

/**
 * Normalization helper to map MongoDB records to a standard response structure.
 * Supports fallback fields to handle mismatch schemas.
 */
export function mapTemplateToResponse(doc: any) {
  if (!doc) return doc;

  const id = doc._id instanceof ObjectId ? doc._id.toString() : String(doc._id || "");
  
  // Property key mapping fallbacks
  const title = doc.title || "";
  const description = doc.description || "";
  const category = doc.category || "";
  const difficulty = doc.difficulty || doc.level || "Beginner";
  const duration = doc.duration || "";
  const rating = typeof doc.rating === "number" ? doc.rating : 0;
  
  const tasksCount = doc.tasksCount !== undefined 
    ? doc.tasksCount 
    : (doc.tasks !== undefined ? doc.tasks : 0);
     
  const imageUrl = doc.imageUrl || doc.image || "";
  
  const createdAt = doc.createdAt 
    ? (doc.createdAt.$date ? doc.createdAt.$date : doc.createdAt) 
    : new Date().toISOString();

  return {
    id,
    title,
    description,
    category,
    difficulty,
    duration,
    rating,
    tasksCount,
    imageUrl,
    createdAt
  };
}

/**
 * GET /api/explore
 * Public API to fetch list of course templates.
 * Supports search query, double filters, sorting, and pagination boundaries.
 */
export const getExploreCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty.trim() : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort.trim() : "newest";

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(100, parseInt(req.query.limit as string) || 12); // Prevent abuse by capping at 100

    if (page < 1) {
      res.status(400).json({ success: false, message: "Page number must be 1 or greater" });
      return;
    }

    if (limit < 1) {
      res.status(400).json({ success: false, message: "Limit must be 1 or greater" });
      return;
    }

    // Development logging (only in development environment)
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.log(`[Explore Controller] GET /api/explore - Page: ${page}, Limit: ${limit}`);
      console.log(`[Explore Controller] Collection: explore_templates`);
      console.log(`[Explore Controller] Params - Search: "${search}", Category: "${category}", Difficulty: "${difficulty}", Sort: "${sort}"`);
    }

    const { data, total } = await exploreTemplateService.queryTemplates({
      search,
      category,
      difficulty,
      sort,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);

    // Normalize each record
    const formattedData = data.map(mapTemplateToResponse);

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get Explore Catalog Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/explore/:id
 * Public API to fetch a single template by ID.
 * Returns 404 if not found or if the ID is invalid.
 */
export const getExploreTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ success: false, message: "Template ID is required" });
      return;
    }

    // Development logging
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.log(`[Explore Controller] GET /api/explore/:id - Requested ID: "${id}"`);
      console.log(`[Explore Controller] Collection: explore_templates`);
      console.log(`[Explore Controller] Query: { _id: "${id}" } or { _id: ObjectId("${id}") }`);
    }

    const template = await exploreTemplateService.getById(id);

    if (isDev) {
      console.log(`[Explore Controller] Document found: ${!!template}`);
    }

    if (!template) {
      res.status(404).json({ success: false, message: "Study template not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: mapTemplateToResponse(template)
    });
  } catch (error) {
    console.error("Get Explore Template By ID Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
