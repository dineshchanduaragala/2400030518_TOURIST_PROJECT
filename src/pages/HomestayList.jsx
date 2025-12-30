// src/pages/HomestayList.jsx
import React, { useEffect, useState } from "react";
import "./HomestayList.css";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";

export default function HomestayList() {
  const navigate = useNavigate();

  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [location, setLocation] = useState("");

  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    const fetchHomestays = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/public/homestays`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load homestays");
        setHomestays(data);
      } catch (err) {
        console.error("Homestays load error:", err);
        setError(err.message || "Error loading homestays");
      } finally {
        setLoading(false);
      }
    };

    fetchHomestays();
  }, []);

  const convertCoordsToPlace = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();

      if (data?.address) {
        const { city, town, village, state } = data.address;
        const place =
          city || town || village
            ? `${city || town || village}, ${state || ""}`
            : state || "";

        setLocation(place);
      }
    } catch (err) {
      console.error("Reverse geocode failed", err);
    } finally {
      setDetectingLocation(false);
    }
  };

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        convertCoordsToPlace(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        alert("Location permission denied");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const filtered = homestays
    .filter((h) => {
      const title = (h.title || "").toLowerCase();
      const loc = (h.location || "").toLowerCase();
      const price = Number(h.price || 0);

      const matchLocation = loc.includes(location.toLowerCase());
      const matchSearch =
        title.includes(search.toLowerCase()) ||
        loc.includes(search.toLowerCase());
      const matchPrice = price <= maxPrice;

      return matchLocation && matchSearch && matchPrice;
    })
    .sort((a, b) => {
      if (!location) return 0;

      const locA = (a.location || "").toLowerCase();
      const locB = (b.location || "").toLowerCase();
      const userLoc = location.toLowerCase();

      const aMatch = locA.includes(userLoc);
      const bMatch = locB.includes(userLoc);

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

  if (loading) return <div className="page-loading">Loading homestays...</div>;
  if (error) return <div className="page-error">⚠ {error}</div>;

  return (
    <div className="listing-container">
      <button
        className="back-btn"
        onClick={() => navigate("/tourist-dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1 className="title">🏡 Homestays Near You</h1>

      <div className="filters-row">
        <input
          className="search-box"
          placeholder="Search homestays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          className="search-box"
          placeholder="Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button
          className="use-location-btn"
          onClick={detectUserLocation}
          disabled={detectingLocation}
        >
          {detectingLocation ? "Detecting..." : "📍 Use My Location"}
        </button>

        <div className="price-filter">
          <label>Max Price: ₹{maxPrice}</label>
          <input
            type="range"
            min="500"
            max="10000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="listing-grid">
        {filtered.map((h) => {
          const homestayId = h._id || h.id;

          return (
            <div className="listing-card" key={homestayId}>
              {h.image && <img src={h.image} alt={h.title || "Homestay"} />}
              <div className="card-content">
                <h3>{h.title}</h3>
                <p className="location">{h.location}</p>
                <p className="price">₹{h.price}/night</p>
                <div className="card-actions">
                  <button
                    className="details-btn secondary"
                    onClick={() => navigate(`/homestay/${homestayId}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="details-btn primary"
                    onClick={() => navigate(`/booking/${homestayId}`)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No homestays match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
