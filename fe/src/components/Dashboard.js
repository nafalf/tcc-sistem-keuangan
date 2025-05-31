import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AddTransaction from "./AddTransaction";
import Sidebar from "./Sidebar";
import "./Dashboard.css";
import defaultProfile from "./default-profile.png";
import config from "../config";
import { getCookie, removeCookie } from "../utils/cookieUtils";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditTransaction from "../components/EditTransaction";

const API_URL = config.API_URL;

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
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
                  Authorization: `Bearer ${getCookie("accessToken")}`,
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
            setProfilePhoto(defaultProfile);
          }
        }
      } catch (error) {
        //
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    removeCookie("accessToken");
    removeCookie("refreshToken");
    removeCookie("user");
    navigate("/login");
  };

  return (
    <div className="navbar-menu-new">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Cari berdasarkan deskripsi, kategori, jumlah, atau tipe transaksi..."
          className="search-input-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {user && (
        <div className="user-menu">
          <div
            className="user-profile"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="username">{user.name}</span>
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
              <button
                onClick={() => navigate("/profile")}
                className="dropdown-item"
              >
                Profil Anda
              </button>
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
  const [editId, setEditId] = useState(null);
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
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      setTransactions(response.data.data);
    } catch (error) {
      //
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/category`, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      setCategories(response.data.data);
    } catch (error) {
      //
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        await axios.delete(`${API_URL}/api/transaction/${id}`, {
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        });
        fetchTransactions();
      } catch (error) {
        //
      }
    }
  };

  const handleTransactionAdded = () => {
    fetchTransactions();
    setShowAddForm(false);
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="dashboard-content">
          <div className="summary-wrapper">
            <div className="wallet-title">Dompet Kamu</div>
            <div className="summary-row-horizontal">
              <div className="summary-card income">
                <h3>Total Pemasukan</h3>
                <p className="amount">
                  Rp {summary.totalIncome.toLocaleString("id-ID")}
                </p>
                <span className="summary-icon">
                  <svg width="40" height="24" viewBox="0 0 40 24">
                    <polyline
                      points="0,24 10,18 20,20 30,10 40,14"
                      fill="none"
                      stroke="#281AC8"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
              </div>
              <div className="summary-card total-balance">
                <h3>Total Saldo</h3>
                <p className="amount">
                  Rp {summary.totalBalance.toLocaleString("id-ID")}
                </p>
                <span className="summary-icon">
                  <svg width="40" height="24" viewBox="0 0 40 24">
                    <polyline
                      points="0,20 10,12 20,16 30,6 40,10"
                      fill="none"
                      stroke="#281AC8"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
              </div>
              <div className="summary-card expense">
                <h3>Total Pengeluaran</h3>
                <p className="amount">
                  Rp {summary.totalExpense.toLocaleString("id-ID")}
                </p>
                <span className="summary-icon">
                  <svg width="40" height="24" viewBox="0 0 40 24">
                    <polyline
                      points="0,10 10,18 20,8 30,20 40,14"
                      fill="none"
                      stroke="#281AC8"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          {showAddForm ? (
            <AddTransaction onTransactionAdded={handleTransactionAdded} />
          ) : editId ? (
            <EditTransaction
              key={editId}
              id={editId}
              onClose={() => {
                setEditId(null);
                fetchTransactions();
              }}
            />
          ) : (
            <>
              <button
                className="btn-add"
                style={{ marginBottom: "2.5rem" }}
                onClick={() => setShowAddForm(true)}
              >
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
                          ? new Date(transaction.date).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </div>
                      <div>Deskripsi: {transaction.description || "-"}</div>
                      <div
                        className="transaction-actions"
                        style={{
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                          position: "absolute",
                          right: "1.2rem",
                          bottom: "1.2rem",
                        }}
                      >
                        <button
                          className="icon-btn btn-edit"
                          title="Edit"
                          onClick={() => setEditId(transaction.id)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="icon-btn btn-delete"
                          title="Hapus"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <FaTrash />
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
    </div>
  );
};

export default Dashboard;
