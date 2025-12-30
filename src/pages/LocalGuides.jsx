// src/pages/LocalGuides.jsx
import React, { useEffect, useState } from "react";
import "./LocalGuides.css";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";

export default function LocalGuides() {
  const navigate = useNavigate();

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedGuide, setSelectedGuide] = useState(null);
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/public/guides`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load guides");
        setGuides(data);
      } catch (err) {
        console.error("Guides load error:", err);
        setError(err.message || "Error loading guides");
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const handleHire = async () => {
    if (!selectedGuide) return;

    const touristEmail = localStorage.getItem("userEmail") || "";
    const touristName = localStorage.getItem("userName") || "";

    if (!touristEmail) {
      alert("Please login again.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/guides/hire-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: selectedGuide._id || selectedGuide.id,
          touristEmail,
          touristName,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to send hire request");
        return;
      }

      setShowSuccessModal(true);
      setSelectedGuide(null);
      setMessage("");
    } catch (err) {
      console.error("Hire guide error:", err);
      alert("Error sending hire request");
    }
  };

  const handleContinueToDashboard = () => {
    setShowSuccessModal(false);
    navigate("/tourist-dashboard");
  };

  if (loading) return <div className="page-loading">Loading local guides...</div>;
  if (error) return <div className="page-error">⚠ {error}</div>;

  return (
    <div className="local-guides-page">
      <button
        className="back-btn"
        onClick={() => navigate("/tourist-dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1 className="page-title">🧭 Local Guides</h1>
      <p className="page-subtitle">
        All guides listed here are approved by Admin and verified.
      </p>

      {guides.length === 0 ? (
        <p className="no-guides-text">No guides found. Check back later!</p>
      ) : (
        <div className="guide-grid">
          {guides.map((g) => (
            <div
              key={g._id || g.id}
              className="guide-card"
              onClick={() => setSelectedGuide(g)}
            >
              <img
                src={g.profileImage || "https://via.placeholder.com/80"}
                alt={g.name}
                className="guide-avatar"
              />
              <div className="guide-info">
                <h3>{g.name}</h3>
                <p className="guide-role">Local Guide</p>
                {g.location && (
                  <p className="guide-location">📍 {g.location}</p>
                )}
                {g.languages && g.languages.length > 0 && (
                  <p className="guide-languages">
                    🌐 {g.languages.join(", ")}
                  </p>
                )}
                {typeof g.basePrice === "number" && (
                  <p className="guide-price">💰 From ₹{g.basePrice}/day</p>
                )}
                {typeof g.rating === "number" && g.rating > 0 && (
                  <p className="guide-rating">⭐ {g.rating.toFixed(1)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedGuide && (
        <div className="guide-hire-modal-overlay">
          <div className="guide-hire-modal">
            <h2>Hire {selectedGuide.name}</h2>
            <img
              src={
                selectedGuide.profileImage || "https://via.placeholder.com/80"
              }
              alt={selectedGuide.name}
              className="guide-modal-avatar"
            />

            {selectedGuide.location && (
              <p>
                <b>📍 Location:</b> {selectedGuide.location}
              </p>
            )}
            {typeof selectedGuide.basePrice === "number" && (
              <p>
                <b>💰 Base Price:</b> ₹{selectedGuide.basePrice}/day
              </p>
            )}
            {selectedGuide.languages && selectedGuide.languages.length > 0 && (
              <p>
                <b>🌐 Languages:</b> {selectedGuide.languages.join(", ")}
              </p>
            )}

            <label className="message-label">
              Message / Trip Details
            </label>
            <textarea
              className="guide-message-box"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your trip dates, places to visit, group size..."
              rows="4"
            />

            <div className="guide-modal-actions">
              <button className="confirm-btn" onClick={handleHire}>
                Send Hire Request
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setSelectedGuide(null);
                  setMessage("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-confetti">✅</div>
            <h2>Hire Request Sent!</h2>
            <p>
              Your request has been sent to the guide successfully. They will
              review and respond soon!
            </p>
            <button
              className="dashboard-btn"
              onClick={handleContinueToDashboard}
            >
              Back to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
