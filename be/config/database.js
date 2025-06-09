// config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// KONEKSI 1: POSTGRESQL (Untuk data User)
const sequelize_pg = new Sequelize(
  process.env.PG_DB_NAME,
  process.env.PG_DB_USERNAME,
  process.env.PG_DB_PASSWORD,
  {
    host: process.env.PG_DB_HOST,
    dialect: "postgres",
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  }
);

// KONEKSI 2: MYSQL (Untuk data Transaksi, Kategori, Rencana)
const sequelize_mysql = new Sequelize(
  process.env.MYSQL_DB_NAME,
  process.env.MYSQL_DB_USERNAME,
  process.env.MYSQL_DB_PASSWORD,
  {
    host: process.env.MYSQL_DB_HOST,
    dialect: "mysql",
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  }
);

export { sequelize_pg, sequelize_mysql };