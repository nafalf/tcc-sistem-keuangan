import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AddTransaction from "./AddTransaction";
import "./Dashboard.css";
import defaultProfile from "./default-profile.png";
import config from "../config";

const API_URL = config.API_URL;

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);

          // Fetch profile photo
          try {
            const photoResponse = await fetch(
              `${API_URL}/api/user/profile/photo`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            if (photoResponse.ok) {
              const blob = await photoResponse.blob();
              const imageUrl = URL.createObjectURL(blob);
              setProfilePhoto(imageUrl);
            } else {
              setProfilePhoto(defaultProfile);
            }
          } catch (error) {
            console.error("Error fetching profile photo:", error);
            setProfilePhoto(defaultProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="navbar-menu">
      {user && (
        <div className="user-menu">
          <div
            className="user-profile"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="username">Hallo, {user.name}!</span>
            <img
              src={profilePhoto || defaultProfile}
              alt="Profile"
              className="profile-picture"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfile;
              }}
            />
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">
                Profil Saya
              </Link>
              <Link to="/categories" className="dropdown-item">
                Kategori
              </Link>
              <button onClick={handleLogout} className="dropdown-item">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery]);

  useEffect(() => {
    calculateSummary();
  }, [transactions]);

  const filterTransactions = () => {
    const filtered = transactions.filter((transaction) => {
      const searchLower = searchQuery.toLowerCase();
      const categoryName = transaction.categoryName?.toLowerCase() || "";
      const description = transaction.description?.toLowerCase() || "";
      const amount = transaction.amount?.toString() || "";
      const transactionType =
        transaction.type === "income" ? "pemasukan" : "pengeluaran";

      return (
        description.includes(searchLower) ||
        categoryName.includes(searchLower) ||
        amount.includes(searchQuery) ||
        transactionType.includes(searchLower)
      );
    });
    setFilteredTransactions(filtered);
  };

  const calculateSummary = () => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    setSummary({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
    });
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transaction`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      console.log("Transactions response:", response.data);
      setTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/category`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      console.log("Categories response in Dashboard:", response.data);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        await axios.delete(`${API_URL}/api/transaction/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        console.log("Transaction deleted successfully:", id);
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          alert(
            `Gagal menghapus transaksi: ${
              error.response.data.message || error.message
            }`
          );
        }
      }
    }
  };

  const handleTransactionAdded = () => {
    fetchTransactions();
    setShowAddForm(false);
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard Keuangan</h1>
          <Navbar />
        </div>

        <div className="financial-summary">
          <div className="summary-card total-balance">
            <h3>Total Saldo</h3>
            <p className="amount">
              Rp {summary.totalBalance.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="summary-row">
            <div className="summary-card income">
              <h3>Total Pemasukan</h3>
              <p className="amount">
                Rp {summary.totalIncome.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="summary-card expense">
              <h3>Total Pengeluaran</h3>
              <p className="amount">
                Rp {summary.totalExpense.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <button className="btn-detail" onClick={() => navigate("/detail")}>
            Lihat Detail
          </button>
          <button
            className="btn-planning"
            onClick={() => navigate("/planning")}
          >
            Perencanaan Keuangan
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showAddForm ? (
          <AddTransaction onTransactionAdded={handleTransactionAdded} />
        ) : (
          <>
            <div className="search-container">
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Cari berdasarkan deskripsi, kategori, jumlah, atau tipe transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <button className="btn-add" onClick={() => setShowAddForm(true)}>
              + Tambah Transaksi
            </button>

            <div className="transaction-grid">
              {filteredTransactions.length === 0 ? (
                <div id="no-data-message">
                  {searchQuery
                    ? `Tidak ada transaksi yang sesuai dengan pencarian "${searchQuery}"`
                    : "Anda belum mempunyai riwayat manajemen keuangan, silahkan input terlebih dahulu."}
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-card">
                    <span
                      className={`transaction-type ${
                        transaction.type === "income" ? "income" : "expense"
                      }`}
                    >
                      {transaction.type === "income"
                        ? "Pemasukan"
                        : "Pengeluaran"}{" "}
                      - {transaction.categoryName || "Tanpa Kategori"}
                    </span>
                    <strong>
                      Rp{" "}
                      {transaction.amount !== undefined &&
                      transaction.amount !== null
                        ? Number(transaction.amount).toLocaleString("id-ID")
                        : "0"}
                    </strong>
                    <div>
                      Tanggal:{" "}
                      {transaction.date
                        ? new Date(transaction.date).toLocaleDateString("id-ID")
                        : "-"}
                    </div>
                    <div>Deskripsi: {transaction.description || "-"}</div>
                    <div className="transaction-actions">
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/edit/${transaction.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
