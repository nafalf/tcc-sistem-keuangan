import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FinancialDetail.css";
import config from "../config";
import { getCookie } from "../utils/cookieUtils";
import Sidebar from "./Sidebar";

const API_URL = config.API_URL;

const getLocalToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now;
};

const FinancialDetail = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [timeFilter, setTimeFilter] = useState("day"); // 'day', 'month', 'year'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'income', 'expense'
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  const [selectedDate, setSelectedDate] = useState(() => getLocalToday());
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, timeFilter, selectedDate, typeFilter]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transaction`, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      console.log("Data transaksi:", response.data); // Debug log
      setTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const filterTransactions = () => {
    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const selected = new Date(selectedDate);

      // Filter berdasarkan tanggal
      let dateMatch = false;
      switch (timeFilter) {
        case "day":
          dateMatch =
            transactionDate.getDate() === selected.getDate() &&
            transactionDate.getMonth() === selected.getMonth() &&
            transactionDate.getFullYear() === selected.getFullYear();
          break;
        case "month":
          dateMatch =
            transactionDate.getMonth() === selected.getMonth() &&
            transactionDate.getFullYear() === selected.getFullYear();
          break;
        case "year":
          dateMatch = transactionDate.getFullYear() === selected.getFullYear();
          break;
        default:
          dateMatch = true;
      }

      // Filter berdasarkan jenis transaksi
      const typeMatch = typeFilter === "all" || transaction.type === typeFilter;

      return dateMatch && typeMatch;
    });

    setFilteredTransactions(filtered);
    calculateSummary(filtered);
  };

  const calculateSummary = (transactions) => {
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

  const handleDateChange = (e) => {
    let newDate;
    if (timeFilter === "month") {
      // Format value: yyyy-mm
      const [year, month] = e.target.value.split("-");
      newDate = new Date(Number(year), Number(month) - 1, 1);
    } else if (timeFilter === "year") {
      newDate = new Date(Number(e.target.value), 0, 1);
    } else {
      // Format value: yyyy-mm-dd
      newDate = new Date(e.target.value);
      // Koreksi timezone agar sesuai lokal
      newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset());
    }
    setSelectedDate(newDate);
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    const newDate = new Date(selectedDate);

    if (filter === "month") {
      // Reset tanggal ke tanggal 1 saat beralih ke filter bulanan
      newDate.setDate(1);
    } else if (filter === "year") {
      // Reset tanggal ke 1 Januari saat beralih ke filter tahunan
      newDate.setMonth(0);
      newDate.setDate(1);
    }
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    switch (timeFilter) {
      case "year":
        return `Tahun ${date.getFullYear()}`;
      case "month":
        return date.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
      default:
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
    }
  };

  const getDateInputType = () => {
    switch (timeFilter) {
      case "year":
        return "number";
      case "month":
        return "month";
      default:
        return "date";
    }
  };

  const getDateInputValue = () => {
    switch (timeFilter) {
      case "year":
        return selectedDate.getFullYear();
      case "month":
        return `${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}`;
      default:
        // Format ke yyyy-mm-dd lokal
        const local = new Date(
          selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
        );
        return local.toISOString().split("T")[0];
    }
  };

  const getMaxDate = () => {
    const today = getLocalToday();
    switch (timeFilter) {
      case "year":
        return today.getFullYear().toString();
      case "month":
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      default:
        const local = new Date(
          today.getTime() - today.getTimezoneOffset() * 60000
        );
        return local.toISOString().split("T")[0];
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";

      return date.toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <div className="financial-detail-page">
          <div className="container">
            <div className="filter-section">
              <div className="detail-header-inside">
                <h1>Detail Keuangan</h1>
              </div>
              <div className="filter-row">
                <div className="time-filter">
                  <button
                    className={`filter-btn ${
                      timeFilter === "day" ? "active" : ""
                    }`}
                    onClick={() => handleTimeFilterChange("day")}
                  >
                    Harian
                  </button>
                  <button
                    className={`filter-btn ${
                      timeFilter === "month" ? "active" : ""
                    }`}
                    onClick={() => handleTimeFilterChange("month")}
                  >
                    Bulanan
                  </button>
                  <button
                    className={`filter-btn ${
                      timeFilter === "year" ? "active" : ""
                    }`}
                    onClick={() => handleTimeFilterChange("year")}
                  >
                    Tahunan
                  </button>
                </div>
                <div className="date-picker">
                  <input
                    type={getDateInputType()}
                    value={getDateInputValue()}
                    onChange={handleDateChange}
                    max={getMaxDate()}
                  />
                </div>
              </div>
              <div className="type-filter">
                <button
                  className={`filter-btn ${
                    typeFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setTypeFilter("all")}
                >
                  Semua
                </button>
                <button
                  className={`filter-btn ${
                    typeFilter === "income" ? "active" : ""
                  }`}
                  onClick={() => setTypeFilter("income")}
                >
                  Pemasukan
                </button>
                <button
                  className={`filter-btn ${
                    typeFilter === "expense" ? "active" : ""
                  }`}
                  onClick={() => setTypeFilter("expense")}
                >
                  Pengeluaran
                </button>
              </div>
            </div>
            <div className="summary-wrapper">
              <div className="summary-row-horizontal">
                <div className="summary-card income">
                  <h3>Total Pemasukan</h3>
                  <p className="amount">
                    Rp {summary.totalIncome.toLocaleString("id-ID")}
                  </p>
                  <div className="period-placeholder"></div>
                  <span className="summary-icon">
                    {/* SVG hijau */}
                    <svg
                      width="60"
                      height="32"
                      viewBox="0 0 60 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 32V24C6 24 12 16 18 16C24 16 30 28 36 28C42 28 48 8 54 8C57 8 60 16 60 16V32H0Z"
                        fill="url(#green)"
                        fillOpacity="0.18"
                      />
                      <defs>
                        <linearGradient
                          id="green"
                          x1="0"
                          y1="0"
                          x2="60"
                          y2="32"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#00D1B2" />
                          <stop offset="1" stop-color="#fff" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </div>
                <div className="summary-card total-balance">
                  <h3>Total Saldo</h3>
                  <p className="amount">
                    Rp {summary.totalBalance.toLocaleString("id-ID")}
                  </p>
                  <div className="period-placeholder"></div>
                  <span className="summary-icon">
                    {/* SVG ungu */}
                    <svg
                      width="60"
                      height="32"
                      viewBox="0 0 60 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g>
                        <rect
                          x="5"
                          y="20"
                          width="4"
                          height="8"
                          rx="2"
                          fill="#C5C5C5"
                        />
                        <rect
                          x="13"
                          y="16"
                          width="4"
                          height="12"
                          rx="2"
                          fill="#C5C5C5"
                        />
                        <rect
                          x="21"
                          y="22"
                          width="4"
                          height="6"
                          rx="2"
                          fill="#C5C5C5"
                        />
                        <rect
                          x="29"
                          y="18"
                          width="4"
                          height="10"
                          rx="2"
                          fill="#C5C5C5"
                        />
                        <rect
                          x="37"
                          y="24"
                          width="4"
                          height="4"
                          rx="2"
                          fill="#C5C5C5"
                        />
                        <rect
                          x="45"
                          y="12"
                          width="4"
                          height="16"
                          rx="2"
                          fill="#7B61FF"
                        />
                      </g>
                    </svg>
                  </span>
                </div>
                <div className="summary-card expense">
                  <h3>Total Pengeluaran</h3>
                  <p className="amount">
                    Rp {summary.totalExpense.toLocaleString("id-ID")}
                  </p>
                  <div className="period-placeholder"></div>
                  <span className="summary-icon">
                    {/* SVG merah muda */}
                    <svg
                      width="60"
                      height="32"
                      viewBox="0 0 60 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 32V24C6 24 12 16 18 16C24 16 30 28 36 28C42 28 48 8 54 8C57 8 60 16 60 16V32H0Z"
                        fill="url(#pink)"
                        fillOpacity="0.18"
                      />
                      <defs>
                        <linearGradient
                          id="pink"
                          x1="0"
                          y1="0"
                          x2="60"
                          y2="32"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#FD749B" />
                          <stop offset="1" stop-color="#fff" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div className="transactions-section">
              <h2>Daftar Transaksi</h2>
              {filteredTransactions.length === 0 ? (
                <div className="no-transactions">
                  Tidak ada transaksi pada periode ini
                </div>
              ) : (
                <div className="transactions-list">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <div
                          className={`transaction-type ${
                            transaction.type === "income" ? "income" : "expense"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "PEMASUKAN"
                            : "PENGELUARAN"}
                        </div>
                        <div className="transaction-header">
                          <span className="transaction-date">
                            {new Date(transaction.date).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                        <div className="transaction-details">
                          <div className="detail-row">
                            <span className="detail-label">Kategori:</span>
                            <span className="detail-value">
                              {transaction.categoryName || "Tanpa Kategori"}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Deskripsi:</span>
                            <span className="detail-value">
                              {transaction.description || "-"}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Jumlah:</span>
                            <span className="detail-value amount">
                              Rp{" "}
                              {Number(transaction.amount).toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">ID Transaksi:</span>
                            <span className="detail-value">
                              {transaction.id}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">
                              Tanggal Dibuat:
                            </span>
                            <span className="detail-value">
                              {formatDateTime(transaction.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDetail;
