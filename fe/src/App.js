import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { checkApiConnection } from "./utils/util.js";
import { getCookie, setCookie, removeCookie } from "./utils/cookieUtils";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import EditTransaction from "./pages/EditTransaction";
import FinancialDetail from "./components/FinancialDetail";
import FinancialPlanning from "./components/FinancialPlanning";
import "./App.css";
import Profile from "./components/Profile.js";
import Categories from "./components/Categories.js";
import PrivateRoute from "./components/PrivateRoute";

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
      const currentRefreshToken = getCookie("refreshToken");
      if (!currentRefreshToken) {
        return;
      }

      try {
        console.log("Attempting to refresh access token...");
        const response = await axios.post(
          `${
            process.env.REACT_APP_API_URL ||
            "https://projek-akhir-505940949397.us-central1.run.app"
          }/api/user/refresh-token`,
          { refreshToken: currentRefreshToken }
        );

        if (response.data && response.data.accessToken) {
          setCookie("accessToken", response.data.accessToken);
          console.log("Access token refreshed successfully.");
        } else {
          console.error(
            "Failed to refresh access token: No new token received."
          );
        }
      } catch (error) {
        console.error(
          "Error refreshing access token:",
          error.response ? error.response.data : error.message
        );
        removeCookie("accessToken");
        removeCookie("refreshToken");
        removeCookie("user");
        console.log(
          "Tokens cleared due to refresh failure. User should be redirected to login."
        );
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Panggil sekali saat load jika ada refresh token
    attemptRefreshAccessToken();

    const intervalId = setInterval(
      attemptRefreshAccessToken,
      refreshTokenInterval
    );

    // Cleanup interval saat komponen unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditTransaction />
            </PrivateRoute>
          }
        />
        <Route
          path="/detail"
          element={
            <PrivateRoute>
              <FinancialDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/planning"
          element={
            <PrivateRoute>
              <FinancialPlanning />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
