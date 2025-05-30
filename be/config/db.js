import sequelize from "./database.js";
import User from "../model/User.js";
import Category from "../model/Category.js";
import Transaction from "../model/Transaction.js";

// Define associations
User.hasMany(Transaction, { foreignKey: "userId" });
Category.hasMany(Transaction, { foreignKey: "categoryId" });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

export { syncDatabase };
