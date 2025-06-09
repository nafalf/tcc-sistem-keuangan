// model/Transaction.js

import { DataTypes } from "sequelize"; // Perbaikan 1
import { sequelize_mysql } from "../config/database.js"; // Perbaikan 2

const Transaction = sequelize_mysql.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("income", "expense"),
      allowNull: false,
    },
    // Perbaikan 3: 'references' ke User dihapus
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Perbaikan 3: 'references' ke Category dihapus
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Perbaikan 4: Tidak ada asosiasi di sini

export default Transaction;