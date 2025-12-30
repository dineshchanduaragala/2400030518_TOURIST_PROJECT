// src/pages/HostLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import "./Login.css";

export default function HostLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: "Host",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Host login failed");
      }

      const { token, user } = data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("role", user.role);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userMobile", user.mobile || "");
      localStorage.setItem("userAvatar", user.profileImage || "");
      localStorage.setItem("userAddress", user.address || "");
      localStorage.setItem("isApproved", user.isApproved ? "true" : "false");

      navigate("/host/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Host login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container host-login">
      <div className="right-section">
        <div className="form-box">
          <h1 className="form-title">Host Login</h1>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleLogin}>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              className="form-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login as Host"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
