import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import User from "../model/User.js";
import Category from "../model/Category.js";
import Transaction from "../model/Transaction.js";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "moneytracker",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Define associations
User.hasMany(Transaction, { foreignKey: "userId" });
Category.hasMany(Transaction, { foreignKey: "categoryId" });

export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Sync database dengan force: false untuk menghindari penghapusan data
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
    throw error;
  }
};

export default sequelize;
