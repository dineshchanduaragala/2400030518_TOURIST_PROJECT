// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 ADMIN CREDENTIALS (frontend only)
  const ADMIN = {
    email: "dinesh@gmail.com",
    password: "Adc@162006",
    code: "63025563",
  };

  const handleCredentials = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (email === ADMIN.email && password === ADMIN.password) {
        setStep(2);
      } else {
        setError("❌ Invalid email or password");
      }
      setLoading(false);
    }, 800);
  };

  const handleCode = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (code === ADMIN.code) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("role", "Admin");
        localStorage.setItem("userName", "Super Admin");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("authToken", "admin-static-token");

        navigate("/admin-dashboard");
      } else {
        setError("❌ Invalid 8-digit code");
        setCode("");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-logo">🔐 ADMIN LOGIN</div>

        {step === 1 ? (
          <form onSubmit={handleCredentials} className="login-form">
            <h2>Step 1: Admin Credentials</h2>

            <input
              type="email"
              placeholder="admin@tourism.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Checking..." : "Next →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCode} className="login-form">
            <h2>Step 2: 8-Digit Code</h2>

            <input
              type="text"
              placeholder="12345678"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))
              }
              maxLength={8}
              required
            />

            {error && <p className="error">{error}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setStep(1);
                  setCode("");
                }}
              >
                ← Back
              </button>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Verifying..." : "Login as Admin"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
