import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login to:", `${config.API_URL}/api/user/login`);

      const response = await axios.post(
        `${config.API_URL}/api/user/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login response:", response.data);
      const { data } = response.data;

      if (!data || !data.accessToken) {
        throw new Error("Token tidak ada di response");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          gender: data.gender,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "ERR_NETWORK") {
        setError(
          "Tidak dapat terhubung ke server. Pastikan server berjalan di " +
            config.API_URL
        );
      } else if (err.response) {
        // Server responded with error
        setError(
          err.response.data?.message || `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        // Request made but no response
        setError("Tidak ada respons dari server. Silakan coba lagi.");
      } else {
        // Other errors
        setError(err.message || "Terjadi kesalahan saat login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="form-button" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>
        <p className="auth-footer">
          Belum punya akun? <a href="/register">Daftar</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
