// src/pages/TouristDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TouristDashboard.css";
import { API_BASE_URL } from "../api";

export default function TouristDashboard() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const [homestays, setHomestays] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [guides, setGuides] = useState([]);

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const userName = localStorage.getItem("userName") || "Traveller";
  const userEmail = localStorage.getItem("userEmail") || "Unknown";
  const userMobile = localStorage.getItem("userMobile") || "Not Provided";
  const userAddress = localStorage.getItem("userAddress") || "Not Provided";
  const userAvatar =
    localStorage.getItem("userAvatar") ||
    "https://randomuser.me/api/portraits/men/75.jpg";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hsRes, attRes, guideRes] = await Promise.all([
          fetch(`${API_BASE_URL}/public/homestays`),
          fetch(`${API_BASE_URL}/public/attractions`),
          fetch(`${API_BASE_URL}/public/guides`),
        ]);

        const [hsData, attData, guideData] = await Promise.all([
          hsRes.json(),
          attRes.json(),
          guideRes.json(),
        ]);

        setHomestays(hsData || []);
        setAttractions(attData || []);
        setGuides(guideData || []);
      } catch (err) {
        console.error("Dashboard data error:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!userEmail || userEmail === "Unknown") return;

    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/tourist/bookings/${userEmail}`
        );
        const data = await res.json();
        setBookings(data || []);
      } catch (err) {
        console.error("Fetch bookings error:", err);
      }
    };

    fetchBookings();
  }, [userEmail]);

  const convertCoordsToPlace = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();

      if (data && data.address) {
        const { city, town, village, state } = data.address;

        const finalName =
          city || town || village
            ? `${city || town || village}, ${state || ""}`
            : state || "Unknown Location";

        setLocation(finalName);
      } else {
        setLocation("Unable to detect");
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
      setLocation("Error detecting location");
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    setLocation("Locating...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        convertCoordsToPlace(latitude, longitude);
      },
      (err) => {
        console.error("Location error:", err);
        alert("Please allow location access.");
        setLocation("Permission denied");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="logo">Tourist</h2>

        <ul className="menu">
          <li onClick={() => navigate("/tourist-dashboard")}>🏠 Dashboard</li>
          <li onClick={() => navigate("/homestays")}>🏡 Homestays</li>
          <li onClick={() => navigate("/attractions")}>📍 Attractions</li>
          <li onClick={() => navigate("/local-guides")}>🧭 Local Guides</li>
          <li onClick={() => navigate("/settings")}>⚙ Settings</li>
          <li className="logout-red" onClick={handleLogout}>
            🚪 Logout
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="top-nav">
          <h1>Welcome, {userName} 👋</h1>
          <img
            src={userAvatar}
            className="profile-img"
            onClick={() => setShowProfilePopup(true)}
            alt="profile"
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className="search-box-row">
          <input
            className="location-search"
            placeholder="🔍 Enter your location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button className="use-location-btn" onClick={handleUseLocation}>
            Use My Location
          </button>
        </div>

        <section>
          <h2 className="section-title">📖 My Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings yet</p>
          ) : (
            <div className="card-grid">
              {bookings.map((b) => (
                <div key={b._id} className="booking-card">
                  <h3>{b.homestayTitle}</h3>
                  <p>
                    {b.checkinDate} → {b.checkoutDate}
                  </p>
                  <p>Guests: {b.guests}</p>
                  <p>Total: ₹{b.totalPrice}</p>
                  <p>
                    <b>Payment:</b>{" "}
                    <span
                      className={`payment-status ${
                        b.paymentStatus === "Approved"
                          ? "approved"
                          : b.paymentStatus === "Rejected"
                          ? "rejected"
                          : "pending"
                      }`}
                    >
                      {b.paymentStatus || "Pending"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title">🏡 Recommended Homestays</h2>
          <div className="card-grid">
            {homestays.slice(0, 4).map((h) => (
              <div key={h._id || h.id} className="homestay-card">
                {h.image && (
                  <img src={h.image} className="card-img" alt={h.title} />
                )}
                <div className="card-content">
                  <h3>{h.title}</h3>
                  <p className="card-location">{h.location}</p>
                  <p className="price">₹{h.price}/night</p>

                  <div className="card-actions">
                    <button
                      className="details-btn secondary"
                      onClick={() => navigate(`/homestay/${h._id || h.id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="confirm-btn primary"
                      onClick={() => navigate(`/booking/${h._id || h.id}`)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="view-more-btn"
            onClick={() => navigate("/homestays")}
          >
            View All →
          </button>
        </section>

        <section>
          <h2 className="section-title">📍 Popular Attractions</h2>
          <div className="card-grid">
            {attractions.slice(0, 4).map((a) => (
              <div
                key={a._id || a.id}
                className="attraction-card"
                onClick={() => navigate("/attractions")}
              >
                {a.image && (
                  <img src={a.image} className="card-img" alt={a.name} />
                )}
                <h3>{a.name}</h3>
                <p>{a.location}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">🧭 Local Guides</h2>
          <div className="guide-grid">
            {guides.slice(0, 4).map((g) => (
              <div key={g._id || g.id} className="guide-card">
                <img
                  src={
                    g.profileImage ||
                    "https://randomuser.me/api/portraits/men/32.jpg"
                  }
                  alt="guide"
                />
                <div>
                  <h3>{g.name}</h3>
                  <p>{g.email}</p>
                  <button
                    className="confirm-btn"
                    style={{ width: "100%", marginTop: "6px" }}
                    onClick={() => navigate("/local-guides")}
                  >
                    Hire Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showProfilePopup && (
        <div className="profile-popup-overlay">
          <div className="profile-popup">
            <img src={userAvatar} className="popup-avatar" alt="profile" />
            <h2>{userName}</h2>
            <p>
              <b>Email:</b> {userEmail}
            </p>
            <p>
              <b>Mobile:</b> {userMobile}
            </p>
            <p>
              <b>Address:</b> {userAddress}
            </p>

            <button
              className="popup-btn"
              onClick={() => {
                setShowProfilePopup(false);
                navigate("/settings");
              }}
            >
              Go to Settings
            </button>

            <p
              className="close-popup"
              onClick={() => setShowProfilePopup(false)}
            >
              Close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
