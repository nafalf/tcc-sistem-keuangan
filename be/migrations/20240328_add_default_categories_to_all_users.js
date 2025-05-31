import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Daftar kategori default
const defaultCategories = [
  { name: "Hiburan", type: "expense" },
  { name: "Makanan", type: "expense" },
  { name: "Transportasi", type: "expense" },
  { name: "Investasi", type: "expense" },
  { name: "Gaji", type: "income" },
  { name: "Hadiah", type: "income" },
  { name: "Pakaian", type: "expense" },
  { name: "Kesehatan", type: "expense" },
];

export const up = async () => {
  try {
    // Dapatkan semua user yang ada
    const users = await sequelize.query("SELECT id FROM users", {
      type: sequelize.QueryTypes.SELECT,
    });

    // Untuk setiap user, tambahkan kategori default jika belum ada
    for (const user of users) {
      for (const category of defaultCategories) {
        try {
          // Cek apakah kategori sudah ada untuk user ini
          const existingCategory = await sequelize.query(
            `SELECT id FROM categories WHERE name = ? AND userId = ?`,
            {
              replacements: [category.name, user.id],
              type: sequelize.QueryTypes.SELECT,
            }
          );

          // Jika kategori belum ada, tambahkan
          if (existingCategory.length === 0) {
            await sequelize.query(
              `INSERT INTO categories (name, userId, created_at) VALUES (?, ?, NOW())`,
              {
                replacements: [category.name, user.id],
              }
            );
            console.log(`Added category ${category.name} for user ${user.id}`);
          } else {
            console.log(
              `Category ${category.name} already exists for user ${user.id}`
            );
          }
        } catch (error) {
          console.error(
            `Error adding category ${category.name} for user ${user.id}:`,
            error
          );
        }
      }
    }

    console.log("Default categories migration completed successfully");
  } catch (error) {
    console.error("Default categories migration failed:", error);
    throw error;
  }
};

export const down = async () => {
  try {
    // Hapus kategori default untuk semua user
    await sequelize.query(`
      DELETE FROM categories 
      WHERE name IN (
        'Hiburan', 'Makanan', 'Transportasi', 'Investasi',
        'Gaji', 'Hadiah', 'Pakaian', 'Kesehatan'
      )
    `);

    console.log("Default categories rollback completed successfully");
  } catch (error) {
    console.error("Default categories rollback failed:", error);
    throw error;
  }
};
