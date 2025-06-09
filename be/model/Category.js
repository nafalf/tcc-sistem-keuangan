// model/Category.js

import { DataTypes } from "sequelize";
import { sequelize_mysql } from "../config/database.js";

const Category = sequelize_mysql.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jenis: {
      type: DataTypes.ENUM('pemasukan', 'pengeluaran'),
    },
    deskripsi: {
      type: DataTypes.STRING,
    }
  },
  {
    tableName: "categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Category;