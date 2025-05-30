import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import "./Transaction.css";

const AddTransaction = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    type: "expense", // default value
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const response = await axios.get(`${config.API_URL}/api/category`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Categories response:", response.data);

      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        console.error("Format data kategori tidak valid:", response.data);
        setError("Format data kategori tidak valid");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
        setError(err.response.data.msg || "Gagal memuat kategori");
      } else if (err.request) {
        console.error("Request error:", err.request);
        setError("Tidak dapat terhubung ke server");
      } else {
        setError("Gagal memuat kategori");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Konversi amount ke number
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      const response = await axios.post(
        `${config.API_URL}/api/transaction`,
        transactionData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Transaction added:", response.data);

      // Reset form
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
        type: "expense",
      });

      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError(
        err.response?.data?.msg || "Terjadi kesalahan saat menambah transaksi"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-transaction-container">
      <h2>Tambah Transaksi Baru</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label htmlFor="type">Jenis Transaksi</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Nominal (Rp)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="Masukkan nominal"
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Kategori</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Pilih Kategori</option>
            {Array.isArray(categories) &&
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Tanggal</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Deskripsi</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tambahkan deskripsi transaksi (opsional)"
            rows="3"
          />
        </div>

        <div className="button-group">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Menambahkan..." : "Tambah Transaksi"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => onTransactionAdded()}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransaction;
