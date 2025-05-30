import React, { useEffect, useState, useCallback } from "react"; // Tambahkan useCallback
import axios from "axios"; // Impor axios
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { checkApiConnection } from "./utils/util.js";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import EditTransaction from "./pages/EditTransaction";
import FinancialDetail from "./components/FinancialDetail";
import FinancialPlanning from "./components/FinancialPlanning";
import "./App.css";
import Profile from "./components/Profile.js";
import Categories from "./components/Categories.js";

function App() {
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkApiConnection();
      setIsApiConnected(connected);
      setIsLoading(false);
    };

    checkConnection();

    // Logika untuk refresh token periodik
    const refreshTokenInterval = 25000; // 25 detik, karena access token 30 detik

    const attemptRefreshAccessToken = async () => {
      const currentRefreshToken = localStorage.getItem("refreshToken");
      if (!currentRefreshToken) {
        // console.log("No refresh token found, skipping refresh.");
        return;
      }

      try {
        console.log("Attempting to refresh access token...");
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || "https://projek-akhir-505940949397.us-central1.run.app"}/api/user/refresh-token`,
          { refreshToken: currentRefreshToken }
        );

        if (response.data && response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          console.log("Access token refreshed successfully.");
        } else {
          console.error("Failed to refresh access token: No new token received.");
          // Jika refresh gagal tapi tidak ada error eksplisit, mungkin token lama masih valid
        }
      } catch (error) {
        console.error("Error refreshing access token:", error.response ? error.response.data : error.message);
        // Jika refresh token gagal (misalnya, refresh token itu sendiri kedaluwarsa atau tidak valid)
        // Hapus token dan arahkan ke login untuk mencegah loop error atau penggunaan token tidak valid.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Arahkan ke login. Perlu cara untuk mengakses navigate di sini jika App bukan bagian dari Router context langsung
        // Untuk kesederhanaan, kita akan mengandalkan PrivateRoute atau komponen lain untuk redirect jika token tidak ada.
        // window.location.href = "/login"; // Cara paksa, tapi kurang ideal di React
        console.log("Tokens cleared due to refresh failure. User should be redirected to login.");
        // Hentikan interval jika refresh gagal total
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Panggil sekali saat load jika ada refresh token
    attemptRefreshAccessToken(); 
    
    const intervalId = setInterval(attemptRefreshAccessToken, refreshTokenInterval);

    // Cleanup interval saat komponen unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Dependencies kosong agar hanya berjalan sekali saat mount dan cleanup saat unmount

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isApiConnected) {
    return (
      <div>
        Cannot connect to API. Please make sure the backend server is running on
        port 5001.
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit/:id" element={<EditTransaction />} />
        <Route path="/detail" element={<FinancialDetail />} />
        <Route path="/planning" element={<FinancialPlanning />} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/categories" element={<Categories/>} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
