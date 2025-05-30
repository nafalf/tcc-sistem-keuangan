import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Transaction.css";
import config from "../config";

const API_URL = config.API_URL;

const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: "",
    categoryId: "",
    type: "",
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTransaction();
    fetchCategories();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transaction/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const transaction = response.data.data;
      setFormData({
        amount: transaction.amount,
        description: transaction.description || "",
        date: transaction.date.split("T")[0],
        categoryId: transaction.categoryId,
        type: transaction.type,
      });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      setError("Gagal memuat data transaksi");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/category`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      console.log("Categories response:", response.data);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response) {
        console.error("Error response data (categories):", error.response.data);
      }
      setError("Gagal memuat kategori");
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
      const amountInRupiah = parseInt(formData.amount);

      const response = await axios.put(
        `${API_URL}/api/transaction/${id}`,
        {
          ...formData,
          amount: amountInRupiah,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Transaction updated:", response.data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating transaction:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      setError(error.response?.data?.message || "Gagal memperbarui transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-transaction-container">
      <h2>Edit Transaksi</h2>
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
            {categories.map((category) => (
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
            placeholder="Masukkan deskripsi transaksi"
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/dashboard")}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTransaction;
