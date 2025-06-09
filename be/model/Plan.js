// model/Plan.js

import { DataTypes } from "sequelize";
// Perbaikan: Impor 'sequelize_mysql' secara spesifik menggunakan {}
import { sequelize_mysql } from "../config/database.js";

// Perbaikan: Gunakan 'sequelize_mysql' untuk mendefinisikan model
const Plan = sequelize_mysql.define(
  "Plan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "plans",
    timestamps: true,
  }
);

export default Plan;