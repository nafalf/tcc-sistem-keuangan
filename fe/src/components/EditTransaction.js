import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Transaction.css";
import config from "../config";
import { getCookie, setCookie } from "../utils/cookieUtils";

const API_URL = config.API_URL;

const getLocalToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now;
};

const EditTransaction = (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const id = props.id || params.id;
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: "",
    categoryId: "",
    type: "",
  });
  const [amountInput, setAmountInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const today = getLocalToday();

  const refreshAccessToken = async () => {
    try {
      const refreshToken = getCookie("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${API_URL}/api/user/refresh-token`,
        { refreshToken },
        { withCredentials: true }
      );

      if (response.data && response.data.accessToken) {
        setCookie("accessToken", response.data.accessToken);
        // Tunggu sebentar untuk memastikan cookie sudah diset
        await new Promise((resolve) => setTimeout(resolve, 100));
        return response.data.accessToken;
      }
      throw new Error("Failed to refresh token");
    } catch (error) {
      console.error("Error refreshing token:", error);
      navigate("/login");
      return null;
    }
  };

  const makeAuthenticatedRequest = async (requestFn) => {
    try {
      let token = getCookie("accessToken");
      if (!token) {
        token = await refreshAccessToken();
        if (!token) return;
      }

      try {
        return await requestFn(token);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Token mungkin expired, coba refresh
          const newToken = await refreshAccessToken();
          if (newToken) {
            // Tunggu sebentar untuk memastikan cookie sudah diset
            await new Promise((resolve) => setTimeout(resolve, 100));
            return await requestFn(newToken);
          }
        }
        throw error;
      }
    } catch (error) {
      console.error("Request error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitialized(false);
        await fetchTransaction();
        await fetchCategories();
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing data:", error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };

    initializeData();
  }, [id]);

  useEffect(() => {
    if (!formData.date)
      setFormData((prev) => ({
        ...prev,
        date: today.toISOString().split("T")[0],
      }));
  }, [formData.date]);

  useEffect(() => {
    if (
      formData.amount !== undefined &&
      formData.amount !== null &&
      formData.amount !== ""
    ) {
      setAmountInput(formData.amount.toString());
    }
  }, [formData.amount]);

  const fetchTransaction = async () => {
    try {
      const response = await makeAuthenticatedRequest((token) =>
        axios.get(`${API_URL}/api/transaction/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
      );

      if (response && response.data && response.data.data) {
        const transaction = response.data.data;
        setFormData({
          amount: transaction.amount,
          description: transaction.description || "",
          date: transaction.date.split("T")[0],
          categoryId: transaction.categoryId,
          type: transaction.type,
        });
      } else {
        setError("Data transaksi tidak valid");
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        if (error.response.status === 401) {
          navigate("/login");
        } else {
          setError(error.response.data.msg || "Gagal memuat data transaksi");
        }
      } else {
        setError("Gagal memuat data transaksi: " + error.message);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await makeAuthenticatedRequest((token) =>
        axios.get(`${API_URL}/api/category`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
      );

      if (response && response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        setError("Data kategori tidak valid");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response) {
        if (error.response.status === 401) {
          navigate("/login");
        } else {
          setError(error.response.data.msg || "Gagal memuat kategori");
        }
      } else {
        setError("Gagal memuat kategori: " + error.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      // Hanya terima angka dan titik desimal
      const cleanValue = value.replace(/[^\d.]/g, "");
      // Pastikan hanya ada satu titik desimal
      const parts = cleanValue.split(".");
      const formattedValue =
        parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];

      setAmountInput(formattedValue);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue, // Simpan sebagai string untuk menghindari konversi otomatis
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
      const transactionData = {
        ...formData,
        amount: Number(formData.amount), // Gunakan Number() untuk konversi yang lebih aman
      };

      const response = await makeAuthenticatedRequest((token) =>
        axios.put(`${API_URL}/api/transaction/${id}`, transactionData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
      );

      if (response && response.data && response.data.status === "success") {
        if (props.onClose) {
          props.onClose(); // Tutup form edit, dashboard akan tampilkan daftar transaksi
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Gagal mengupdate transaksi");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        if (error.response.status === 401) {
          navigate("/login");
        } else {
          setError(
            error.response.data.msg ||
              "Terjadi kesalahan saat mengupdate transaksi"
          );
        }
      } else if (error.request) {
        setError("Tidak dapat terhubung ke server");
      } else {
        setError(`Terjadi kesalahan: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="add-transaction-container">
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
            onClick={() =>
              props.onClose ? props.onClose() : navigate("/dashboard")
            }
            disabled={isLoading}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTransaction;
