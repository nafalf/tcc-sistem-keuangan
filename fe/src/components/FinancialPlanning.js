import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FinancialPlanning.css";
import config from "../config";
import { getCookie } from "../utils/cookieUtils";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "./Sidebar";

const API_URL = config.API_URL;

const FinancialPlanning = () => {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalPlanned: 0,
    remainingBalance: 0,
  });
  const [newPlan, setNewPlan] = useState({
    categoryId: "",
    amount: "",
    description: "",
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    fetchCategories();
    fetchTransactions();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/plan`, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      console.log("Fetching plans...");
      console.log("Plans response:", response.data);
      setPlans(response.data.data);
      calculateSummary(response.data.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/category`, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      console.log("Fetching categories...");
      console.log("Categories response:", response.data);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transaction`, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      console.log("Fetching transactions...");
      console.log("Transactions response:", response.data);
      // Hitung total saldo dari transaksi
      const totalIncome = response.data.data
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const totalExpense = response.data.data
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      setSummary((prev) => ({
        ...prev,
        totalBalance: totalIncome - totalExpense,
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const calculateSummary = (plansData) => {
    const totalPlanned = plansData.reduce(
      (sum, plan) => sum + (Number(plan.amount) || 0),
      0
    );

    setSummary((prev) => ({
      ...prev,
      totalPlanned,
      remainingBalance: prev.totalBalance - totalPlanned,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Khusus amount: pastikan hanya angka valid
    if (name === "amount") {
      const numericValue = value === "" ? "" : Math.max(0, parseInt(value, 10));
      setNewPlan((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setNewPlan((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  

  const handleEdit = (plan) => {
    console.log("Editing plan:", plan);
    setEditingPlan(plan);
    setNewPlan({
      categoryId: plan.categoryId,
      amount: plan.amount,
      description: plan.description,
      remainingAmount: plan.amount,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        // Update existing plan
        const planData = {
          categoryId: newPlan.categoryId,
          amount: Number(newPlan.amount),
          description: newPlan.description,
          // remainingAmount tidak perlu dikirim, akan dihitung di backend
        };
        console.log("Mengupdate plan dengan data:", planData);
        const response = await axios.put(
          `${API_URL}/api/plan/${editingPlan.id}`,
          planData,
          {
            headers: {
              Authorization: `Bearer ${getCookie("accessToken")}`,
            },
          }
        );
        console.log("Response update plan:", response.data);
        setEditingPlan(null);
      } else {
        // Create new plan
        const planData = {
          categoryId: newPlan.categoryId,
          amount: Number(newPlan.amount),
          description: newPlan.description,
          remainingAmount: Number(newPlan.amount),
        };
        console.log("Membuat plan baru dengan data:", planData);
        const response = await axios.post(`${API_URL}/api/plan`, planData, {
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        });
        console.log("Response create plan:", response.data);
      }
      setNewPlan({
        categoryId: "",
        amount: "",
        description: "",
      });
      setShowAddForm(false);
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      console.error("Detail error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      alert(error.response?.data?.message || "Gagal menyimpan perencanaan");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingPlan(null);
    setNewPlan({
      categoryId: "",
      amount: "",
      description: "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus perencanaan ini?")) {
      try {
        console.log("Deleting plan with id:", id);
        const response = await axios.delete(`${API_URL}/api/plan/${id}`, {
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        });
        console.log("Delete response:", response.data);
        fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("Gagal menghapus perencanaan");
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Kategori tidak ditemukan";
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <div className="planning-page">
          <div className="container">
           

            <div className="summary-wrapper">
              <div className="wallet-title">Perencanaan Keuangan</div>
              <div className="summary-row-horizontal">
                <div className="summary-card planned">
                  <h3>Total Terencana</h3>
                  <p className="amount">Rp {summary.totalPlanned.toLocaleString("id-ID")}</p>
                  <div className="period-placeholder"></div>
                  <span className="summary-icon">
                    {/* SVG merah muda */}
                    <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 32V24C6 24 12 16 18 16C24 16 30 28 36 28C42 28 48 8 54 8C57 8 60 16 60 16V32H0Z" fill="url(#pink)" fillOpacity="0.18"/>
                      <defs>
                        <linearGradient id="pink" x1="0" y1="0" x2="60" y2="32" gradientUnits="userSpaceOnUse">
                          <stop stop-color="#FD749B"/>
                          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </div>
                <div className="summary-card total-balance">
                  <h3>Total Saldo</h3>
                  <p className="amount">Rp {summary.totalBalance.toLocaleString("id-ID")}</p>
                  <div className="period-placeholder"></div>
                  <span className="summary-icon">
                    {/* SVG ungu */}
                    <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g>
                        <rect x="5" y="20" width="4" height="8" rx="2" fill="#C5C5C5"/>
                        <rect x="13" y="16" width="4" height="12" rx="2" fill="#C5C5C5"/>
                        <rect x="21" y="22" width="4" height="6" rx="2" fill="#C5C5C5"/>
                        <rect x="29" y="18" width="4" height="10" rx="2" fill="#C5C5C5"/>
                        <rect x="37" y="24" width="4" height="4" rx="2" fill="#C5C5C5"/>
                        <rect x="45" y="12" width="4" height="16" rx="2" fill="#7B61FF"/>
                      </g>
                    </svg>
                  </span>
                </div>
                <div className="summary-card remaining">
                  <h3>Sisa Saldo</h3>
                  <p className="amount">Rp {summary.remainingBalance.toLocaleString("id-ID")}</p>
                  <div className="period-placeholder"></div>
                  <span className="summary-icon">
                    {/* SVG biru muda */}
                    <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 32V24C6 24 12 16 18 16C24 16 30 28 36 28C42 28 48 8 54 8C57 8 60 16 60 16V32H0Z" fill="url(#blue)" fillOpacity="0.18"/>
                      <defs>
                        <linearGradient id="blue" x1="0" y1="0" x2="60" y2="32" gradientUnits="userSpaceOnUse">
                          <stop stop-color="#00D1FF"/>
                          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {!showAddForm && (
              <button className="btn-add" onClick={() => setShowAddForm(true)}>
                + Tambah Perencanaan
              </button>
            )}

            {showAddForm ? (
              <div className="add-plan-form">
                <h2>
                  {editingPlan ? "Edit Perencanaan" : "Tambah Perencanaan Baru"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Kategori:</label>
                    <select
                      name="categoryId"
                      value={newPlan.categoryId}
                      onChange={handleInputChange}
                      required
                      disabled={editingPlan}
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
                    <label>Jumlah (Rp):</label>
                    <input
                      type="number"
                      name="amount"
                      value={newPlan.amount}
                      onChange={handleInputChange}
                      onBlur={(e) => {
                        if (e.target.value === "") return;
                        const numericValue = Math.max(0, parseInt(e.target.value, 10));
                        setNewPlan((prev) => ({
                          ...prev,
                          amount: numericValue,
                        }));
                      }}
                      required
                      min="0"
                    />

                  </div>
                  <div className="form-group">
                    <label>Deskripsi:</label>
                    <textarea
                      name="description"
                      value={newPlan.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">
                      {editingPlan ? "Update" : "Simpan"}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={handleCancel}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="plans-grid">
                  {plans.length === 0 ? (
                    <div className="no-plans">
                      Belum ada perencanaan keuangan. Silakan tambahkan perencanaan
                      baru.
                    </div>
                  ) : (
                    plans.map((plan) => (
                      <div key={plan.id} className="plan-card">
                        <div className="plan-header">
                          <h3>{getCategoryName(plan.categoryId)}</h3>
                          <div className="plan-actions" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button className="icon-btn btn-edit" title="Edit" onClick={() => handleEdit(plan)}><FaEdit /></button>
                            <button className="icon-btn btn-delete" title="Hapus" onClick={() => handleDelete(plan.id)}><FaTrash /></button>
                          </div>
                        </div>
                        <div className="plan-details">
                          <div className="detail-row">
                            <span className="label">Jumlah:</span>
                            <span className="value">
                              Rp {Number(plan.amount).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Sisa:</span>
                            <span className="value">
                              Rp{" "}
                              {Number(plan.remainingAmount).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Deskripsi:</span>
                            <span className="value">{plan.description}</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress"
                              style={{
                                width: `${
                                  (plan.remainingAmount / plan.amount) * 100
                                }%`,
                              }}
                            />
                          </div>
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
    </div>
  );
};

export default FinancialPlanning;
