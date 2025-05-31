import React from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaList, FaRegLightbulb, FaTags } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>MoneyTracker</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"} end>
          <FaTachometerAlt className="sidebar-icon" /> Dashboard
        </NavLink>
        <NavLink to="/detail" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <FaList className="sidebar-icon" /> Lihat Detail
        </NavLink>
        <NavLink to="/planning" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <FaRegLightbulb className="sidebar-icon" /> Perencanaan Keuangan
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <FaTags className="sidebar-icon" /> Kategori Anda
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar; 