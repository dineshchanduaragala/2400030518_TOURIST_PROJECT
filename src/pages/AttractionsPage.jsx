// src/pages/AttractionsPage.jsx
import React, { useEffect, useState } from "react";
import "./AttractionsPage.css";
import { API_BASE_URL } from "../api";

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/public/attractions`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load attractions");
        setAttractions(data);
      } catch (err) {
        console.error("Attractions fetch error:", err);
        setError(err.message || "Error loading attractions");
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading attractions...</div>;
  }

  if (error) {
    return <div className="page-error">⚠ {error}</div>;
  }

  return (
    <div className="attractions-page">
      <div className="page-header">
        <h1 className="page-title">Popular Attractions</h1>
        <p className="page-subtitle">
          All attractions below are added and managed by Admin.
        </p>
      </div>

      {attractions.length === 0 ? (
        <div className="empty-state">
          <p>No attractions found yet.</p>
        </div>
      ) : (
        <div className="card-grid">
          {attractions.map((a) => (
            <div key={a._id} className="attraction-card">
              {a.image && (
                <div className="card-image-container">
                  <img src={a.image} alt={a.name} className="card-img" />
                </div>
              )}
              <div className="card-content">
                <h3 className="card-title">{a.name}</h3>
                <p className="card-location">{a.location}</p>
                {a.description && (
                  <p className="card-desc">
                    {a.description.length > 120
                      ? a.description.slice(0, 120) + "..."
                      : a.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
