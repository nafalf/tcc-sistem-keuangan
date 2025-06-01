import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Transaction.css";
import config from "../config";
import { getCookie } from "../utils/cookieUtils";

const API_URL = config.API_URL;

const getLocalToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now;
};

const AddTransaction = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: "",
    categoryId: "",
    type: "expense",
  });
  const [amountInput, setAmountInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const today = getLocalToday();

  useEffect(() => {
    const token = getCookie("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: today.toISOString().split("T")[0],
    }));
  }, []);

  const fetchCategories = async () => {
    try {
      const token = getCookie("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/category`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(error.response?.data?.msg || "Gagal memuat kategori");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      const cleanValue = value.replace(/[^\d.]/g, "");
      const parts = cleanValue.split(".");
      const formattedValue =
        parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];

      setAmountInput(formattedValue);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = getCookie("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const transactionData = {
        ...formData,
        amount: Number(formData.amount),
      };

      await axios.post(`${API_URL}/api/transaction`, transactionData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (onTransactionAdded) {
        onTransactionAdded();
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding transaction:", error);
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(
        error.response?.data?.msg || "Terjadi kesalahan saat menambah transaksi"
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
            type="text"
            id="amount"
            name="amount"
            value={amountInput}
            onChange={handleChange}
            required
            placeholder="Masukkan nominal"
            inputMode="decimal"
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
            max={today.toISOString().split("T")[0]}
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
            onClick={() => {
              if (onTransactionAdded) {
                onTransactionAdded();
              }
              navigate("/dashboard");
            }}
            disabled={isLoading}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransaction;
