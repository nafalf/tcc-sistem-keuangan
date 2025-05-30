import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from '../config';
import "./Auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("male");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Attempting registration to:", `${config.API_URL}/api/user/register`);
      
      const response = await axios.post(
        `${config.API_URL}/api/user/register`,
        { name, email, gender, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Registration response:", response.data);
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      
      if (err.response) {
        setError(err.response.data?.msg || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError(`Tidak dapat terhubung ke server. Pastikan server berjalan di ${config.API_URL}`);
      } else {
        setError(err.message || "Terjadi kesalahan saat registrasi");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Register</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-field">
            <label>Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">
            Register
          </button>
        </form>
        <p className="auth-footer">
          Sudah punya akun? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register; 