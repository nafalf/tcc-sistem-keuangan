import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import defaultProfile from "./default-profile.png";
import config from "../config";
import { getCookie, removeCookie } from "../utils/cookieUtils";
import Sidebar from "./Sidebar";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_WIDTH = 800; // Maximum width for compressed image
const API_URL = config.API_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    foto_profil: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = getCookie("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        const userData = response.data.data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          gender: userData.gender || "",
          foto_profil: null,
        });

        // Fetch profile photo
        try {
          const photoResponse = await axios.get(
            `${API_URL}/api/user/profile/photo`,
            {
              responseType: "blob",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const imageUrl = URL.createObjectURL(photoResponse.data);
          setPreviewImage(imageUrl);
        } catch (error) {
          console.log("No profile photo found, using default");
          setPreviewImage(defaultProfile);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Gagal memuat data profil");
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            },
            "image/jpeg",
            0.7
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("Ukuran file terlalu besar. Maksimal 2MB.");
        return;
      }

      try {
        const compressedFile = await compressImage(file);
        setFormData((prev) => ({
          ...prev,
          foto_profil: compressedFile,
        }));
        setPreviewImage(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Error compressing image:", error);
        setError("Gagal memproses gambar. Silakan coba lagi.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formDataToSend = new FormData();
    if (formData.name !== user.name) {
      formDataToSend.append("name", formData.name);
    }
    if (formData.email !== user.email) {
      formDataToSend.append("email", formData.email);
    }
    if (formData.gender !== user.gender) {
      formDataToSend.append("gender", formData.gender);
    }
    if (formData.foto_profil) {
      formDataToSend.append("foto_profil", formData.foto_profil);
    }

    try {
      const token = getCookie("accessToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const response = await axios.put(
        `${API_URL}/api/user/profile`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setUser(response.data.data);
        setSuccess("Profil berhasil diperbarui");

        // Refresh profile photo after update
        try {
          const photoResponse = await axios.get(
            `${API_URL}/api/user/profile/photo`,
            {
              responseType: "blob",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const imageUrl = URL.createObjectURL(photoResponse.data);
          setPreviewImage(imageUrl);
        } catch (error) {
          console.log("No profile photo found, using default");
          setPreviewImage(defaultProfile);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error.response?.data?.msg || "Terjadi kesalahan saat memperbarui profil"
      );
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      try {
        const token = getCookie("accessToken");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        const response = await axios.delete(`${API_URL}/api/user/delete`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          alert(response.data.message || "Akun berhasil dihapus.");
          removeCookie("accessToken");
          removeCookie("refreshToken");
          removeCookie("user");
          navigate("/login");
        } else {
          const errorMessage = response.data.message || "Gagal menghapus akun.";
          setError(errorMessage);
          alert(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        setError(
          error.response?.data?.msg || "Terjadi kesalahan saat menghapus akun"
        );
      }
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <h2>Profil Saya</h2>
            </div>
            <div className="profile-content">
              <div className="profile-image-container">
                <img
                  src={previewImage || defaultProfile}
                  alt="Profile"
                  className="profile-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfile;
                  }}
                />
                <div className="image-upload">
                  <label htmlFor="profile-picture" className="upload-button">
                    Ubah Foto
                  </label>
                  <input
                    type="file"
                    id="profile-picture"
                    name="foto_profil"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Nama</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih Gender</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div className="button-group">
                  
                  <button
                    type="submit"
                    className="save-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={handleDeleteAccount}
                  >
                    Hapus Akun
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
