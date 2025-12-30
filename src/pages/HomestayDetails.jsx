// src/pages/HomestayDetails.jsx
import React, { useEffect, useState } from "react";
import "./HomestayDetails.css";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

export default function HomestayDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/public/homestays/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load homestay");
        setHomestay(data);
      } catch (err) {
        console.error("Homestay details error:", err);
        setError(err.message || "Error loading homestay");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <div className="page-loading">Loading homestay...</div>;
  if (error) return <div className="page-error">⚠ {error}</div>;
  if (!homestay) return <div className="page-error">Not found.</div>;

  return (
    <div className="details-container">
      <button
        className="back-btn"
        onClick={() => navigate("/tourist-dashboard")}
      >
        ← Back to Dashboard
      </button>

      {homestay.image && (
        <img
          src={homestay.image}
          alt={homestay.title}
          className="details-img"
        />
      )}

      <div className="details-content">
        <h1 className="details-title">{homestay.title}</h1>
        <p className="details-location">{homestay.location}</p>
        <p className="details-price">₹{homestay.price}/night</p>

        {homestay.description && (
          <div className="details-description">{homestay.description}</div>
        )}

        {homestay.amenities && homestay.amenities.length > 0 && (
          <>
            <h3 className="section-title">Amenities</h3>
            <ul className="amenities-list">
              {homestay.amenities.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </>
        )}

        {homestay.upiQrImage && (
          <div className="upi-section">
            <h3 className="section-title">💳 Pay Using UPI</h3>
            <p className="upi-info">
              Scan the QR code below and complete payment using any UPI app.
            </p>
            <img
              src={homestay.upiQrImage}
              alt="UPI QR Code"
              className="upi-qr-img"
            />
            <p className="upi-note">
              After payment, click <b>Book Now</b>. Host/Admin will approve your booking.
            </p>
          </div>
        )}

        <button
          className="book-btn"
          onClick={() => navigate(`/booking/${id}`)}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
