// index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import UserRoute from "./route/UserRoute.js";
import TransactionRoute from "./route/TransactionRoute.js";
import CategoryRoute from "./route/CategoryRoute.js";
import PlanRoute from "./route/PlanRoute.js";
// Impor koneksi yang sudah diperbaiki dari file yang BENAR
import { sequelize_pg, sequelize_mysql } from "./config/database.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    "https://fe-projek-akhir-dot-b-08-450916.uc.r.appspot.com",
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", (req, res) => res.json({ message: "Server is running 🚀" }));
app.use("/api/user", UserRoute);
app.use("/api/transaction", TransactionRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/plan", PlanRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Coba konek ke kedua database
    await sequelize_pg.authenticate();
    console.log("PostgreSQL Database connected successfully.");
    await sequelize_mysql.authenticate();
    console.log("MySQL Database connected successfully.");

    // Sinkronisasi tabel (membuat tabel jika belum ada)
    await sequelize_pg.sync({ force: false });
    await sequelize_mysql.sync({ force: false });
    console.log("All tables have been synchronized.");

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Gagal memulai server:", error);
    process.exit(1);
  }
};

startServer();