import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Using token for transactions:", token);
      console.log("API URL:", `${config.API_URL}/api/transaction`);

      const response = await axios.get(`${config.API_URL}/api/transaction`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Transactions response:", response.data);
      setTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        setError(error.response.data.message);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Using token for categories:", token);
      console.log("API URL:", `${config.API_URL}/api/category`);

      const response = await axios.get(`${config.API_URL}/api/category`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Categories response:", response.data);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        setError(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found");
      setError("No access token found. Please login again.");
      return;
    }
    console.log("Token found, fetching data...");
    fetchTransactions();
    fetchCategories();
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        {transactions.length > 0 ? (
          <div className="grid gap-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white p-4 rounded shadow">
                <p className="font-medium">{transaction.description}</p>
                <p
                  className={`${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"} Rp{" "}
                  {transaction.amount}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No transactions found</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        {categories.length > 0 ? (
          <div className="grid gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded shadow">
                <p className="font-medium">{category.name}</p>
                <p
                  className={`${
                    category.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {category.type}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No categories found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
