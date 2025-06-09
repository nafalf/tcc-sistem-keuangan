// controller/UserController.js

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../model/User.js";
import Transaction from "../model/Transaction.js";
import Category from "../model/Category.js";
import Plan from "../model/Plan.js";
import { generateAccessToken, generateRefreshToken } from "../middleware/Auth.js";
// Perbaikan: Impor kedua koneksi database secara spesifik
import { sequelize_pg, sequelize_mysql } from "../config/database.js";

export const UserController = {
  register: async (req, res) => {
    try {
      const { name, email, gender, password } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Email sudah terdaftar",
        });
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // Membuat user di database PostgreSQL
      const user = await User.create({
        name,
        email,
        gender,
        password: hashedPassword,
      });

      // Membuat kategori default untuk user baru di database MySQL
      // (Asumsi ada tabel 'default_categories' di MySQL Anda)
      try {
        const [defaultCategories] = await sequelize_mysql.query(
          "SELECT name FROM default_categories"
        );
        for (const cat of defaultCategories) {
            await Category.create({
              name: cat.name,
              userId: user.id, // Menyimpan ID dari Postgres ke MySQL
            });
        }
      } catch (catError) {
         console.error("Warning: Gagal membuat kategori default. Pastikan tabel 'default_categories' ada di MySQL.", catError);
      }


      res.status(201).json({
        status: "success",
        message: "Registrasi berhasil",
        data: { id: user.id, name: user.name, email: user.email, gender: user.gender },
      });
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ status: "error", message: "Gagal melakukan registrasi" });
    }
  },

  login: async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: "error", message: "User tidak ditemukan" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ status: "error", message: "Password salah" });
        }

        const payload = { userId: user.id, name: user.name, email: user.email, gender: user.gender };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await user.update({ refresh_token: refreshToken });

        res.status(200).json({
            status: "success",
            message: "Login berhasil",
            data: { ...payload, accessToken, refreshToken },
        });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ status: "error", message: "Gagal melakukan login" });
    }
  },
  
  deleteAccount: async (req, res) => {
    const userId = req.user.userId;
    try {
      // 1. Hapus semua data terkait dari database MySQL
      await Transaction.destroy({ where: { userId } });
      await Plan.destroy({ where: { userId } });
      await Category.destroy({ where: { userId } });
      console.log(`Data MySQL untuk user ${userId} berhasil dihapus.`);

      // 2. Setelah itu, hapus data user dari database PostgreSQL
      const user = await User.findByPk(userId);
      if (user) {
        await user.destroy();
        console.log(`User ${userId} dari PostgreSQL berhasil dihapus.`);
      }

      res.status(200).json({
        status: "success",
        message: "Akun dan semua data terkait berhasil dihapus.",
      });
      
    } catch (error) {
      console.error("Error in deleteAccount:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal menghapus akun.",
        detail: error.message,
      });
    }
  },

  // ... (Sisa fungsi Anda seperti getProfile, updateProfile, logout, refreshToken bisa diletakkan di sini,
  //      karena mereka sebagian besar sudah benar hanya menggunakan model User) ...
  
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: ["id", "name", "email", "gender", "foto_profil"],
      });
      if (!user) {
        return res.status(404).json({ status: "error", message: "User tidak ditemukan" });
      }
      res.json({ status: "success", data: user });
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(500).json({ status: "error", message: "Gagal mengambil profil" });
    }
  },

  getProfilePhoto: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: ["foto_profil"],
      });

      if (!user || !user.foto_profil) {
        return res.status(404).json({
          status: "error",
          message: "Foto profil tidak ditemukan",
        });
      }

      // Mengirim gambar sebagai respons
      res.writeHead(200, {
        "Content-Type": "image/jpeg", // Asumsi format gambar jpeg
        "Content-Length": user.foto_profil.length,
      });
      res.end(user.foto_profil);

    } catch (error) {
      console.error("Error in getProfilePhoto:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal mengambil foto profil",
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, gender } = req.body;
      const updateData = {};
      if (name) updateData.name = name;
      if (gender) updateData.gender = gender;
      if (req.file) updateData.foto_profil = req.file.buffer;

      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ status: "error", message: "User tidak ditemukan" });
      }

      await user.update(updateData);
      const { id, email } = user;
      res.json({
        status: "success",
        message: "Profil berhasil diperbarui",
        data: { id, name: user.name, email, gender: user.gender },
      });
    } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(500).json({ status: "error", message: "Gagal memperbarui profil" });
    }
  },

  logout: async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User tidak ditemukan" });
        }
        await user.update({ refresh_token: null });
        res.status(200).json({ status: "success", message: "Logout berhasil" });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({ status: "error", message: "Gagal melakukan logout" });
    }
  },

  refreshToken: async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ status: "error", message: "Refresh token tidak disediakan" });
        }

        const user = await User.findOne({ where: { refresh_token: refreshToken } });
        if (!user) {
            return res.status(403).json({ status: "error", message: "Refresh token tidak valid" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err || user.id !== decoded.userId) {
                return res.status(403).json({ status: "error", message: "Refresh token tidak valid" });
            }
            const accessToken = generateAccessToken({ userId: user.id, name: user.name, email: user.email, gender: user.gender });
            res.json({ status: "success", accessToken });
        });
    } catch (error) {
        console.error("Error in refreshToken:", error);
        res.status(500).json({ status: "error", message: "Gagal me-refresh token" });
    }
  },
};