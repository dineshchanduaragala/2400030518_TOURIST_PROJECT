// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("role");

  const handleGetStarted = () => {
    if (!isLoggedIn) {
      return navigate("/login");
    }

    if (role === "Admin") return navigate("/admin-dashboard");
    if (role === "Local Guide") return navigate("/guide-dashboard");
    return navigate("/tourist-dashboard");
  };

  return (
    <div className="home-page">
      <header className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Homestays, Local Guides & Hidden Attractions</h1>
          <p className="hero-subtitle">
            A tourism platform where tourists find curated homestays and
            experiences, local guides get bookings, and admins manage
            everything from one place.
          </p>

          <button className="primary-btn hero-btn" onClick={handleGetStarted}>
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </button>

          {!isLoggedIn && (
            <p className="hero-login-text">
              Already a member?{" "}
              <span
                className="hero-link"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
              {" / "}
              <span
                className="hero-link"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </span>
            </p>
          )}
        </div>
      </header>

      <section className="home-section tourist-section">
        <div className="section-content">
          <h2 className="section-title">For Tourists</h2>
          <p className="section-text">
            Book verified homestays, explore admin-approved attractions and
            connect with trusted local guides. All content you see is added &
            verified by Admin.
          </p>
        </div>
      </section>

      <section className="home-section guide-section">
        <div className="section-content">
          <h2 className="section-title">For Local Guides</h2>
          <p className="section-text">
            Create an account as Local Guide, wait for admin approval, and then
            manage your tours, availability and earnings from your dashboard.
          </p>
        </div>
      </section>

      <section className="home-section admin-section">
        <div className="section-content">
          <h2 className="section-title">Admin Control</h2>
          <p className="section-text">
            Admin can add homestays, attractions, approve or reject local
            guides, and view bookings — ensuring full control on the platform.
          </p>
        </div>
      </section>
    </div>
  );
}
