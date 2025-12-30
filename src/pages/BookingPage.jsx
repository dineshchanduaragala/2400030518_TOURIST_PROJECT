// src/pages/BookingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BookingPage.css";
import { API_BASE_URL } from "../api";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [homestay, setHomestay] = useState(null);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const touristEmail = localStorage.getItem("userEmail") || "";
  const touristName = localStorage.getItem("userName") || "";

  useEffect(() => {
    const fetchHomestay = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/public/homestays/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load homestay");
        setHomestay(data);
      } catch (err) {
        console.error("Homestay load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomestay();
  }, [id]);

  const getNights = () => {
    if (!checkin || !checkout) return 0;
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const diff = d2.getTime() - d1.getTime();
    const nights = diff / (1000 * 60 * 60 * 24);
    return nights > 0 ? nights : 0;
  };

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!checkin || !checkout) {
      alert("Select both check-in and check-out dates");
      setIsProcessing(false);
      return;
    }

    if (!touristEmail) {
      alert("Please login again");
      navigate("/login");
      setIsProcessing(false);
      return;
    }

    if (!homestay) {
      alert("Homestay not found");
      setIsProcessing(false);
      return;
    }

    const nights = getNights();
    if (nights <= 0) {
      alert("Checkout date must be after check-in date");
      setIsProcessing(false);
      return;
    }

    const totalPrice = nights * Number(homestay.price || 0);

    try {
      const res = await fetch(`${API_BASE_URL}/tourist/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          touristEmail,
          touristName,
          homestayId: id,
          homestayTitle: homestay.title,
          checkinDate: checkin,
          checkoutDate: checkout,
          guests: Number(guests),
          totalPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to create booking");
        setIsProcessing(false);
        return;
      }

      setBookingData({
        title: homestay.title,
        nights,
        totalPrice,
        checkinDate: checkin,
        checkoutDate: checkout,
        guests: Number(guests),
      });

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Booking create error:", err);
      alert("Error creating booking");
      setIsProcessing(false);
    }
  };

  const handleContinueToDashboard = () => {
    setShowSuccessModal(false);
    navigate("/tourist-dashboard", { replace: true });
  };

  if (loading) {
    return <div className="booking-container">Loading...</div>;
  }

  if (!homestay) {
    return (
      <div className="booking-container">
        <h1 className="booking-title">Homestay not found</h1>
      </div>
    );
  }

  const nights = getNights();
  const totalPrice = nights * Number(homestay.price || 0);

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1 className="booking-title">{homestay.title}</h1>
        <p className="booking-location">{homestay.location}</p>
        <p className="booking-price">₹{homestay.price} / night</p>
      </div>

      {homestay.image && (
        <img
          src={homestay.image}
          alt={homestay.title}
          className="homestay-preview-img"
        />
      )}

      <div className="booking-box">
        <div className="date-inputs">
          <div className="input-group">
            <label>Check-in Date</label>
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Check-out Date</label>
            <input
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Guests</label>
          <input
            type="number"
            min="1"
            max={homestay.maxGuests || 10}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
        </div>

        {nights > 0 && (
          <div className="price-summary">
            <div className="summary-item">
              <span>Nights:</span>
              <b>{nights}</b>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <b>₹{totalPrice.toLocaleString()}</b>
            </div>
          </div>
        )}

        <button
          className={`confirm-btn ${nights > 0 ? "active" : ""}`}
          onClick={handleConfirm}
          disabled={nights <= 0 || isProcessing}
        >
          {isProcessing ? "Processing..." : "Confirm Booking"}
        </button>
      </div>

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-confetti">🎉</div>
            <h2 className="success-title">Congratulations!</h2>
            <p className="success-message">
              Your booking for <b>{bookingData?.title}</b> has been created successfully!
            </p>

            <div className="booking-details">
              <div className="detail-item">
                <span>📅</span>
                <span>{bookingData?.checkinDate} → {bookingData?.checkoutDate}</span>
              </div>
              <div className="detail-item">
                <span>👥</span>
                <span>{bookingData?.guests} guest{bookingData?.guests > 1 ? "s" : ""}</span>
              </div>
              <div className="detail-item">
                <span>💰</span>
                <span>Total: ₹{bookingData?.totalPrice?.toLocaleString()}</span>
              </div>
            </div>

            <button className="dashboard-btn" onClick={handleContinueToDashboard}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
