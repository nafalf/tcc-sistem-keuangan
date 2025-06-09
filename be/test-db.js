// test-db.js

import pg from 'pg';
import dotenv from 'dotenv';

// Muat variabel dari file .env
dotenv.config();

console.log('Mencoba menghubungkan ke PostgreSQL...');
console.log('Host:', process.env.PG_DB_HOST);
console.log('User:', process.env.PG_DB_USERNAME);
console.log('Database:', process.env.PG_DB_NAME);
console.log('Password:', process.env.PG_DB_PASSWORD ? '****' : '(kosong)');

// Buat instance client baru dari 'pg', driver yang sama yang digunakan Sequelize
const { Client } = pg;
const client = new Client({
  host: process.env.PG_DB_HOST,
  port: 5432,
  user: process.env.PG_DB_USERNAME,
  password: process.env.PG_DB_PASSWORD,
  database: process.env.PG_DB_NAME,
});

async function testConnection() {
  try {
    // Coba hubungkan
    await client.connect();
    // Jika berhasil, cetak pesan sukses
    console.log('==============================================');
    console.log('✅ SUKSES! Koneksi langsung ke PostgreSQL berhasil.');
    console.log('==============================================');
  } catch (err) {
    // Jika gagal, cetak pesan error
    console.error('======================================================');
    console.error('❌ GAGAL! Koneksi langsung ke PostgreSQL GAGAL.');
    console.error('Pesan Error:', err);
    console.error('======================================================');
  } finally {
    // Tutup koneksi
    await client.end();
  }
}

testConnection();