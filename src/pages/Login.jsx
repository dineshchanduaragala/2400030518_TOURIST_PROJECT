import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import { API_BASE_URL } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeIsSignup = location.pathname === "/signup";
  const [isSignup, setIsSignup] = useState(routeIsSignup);

  const [loginType, setLoginType] = useState("Tourist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileImageData, setProfileImageData] = useState("");

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsSignup(routeIsSignup);
  }, [routeIsSignup]);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePassword = (v) => v.length >= 6;
  const validateUsername = (v) => /^[A-Za-z ]{3,25}$/.test(v);
  const validateMobile = (v) => /^[0-9]{10}$/.test(v);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setProfileImageData("");
    const reader = new FileReader();
    reader.onloadend = () => setProfileImageData(reader.result);
    reader.readAsDataURL(file);
  };

  const storeSession = (user, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("role", user.role);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userMobile", user.mobile || "");
    localStorage.setItem("userAvatar", user.profileImage || "");
    localStorage.setItem("userAddress", user.address || "");
    localStorage.setItem("isApproved", user.isApproved ? "true" : "false");
  };

  const handleSignup = async () => {
    let errs = {};
    if (!validateEmail(email)) errs.email = "Invalid email";
    if (!validatePassword(password)) errs.password = "Min 6 char password";
    if (!validateUsername(username)) errs.username = "3-25 letters only";
    if (!validateMobile(mobile)) errs.mobile = "10 digit mobile";
    setErrors(errs);
    if (Object.keys(errs).length) return false;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: username,
          mobile,
          role: loginType,
          profileImage: profileImageData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.message || "Signup failed" });
        return false;
      }

      storeSession(data.user, data.token);
      return true;
    } catch {
      setErrors({ email: "Signup error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    let errs = {};
    if (!validateEmail(email)) errs.email = "Invalid email";
    if (!password) errs.password = "Enter password";
    setErrors(errs);
    if (Object.keys(errs).length) return false;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: loginType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.message || "Login failed" });
        return false;
      }

      storeSession(data.user, data.token);
      return true;
    } catch {
      setErrors({ email: "Something went wrong" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setErrors({});

    // 🔐 BLOCK ADMIN FROM NORMAL LOGIN / SIGNUP
    if (loginType === "Admin") {
      navigate("/admin-login");
      return;
    }

    const ok = isSignup ? await handleSignup() : await handleLogin();

    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const role = localStorage.getItem("role");
    const approved = localStorage.getItem("isApproved") === "true";

    if (role === "Local Guide") {
      if (!approved) alert("Pending Admin Approval");
      navigate("/local-guide-dashboard", { replace: true });
    } else if (role === "Host") {
      navigate("/host/dashboard", { replace: true });
    } else {
      navigate("/tourist-dashboard", { replace: true });
    }
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
          className="left-img"
          alt="travel"
        />
        <div className="left-overlay">
          <h1 className="left-title">Discover Amazing Stays</h1>
          <p className="left-subtitle">Let's Find Your Adventure!</p>
        </div>
      </div>

      <div className="right-section">
        <div className={`form-box ${shake ? "shake" : ""}`}>
          <h1 className="form-title">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>

          <label className="form-label">I am a</label>
          <select
            className="form-select"
            value={loginType}
            onChange={(e) => setLoginType(e.target.value)}
          >
            <option>Tourist</option>
            <option>Local Guide</option>
            <option>Host</option>
          </select>

          {isSignup && (
            <>
              <label className="form-label">Username</label>
              <input
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <p className="error-text">{errors.username}</p>
              )}

              <label className="form-label">Mobile</label>
              <input
                className="form-input"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              {errors.mobile && (
                <p className="error-text">{errors.mobile}</p>
              )}

              <label className="form-label">Profile Image</label>
              <input
                type="file"
                className="form-input"
                accept="image/*"
                onChange={handleImageChange}
              />
            </>
          )}

          <label className="form-label">Email</label>
          <input
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <label className="form-label">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          {errors.password && (
            <p className="error-text">{errors.password}</p>
          )}

          <button
            className="form-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>

          {/* 🔐 ADMIN LOGIN LINK */}
          <p style={{ textAlign: "center", marginTop: "12px" }}>
            Admin?{" "}
            <span
              style={{ color: "#4f46e5", cursor: "pointer", fontWeight: 600 }}
              onClick={() => navigate("/admin-login")}
            >
              Login here
            </span>
          </p>

          <p className="toggle-text">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <span
              className="toggle-link"
              onClick={() => {
                setErrors({});
                navigate(isSignup ? "/login" : "/signup");
                setIsSignup(!isSignup);
              }}
            >
              {isSignup ? "Login" : "Sign up"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
