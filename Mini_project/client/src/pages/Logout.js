import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Navbar = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null); 
  };


  return (
    <nav className="navbar">
      <div className="logo">📖 StudySpace</div>
      <ul className="nav-links">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/calendar">Calendar</a></li>
        <li><a href="/analytics">Analytics</a></li>
        <li><button className="logout-btn" onClick={logout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;

