import React, { useState } from "react";
import api from "../apiClient";
import "./Login.css";

const LoginPage = ({ setIsLoggedIn }) => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    try {
      if (tab === "login") {
        const res = await api.post("/login", { email, password });
        if (res.status === 200) {
          alert("Login successful!");
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.role);
          setIsLoggedIn(true);
        }
      } else {
        const res = await api.post("/register", { name, email, password });
        alert(res.data.msg);
      }
    } catch (error) {
      alert("Something went wrong.");
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="logo-icon">📖</div>
        <h1>StudySpace</h1>
        <p className="tagline">Your Personal Study Organizer</p>

        <div className="tab-buttons">
          <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>Login</button>
          <button className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>Register</button>
        </div>

        {tab === "register" && (
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="submit-btn" onClick={handleSubmit}>
          {tab === "register" ? "Create Account" : "Login"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
