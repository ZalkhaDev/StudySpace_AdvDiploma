import React from "react";
import "./Register.css";



export default function RegisterPage() {
  return (
    <div className="register-container">
      <h2>Register</h2>
      <form className="form">
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button>Register</button>
      </form>
    </div>
  );
}
