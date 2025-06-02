import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "./Auth.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Register Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="auth-bg-gradient"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="auth-card"
            style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}
          >
            <h2>Terjadi kesalahan pada halaman register</h2>
            <p>Silakan refresh halaman atau coba kembali nanti</p>
            <button
              onClick={() => window.location.reload()}
              className="register-button-gradient"
              style={{ marginTop: "20px" }}
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "male",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Register component mounted");
    console.log("Current formData:", formData);
    console.log("Current errors:", errors);
  }, [formData, errors]);

  const validateForm = () => {
    const newErrors = {};

    // Validasi nama
    if (!formData.name.trim()) {
      newErrors.name = "Nama tidak boleh kosong";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    // Validasi email
    if (!formData.email.trim()) {
      newErrors.email = "Email tidak boleh kosong";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Validasi password
    if (!formData.password) {
      newErrors.password = "Password tidak boleh kosong";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    // Validasi konfirmasi password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak boleh kosong";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Hapus error untuk field yang sedang diubah
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log(
        "Attempting registration to:",
        `${config.API_URL}/api/user/register`
      );

      const response = await axios.post(
        `${config.API_URL}/api/user/register`,
        {
          name: formData.name,
          email: formData.email,
          gender: formData.gender,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Registration response:", response.data);
      navigate("/login", {
        state: {
          message: "Registrasi berhasil! Silakan login dengan akun baru Anda.",
        },
      });
    } catch (err) {
      console.error("Register error:", err);

      if (err.response) {
        // Error dari server
        const serverError = err.response.data;

        // Cek khusus untuk email yang sudah terdaftar
        if (err.response.status === 400 && serverError.msg) {
          if (
            serverError.msg.toLowerCase().includes("email sudah terdaftar") ||
            serverError.msg.toLowerCase().includes("email already exists")
          ) {
            setErrors({
              email:
                "Email ini sudah terdaftar dalam sistem. Silakan gunakan email lain atau login jika ini adalah akun Anda.",
              submit: "Email sudah terdaftar",
            });
          } else if (serverError.errors) {
            // Jika server mengembalikan multiple errors
            setErrors(serverError.errors);
          } else {
            setErrors({
              submit: serverError.msg || "Terjadi kesalahan saat registrasi",
            });
          }
        } else {
          setErrors({
            submit:
              serverError.msg ||
              `Email sudah terdaftar! (${err.response.status})`,
          });
        }
      } else if (err.request) {
        setErrors({
          submit: `Tidak dapat terhubung ke server. Pastikan server berjalan di ${config.API_URL}`,
        });
      } else {
        setErrors({
          submit: err.message || "Terjadi kesalahan saat registrasi",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg-gradient" style={{ minHeight: "100vh" }}>
      <div
        className="auth-card"
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <h1>Register</h1>
        {errors.submit && (
          <div
            className="error-message"
            style={{
              backgroundColor:
                errors.email && errors.email.includes("sudah terdaftar")
                  ? "#fff3cd"
                  : "#fee2e2",
              color:
                errors.email && errors.email.includes("sudah terdaftar")
                  ? "#856404"
                  : "#dc2626",
              border:
                errors.email && errors.email.includes("sudah terdaftar")
                  ? "1px solid #ffeeba"
                  : "1px solid #fecaca",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "0.95rem",
              textAlign: "center",
              width: "100%",
            }}
          >
            {errors.submit}
          </div>
        )}
        <form onSubmit={handleRegister} style={{ width: "100%" }}>
          <div className="form-field">
            <label>Nama</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={errors.name ? "error-input" : ""}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={errors.email ? "error-input" : ""}
              style={{
                borderColor:
                  errors.email && errors.email.includes("sudah terdaftar")
                    ? "#ffc107"
                    : undefined,
                backgroundColor:
                  errors.email && errors.email.includes("sudah terdaftar")
                    ? "#fff3cd"
                    : undefined,
              }}
            />
            {errors.email && (
              <div
                className="field-error"
                style={{
                  color: errors.email.includes("sudah terdaftar")
                    ? "#856404"
                    : "#dc2626",
                }}
              >
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="register-select"
            >
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={errors.password ? "error-input" : ""}
            />
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <div className="form-field">
            <label>Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={errors.confirmPassword ? "error-input" : ""}
            />
            {errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="register-button-gradient"
            disabled={isLoading}
          >
            {isLoading ? "Mendaftar..." : "Register"}
          </button>
        </form>
        <p className="register-footer">
          Sudah punya akun? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

const RegisterWithErrorBoundary = () => (
  <ErrorBoundary>
    <Register />
  </ErrorBoundary>
);

export default RegisterWithErrorBoundary;
