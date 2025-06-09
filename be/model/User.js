// model/User.js

import { DataTypes } from "sequelize";
// Perbaikan: Impor 'sequelize_pg' secara spesifik menggunakan {}
import { sequelize_pg } from "../config/database.js"; 

// Perbaikan: Gunakan 'sequelize_pg' untuk mendefinisikan model User
const User = sequelize_pg.define(
  "User",
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    foto_profil: {
      type: DataTypes.BLOB("medium"),
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default User;