import { up as addDefaultCategories } from "../migrations/20240327_add_default_categories.js";

const runMigrations = async () => {
  try {
    console.log("Running migrations...");
    await addDefaultCategories();
    console.log("Migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigrations();
