import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config";
import { getCookie } from "../utils/cookieUtils";
import "./EditTransaction.css";

const API_URL = process.env.REACT_APP_API_URL;

const EditTransaction = () => {
  const { id } = useParams(); // Mengambil ID transaksi dari URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: "", // Tanggal akan diisi dari data yang diambil
    categoryId: "",
    type: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactionLoaded, setTransactionLoaded] = useState(false); // State baru
  const [formKey, setFormKey] = useState(0); // State baru untuk memaksa re-render form
  const [amountInput, setAmountInput] = useState(""); // State baru untuk input amount

  // Effect untuk cek token dan redirect jika tidak ada
  useEffect(() => {
    const token = getCookie("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Effect untuk fetch data transaksi spesifik
  useEffect(() => {
    console.log("Fetching transaction data for ID:", id);
    fetchTransactionData();
    fetchCategories();
  }, [id]); // Fetch data saat ID berubah atau komponen pertama kali dimuat

  // Effect untuk memantau perubahan formData (untuk debugging)
  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

  const fetchTransactionData = async () => {
    setLoading(true); // Set loading true saat fetch dimulai
    setError(""); // Reset error
    setTransactionLoaded(false); // Reset loaded state
    try {
      const token = getCookie("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${API_URL}/api/transaction/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Raw response data:", response.data);

      // Ambil data transaksi dari response.data.data
      // Asumsi backend mengembalikan objek transaksi di dalam properti 'data'
      const transaction =
        response.data && response.data.data
          ? response.data.data
          : response.data; // Fallback jika tidak ada .data atau struktur berbeda

      console.log("Processed transaction data:", transaction);

      // --- Validasi Dasar Data yang Diterima --- //
      // Memastikan data transaksi adalah objek yang valid sebelum mencoba mengakses propertinya
      if (!transaction || typeof transaction !== "object") {
        console.error(
          "Invalid or empty transaction data structure received:",
          transaction
        );
        setError(
          "Gagal memuat data transaksi: Struktur data tidak valid atau kosong."
        );
        setLoading(false);
        return;
      }
      // ------------------------------------- //

      // Log detail properti data transaksi yang diterima
      console.log("Transaction data properties received:", {
        id: transaction.id,
        amount: transaction.amount,
        date: transaction.date,
        categoryId: transaction.categoryId,
        type: transaction.type,
        description: transaction.description,
        categoryName: transaction.categoryName, // Log juga categoryName jika ada
      });

      // Format tanggal agar sesuai dengan input type="date" (YYYY-MM-DD)
      let formattedDate = "";
      if (transaction.date) {
        try {
          // Coba parsing tanggal menggunakan Date object
          const dateObject = new Date(transaction.date);
          if (!isNaN(dateObject.getTime())) {
            formattedDate = dateObject.toISOString().split("T")[0];
          } else if (
            typeof transaction.date === "string" &&
            transaction.date.length >= 10
          ) {
            // Jika Date object gagal, coba ambil 10 karakter pertama jika berupa string (asumsi format YYYY-MM-DD...)
            formattedDate = transaction.date.substring(0, 10);
            console.warn(
              "Date parsing with Date object failed, using substring:",
              transaction.date,
              "->",
              formattedDate
            );
          } else {
            console.warn(
              "Unexpected date format from backend:",
              transaction.date
            );
          }
        } catch (e) {
          console.error(
            "Error processing date from backend:",
            transaction.date,
            e
          );
          formattedDate = ""; // Set kosong jika ada error
        }
      } else {
        console.warn("Transaction date is null or undefined for ID", id);
      }
      console.log("Formatted date for form input:", formattedDate);

      // Siapkan data untuk form state, berikan nilai default jika properti hilang atau null/undefined
      const newFormData = {
        amount:
          transaction.amount !== null && transaction.amount !== undefined
            ? Number(transaction.amount)
            : "", // Gunakan '' untuk input number kosong
        description: transaction.description || "", // Default string kosong
        date: formattedDate, // Gunakan tanggal yang sudah diformat
        categoryId:
          transaction.categoryId !== null &&
          transaction.categoryId !== undefined
            ? String(transaction.categoryId)
            : "", // Default string kosong
        type: transaction.type || "", // Default string kosong
      };

      console.log("Setting form data with values:", newFormData);
      setFormData(newFormData);
      setAmountInput(newFormData.amount.toString()); // Set initial amount input

      // Log state formData setelah diset (meskipun async)
      console.log(
        "formData state after set (may be slightly delayed):",
        newFormData
      );

      setTransactionLoaded(true);
      setFormKey((prevKey) => prevKey + 1); // Perbarui key form untuk memaksa re-render dengan data baru
    } catch (err) {
      console.error("Error fetching transaction data:", err);
      // Menangani error response dari backend
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      if (err.response) {
        console.error("Error response data:", err.response.data);
        setError(err.response?.data?.msg || "Gagal memuat data transaksi.");
      } else if (err.request) {
        console.error("Error request:", err.request);
        setError(
          "Gagal memuat data transaksi: Tidak dapat terhubung ke server."
        );
      } else {
        console.error("Error message:", err.message);
        setError(`Gagal memuat data transaksi: ${err.message}`);
      }
    } finally {
      setLoading(false); // Loading selesai
    }
  };

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
      console.log("Categories response in EditTransaction:", response.data);
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        console.warn("Format data kategori tidak valid:", response.data);
        //setError("Gagal memuat kategori: Struktur data tidak valid."); // Opsional: tampilkan error kategori
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Menangani error response
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      if (err.response) {
        console.error("Error response data (categories):", err.response.data);
        //setError(err.response?.data?.msg || "Gagal memuat kategori."); // Opsional
      } else if (err.request) {
        console.error("Error request (categories):", err.request);
        //setError("Gagal memuat kategori: Tidak dapat terhubung ke server."); // Opsional
      } else {
        console.error("Error message (categories):", err.message);
        //setError(`Gagal memuat kategori: ${err.message}`); // Opsional
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      // Update amountInput state untuk input
      setAmountInput(value);
      // Update formData dengan nilai yang sudah di-parse
      const parsedValue = value === "" ? "" : parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue,
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
    setError(""); // Reset error sebelum submit
    setLoading(true);

    try {
      const token = getCookie("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // Konversi amount ke number
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      await axios.put(`${API_URL}/api/transaction/${id}`, transactionData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Transaction updated successfully:", transactionData);
      navigate("/dashboard"); // Kembali ke dashboard setelah update
    } catch (err) {
      console.error("Error updating transaction:", err);
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      if (err.response) {
        console.error("Error response:", err.response.data);
        setError(
          err.response?.data?.msg ||
            "Terjadi kesalahan saat mengupdate transaksi"
        );
      } else if (err.request) {
        console.error("Request error:", err.request);
        setError("Tidak dapat terhubung ke server untuk mengupdate transaksi.");
      } else {
        setError(`Terjadi kesalahan saat mengupdate transaksi: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan loading message jika sedang memuat ATAU data transaksi spesifik belum dimuat
  if (loading || !transactionLoaded) {
    return <div className="loading-message">Memuat data transaksi...</div>;
  }

  // Tampilkan error jika data spesifik gagal dimuat dan tidak ada data di form
  if (error && !formData.date && !formData.amount) {
    return <div className="error-message">{error}</div>;
  }

  console.log("Rendering form with formData:", formData);
  console.log(
    "Input values check: amount=",
    formData.amount,
    ", date=",
    formData.date,
    ", categoryId=",
    formData.categoryId,
    ", type=",
    formData.type
  );

  return (
    <div className="edit-transaction-container" key={id}>
      {" "}
      {/* Added key={id} */}
      <h2>Edit Transaksi</h2>
      {/* Tampilkan error saat submit jika form sudah terisi */}
      {error && (formData.date || formData.amount) && (
        <div className="error-message">{error}</div>
      )}
      {/* Render form hanya jika data transaksi spesifik sudah dimuat */}
      {transactionLoaded && (
        <form
          onSubmit={handleSubmit}
          className="transaction-form"
          key={formKey}
        >
          {" "}
          {/* Added key={formKey} */}
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
              value={amountInput}
              onChange={handleChange}
              onBlur={(e) => {
                // Format angka saat input kehilangan fokus
                const value = e.target.value;
                if (value !== "") {
                  const formattedValue = parseFloat(value).toString();
                  setAmountInput(formattedValue);
                  setFormData((prev) => ({
                    ...prev,
                    amount: parseFloat(formattedValue),
                  }));
                }
              }}
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
              value={formData.categoryId} // Periksa nilai categoryId
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
              value={formData.date} // Periksa nilai date
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              value={formData.description} // Periksa nilai description
              onChange={handleChange}
              placeholder="Tambahkan deskripsi transaksi (opsional)"
              rows="3"
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Mengupdate..." : "Update Transaksi"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/dashboard")}
          >
            Batal
          </button>
        </form>
      )}
    </div>
  );
};

export default EditTransaction;
