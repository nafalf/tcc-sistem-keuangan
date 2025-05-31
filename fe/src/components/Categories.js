import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Categories.css";
import config from "../config";
import { getCookie } from "../utils/cookieUtils";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "./Sidebar";

const API_URL = config.API_URL;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/category`, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat kategori");
      } else {
        setError("Gagal memuat kategori: " + error.message);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi input
    if (!newCategory.name.trim()) {
      setError("Nama kategori tidak boleh kosong");
      return;
    }

    try {
      const token = getCookie("accessToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      console.log("Sending category data:", newCategory);
      const response = await axios.post(
        `${API_URL}/api/category`,
        { name: newCategory.name.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setSuccess("Kategori berhasil ditambahkan");
        setNewCategory({ name: "" });
        setShowAddForm(false);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error adding category:", error);
      if (error.response) {
        const errorMsg =
          error.response.data?.msg || "Gagal menambahkan kategori";
        setError(errorMsg);
      } else if (error.request) {
        setError("Tidak dapat terhubung ke server");
      } else {
        setError(error.message || "Gagal menambahkan kategori");
      }
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!editingCategory || !editingCategory.name.trim()) {
      setError("Nama kategori tidak boleh kosong");
      return;
    }

    try {
      const token = getCookie("accessToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const response = await axios.put(
        `${API_URL}/api/category/${editingCategory.id}`,
        { name: editingCategory.name.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setSuccess("Kategori berhasil diperbarui");
        setEditingCategory(null);
        setShowEditForm(false);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.response) {
        if (error.response.status === 404) {
          setError("Kategori tidak ditemukan");
        } else if (error.response.status === 400) {
          setError(
            error.response.data?.message || "Gagal memperbarui kategori"
          );
        } else {
          setError(
            error.response.data?.message ||
              "Terjadi kesalahan saat memperbarui kategori"
          );
        }
      } else if (error.request) {
        setError("Tidak dapat terhubung ke server");
      } else {
        setError(error.message || "Gagal memperbarui kategori");
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        await axios.delete(`${API_URL}/api/category/${id}`, {
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        });
        setSuccess("Kategori berhasil dihapus");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        if (error.response) {
          setError(error.response.data.msg || "Gagal menghapus kategori");
        } else {
          setError("Gagal menghapus kategori: " + error.message);
        }
      }
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <div className="categories-page">
          <div className="container">
            <div className="categories-header">
              <h1>Kategori</h1>
              
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {showAddForm ? (
              <div className="add-category-form">
                <h2>Tambah Kategori Baru</h2>
                <form onSubmit={handleAddCategory}>
                  <div className="form-group">
                    <label htmlFor="name">Nama Kategori</label>
                    <input
                      type="text"
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ name: e.target.value })}
                      required
                      placeholder="Masukkan nama kategori"
                      minLength={1}
                      maxLength={255}
                    />
                  </div>
                  <div className="button-group">
                    <button type="submit" className="btn-save">
                      Simpan
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowAddForm(false)}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            ) : showEditForm ? (
              <div className="edit-category-form">
                <h2>Edit Kategori</h2>
                <form onSubmit={handleEditCategory}>
                  <div className="form-group">
                    <label htmlFor="edit-name">Nama Kategori</label>
                    <input
                      type="text"
                      id="edit-name"
                      value={editingCategory?.name || ""}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        })
                      }
                      required
                      placeholder="Masukkan nama kategori"
                      minLength={1}
                      maxLength={255}
                    />
                  </div>
                  <div className="button-group">
                    <button type="submit" className="btn-save">
                      Simpan
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingCategory(null);
                      }}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="categories-grid">
                  {categories.length === 0 ? (
                    <div className="no-data-message">
                      Belum ada kategori. Silakan tambahkan kategori baru.
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="category-card">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <h3>{category.name}</h3>
                          <div className="category-actions" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button className="icon-btn btn-edit" title="Edit" onClick={() => startEdit(category)}><FaEdit /></button>
                            <button className="icon-btn btn-delete" title="Hapus" onClick={() => handleDeleteCategory(category.id)}><FaTrash /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className="btn-add" onClick={() => setShowAddForm(true)}>
                  + Tambah Kategori
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
