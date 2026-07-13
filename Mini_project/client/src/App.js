import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import api from "./apiClient";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import NewTask from "./pages/NewTask";
import EditTask from "./pages/EditTask";
import LoginPage from "./pages/LoginPage";
import "./pages/StudySpace.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  // Restore login state from localStorage on app startup
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    if (token) {
      setIsLoggedIn(true);
      setRole(savedRole);
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });
      if (res.status === 200) {
        setIsLoggedIn(true);
        setRole(res.data.role);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Top Navigation Bar */}
        <header className="navbar">
          <div className="logo">
            <div className="logo-icon">📖</div>
            <div className="logo-text">
              <h2>StudySpace</h2>
              <p>Your Personal Study Organizer</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => (isActive ? "active" : "")}>
              Calendar
            </NavLink>
            {role === "admin" && (
              <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
                Analytics
              </NavLink>
            )}
          </nav>

          <div className="nav-right">
            <NavLink to="/newtask" className="new-task">
              <span>✨</span> + New Task
            </NavLink>
            {isLoggedIn && (
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container">
          <Routes>
            {/* Public route */}
            <Route
              path="/"
              element={<LoginPage onLogin={handleLogin} setIsLoggedIn={setIsLoggedIn} />}
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
            />
            <Route
              path="/calendar"
              element={isLoggedIn ? <Calendar /> : <Navigate to="/" />}
            />
            <Route
              path="/analytics"
              element={isLoggedIn && role === "admin" ? <Analytics /> : <Navigate to="/" />}
            />
            <Route
              path="/newtask"
              element={isLoggedIn ? <NewTask /> : <Navigate to="/" />}
            />
            <Route
              path="/edit/:id"
              element={isLoggedIn ? <EditTask /> : <Navigate to="/" />}  
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
