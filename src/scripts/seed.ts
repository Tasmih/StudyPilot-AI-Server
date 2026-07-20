import fs from "fs";
import path from "path";
import { connectDB, closeDB, db } from "../config/db.js";

async function seed() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    const filePath = path.resolve("data/study-templates-100.json");
    if (!fs.existsSync(filePath)) {
      console.error(`Seed file not found at: ${filePath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const templates = JSON.parse(rawData);

    // Format fields (convert MongoDB $date structures if present)
    const formatted = templates.map((item: any, index: number) => {
      let createdAt = new Date();
      if (item.createdAt && typeof item.createdAt === "object" && "$date" in item.createdAt) {
        createdAt = new Date(item.createdAt.$date);
      } else if (item.createdAt) {
        createdAt = new Date(item.createdAt);
      }
      return {
        ...item,
        id: `tpl-${index + 1}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt,
      };
    });

    console.log(`Loaded ${formatted.length} templates. Seeding database...`);

    const collection = db.collection("explore_templates");
    
    // Clear existing templates to prevent duplicates on re-seed
    await collection.deleteMany({});
    
    const result = await collection.insertMany(formatted);
    console.log(`Successfully seeded ${result.insertedCount} templates into explore_templates collection.`);
  } catch (error) {
    console.error("Database seed error:", error);
  } finally {
    await closeDB();
  }
}

seed();
