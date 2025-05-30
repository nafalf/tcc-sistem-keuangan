import jwt from "jsonwebtoken"; // Tambahkan impor ini
import bcrypt from "bcrypt";
import User from "../model/User.js";
import Transaction from "../model/Transaction.js";
import Category from "../model/Category.js";
import Plan from "../model/Plan.js"; // Impor model Plan
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middleware/Auth.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UserController = {
  register: async (req, res) => {
    try {
      const { name, email, gender, password } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Email sudah terdaftar",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        name,
        email,
        gender,
        password: hashedPassword,
      });

      res.status(201).json({
        status: "success",
        message: "Registrasi berhasil",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          gender: user.gender,
        },
      });
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal melakukan registrasi",
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      // Check password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log("Invalid password for email:", email);
        return res.status(400).json({
          status: "error",
          message: "Password salah",
        });
      }

      // Generate tokens
      const userId = user.id;
      const name = user.name;
      const userEmail = user.email;
      const gender = user.gender;

      const accessToken = generateAccessToken({
        userId,
        name,
        email: userEmail,
        gender,
      });
      const refreshToken = generateRefreshToken({
        userId,
        name,
        email: userEmail,
        gender,
      });

      console.log("Generated tokens for user:", userId);

      // Update refresh token in database
      await user.update({ refresh_token: refreshToken });
      console.log("Updated refresh token in database");

      const response = {
        status: "success",
        message: "Login berhasil",
        data: {
          id: userId,
          name,
          email: userEmail,
          gender,
          accessToken,
          refreshToken,
        },
      };

      console.log("Sending login response:", response);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal melakukan login",
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: ["id", "name", "email", "gender", "foto_profil"],
      });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal mengambil profil",
      });
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
          useDefault: true,
        });
      }

      res.writeHead(200, {
        "Content-Type": "image/jpeg",
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
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      await user.update(updateData);

      res.json({
        status: "success",
        message: "Profil berhasil diperbarui",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          gender: user.gender,
        },
      });
    } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal memperbarui profil",
      });
    }
  },

  logout: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      await user.update({ refresh_token: null });

      res.status(200).json({
        status: "success",
        message: "Logout berhasil",
      });
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal melakukan logout",
      });
    }
  },

  deleteAccount: async (req, res) => {
    const userId = req.user.userId; // Ambil userId dari token yang sudah diverifikasi

    try {
      // Hapus data terkait terlebih dahulu
      // 1. Hapus Plans
      await Plan.destroy({ where: { userId } });
      console.log(`Plans for user ${userId} deleted.`);

      // 2. Hapus Transactions
      await Transaction.destroy({ where: { userId } });
      console.log(`Transactions for user ${userId} deleted.`);

      // 3. Hapus Categories (Langkah ini dihilangkan karena tabel categories tidak memiliki kolom userId)
      //    Jika kategori bersifat user-specific dan memiliki foreign key ke user dengan nama kolom lain,
      //    baris ini perlu disesuaikan. Untuk saat ini, kita asumsikan kategori bersifat global atau
      //    tidak dihapus bersama user.
      console.log(`Skipping category deletion as 'userId' column is not present in categories table.`);

      // 4. Hapus User
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }
      await user.destroy();
      console.log(`User ${userId} deleted.`);

      res.status(200).json({
        status: "success",
        message: "Akun berhasil dihapus beserta data terkait.",
      });
    } catch (error) {
      console.error("Error in deleteAccount:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal menghapus akun.",
        detail: error.message, // Sertakan detail error untuk debugging
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({
          status: "error",
          message: "Refresh token tidak disediakan",
        });
      }

      // Cari user berdasarkan refresh token yang ada di database
      const user = await User.findOne({
        where: { refresh_token: refreshToken },
      });

      if (!user) {
        return res.status(403).json({
          status: "error",
          message: "Refresh token tidak valid atau tidak ditemukan di database",
        });
      }

      // Verifikasi refresh token (memastikan tidak kedaluwarsa dan signature benar)
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) {
            return res.status(403).json({
              status: "error",
              message: "Refresh token tidak valid atau kedaluwarsa",
              detail: err.message,
            });
          }

          // Pastikan user dari token cocok dengan user yang ditemukan di DB (opsional, tapi baik)
          if (decoded.userId !== user.id) {
            return res.status(403).json({
              status: "error",
              message: "Refresh token tidak cocok dengan pengguna",
            });
          }

          // Jika refresh token valid, buat access token baru
          const newAccessToken = generateAccessToken({
            userId: user.id,
            name: user.name,
            email: user.email,
            gender: user.gender,
          });

          res.json({
            status: "success",
            accessToken: newAccessToken,
          });
        }
      );
    } catch (error) {
      console.error("Error in refreshToken:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal me-refresh token",
      });
    }
  },
};
