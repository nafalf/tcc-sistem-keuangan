# Money Tracker - Aplikasi Pencatatan Keuangan

Money Tracker adalah aplikasi web modern untuk membantu pengguna mengelola dan melacak keuangan pribadi mereka. 

## Fitur Utama

- 📊 **Dashboard Keuangan**

  - Tampilan ringkasan saldo, pemasukan, dan pengeluaran
  - Grafik visual untuk analisis keuangan
  - Pencarian dan filter transaksi

- 💰 **Manajemen Transaksi**

  - Pencatatan pemasukan dan pengeluaran
  - Kategorisasi transaksi
  - Riwayat transaksi lengkap
  - Edit dan hapus transaksi

- 📈 **Perencanaan Keuangan**

  - Perencanaan anggaran per kategori
  - Tracking pengeluaran terencana
  - Perhitungan saldo tersisa

- 👤 **Manajemen Profil**
  - Update informasi profil
  - Upload foto profil
  - Manajemen akun pengguna


## Cara Menjalankan Aplikasi

### Prasyarat

- Node.js (versi 18 atau lebih baru)
- MySQL database
- npm atau yarn package manager

### Backend Setup

1. Masuk ke direktori backend:
   ```bash
   cd be
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` dan sesuaikan konfigurasi database:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=money_tracker
   JWT_SECRET=your_jwt_secret
   ```
4. Jalankan migrasi database:
   ```bash
   npm run migrate
   ```
5. Jalankan server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Masuk ke direktori frontend:
   ```bash
   cd fe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` dan sesuaikan URL API:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
4. Jalankan aplikasi:
   ```bash
   npm start
   ```

## Struktur Proyek

```
projekprakTCCnew/
├── be/                 # Backend server
│   ├── config/        # Konfigurasi database dan lainnya
│   ├── controllers/   # Logic controller
│   ├── models/        # Model database
│   ├── routes/        # API routes
│   └── middleware/    # Custom middleware
│
└── fe/                # Frontend React app
    ├── public/        # Static files
    ├── src/          # Source code
    │   ├── components/  # React components
    │   ├── pages/      # Page components
    │   └── utils/      # Utility functions
    └── package.json
```

## API Endpoints

### Autentikasi & User (`/api/user`)

- `POST /register` - Registrasi user baru
- `POST /login` - Login user
- `POST /refresh-token` - Refresh access token
- `POST /logout` - Logout user
- `GET /me` - Mendapatkan profil user saat ini
- `GET /profile/photo` - Mendapatkan foto profil user
- `PUT /profile` - Update profil user
- `DELETE /delete` - Hapus akun user

### Transaksi (`/api/transaction`)

- `GET /` - Mendapatkan semua transaksi user
- `GET /:id` - Mendapatkan detail transaksi berdasarkan ID
- `GET /date-range` - Mendapatkan transaksi dalam rentang tanggal
- `POST /` - Membuat transaksi baru
- `PUT /:id` - Update transaksi
- `DELETE /:id` - Hapus transaksi

### Kategori (`/api/category`)

- `GET /` - Mendapatkan semua kategori
- `GET /type/:type` - Mendapatkan kategori berdasarkan tipe (income/expense)
- `POST /` - Membuat kategori baru
- `PUT /:id` - Update kategori
- `DELETE /:id` - Hapus kategori

### Perencanaan Keuangan (`/api/plan`)

- `GET /` - Mendapatkan semua rencana keuangan user
- `GET /:id` - Mendapatkan detail rencana keuangan berdasarkan ID
- `POST /` - Membuat rencana keuangan baru
- `PUT /:id` - Update rencana keuangan
- `DELETE /:id` - Hapus rencana keuangan
