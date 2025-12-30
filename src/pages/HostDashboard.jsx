// src/pages/HostDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import "./HostDashboard.css";

export default function HostDashboard() {
  const navigate = useNavigate();
  const [homestays, setHomestays] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    amenities: "",
    image: "",
    upiQrImage: "",
  });

  const [offline, setOffline] = useState({
    guestName: "",
    guestEmail: "",
    homestayId: "",
    checkinDate: "",
    checkoutDate: "",
    guests: 1,
  });

  // ✅ NEW: Logout Function
  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated") || localStorage.getItem("role") !== "Host") {
      navigate("/host/login", { replace: true });
      return;
    }
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/host/dashboard`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch dashboard");
      }
      
      setHomestays(data.homestays || []);
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Host dashboard error:", err);
    }
  };

  const addHomestay = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/host/homestays`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          amenities: form.amenities
            ? form.amenities.split(",").map((a) => a.trim())
            : [],
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to add homestay");
      }

      alert("Homestay added (Pending admin approval)");
      setForm({
        title: "",
        location: "",
        price: "",
        description: "",
        amenities: "",
        image: "",
        upiQrImage: "",
      });
      fetchDashboard();
    } catch (err) {
      alert("Error adding homestay");
    }
  };

  const updateQr = async (id, qr) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/host/homestays/${id}/upi-qr`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          upiQrImage: qr,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update QR");
      }
      
      alert("UPI QR updated");
      fetchDashboard();
    } catch (err) {
      alert("Failed to update QR");
    }
  };

  const createOfflineBooking = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/host/offline-booking`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(offline),
      });

      if (!res.ok) {
        throw new Error("Offline booking failed");
      }
      
      alert("Offline booking added ✔");
      setOffline({
        guestName: "",
        guestEmail: "",
        homestayId: "",
        checkinDate: "",
        checkoutDate: "",
        guests: 1,
      });
      fetchDashboard();
    } catch (err) {
      alert("Offline booking failed");
    }
  };

  // ✅ NEW: Booking Status Update Function
  const updateBookingStatus = async (id, action) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/host/bookings/${id}/status/${action}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error("Failed to update booking status");
      }
      
      fetchDashboard();
    } catch (err) {
      alert("Failed to update booking status");
    }
  };

  // ✅ EXISTING: Payment Update Function
  const updatePayment = async (id, action) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/host/bookings/${id}/${action}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error("Failed to update payment");
      }
      
      fetchDashboard();
    } catch (err) {
      alert("Failed to update payment");
    }
  };

  return (
    <div className="host-dashboard">
      {/* ✅ NEW: Dashboard Header with Logout */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">🏠 Host Dashboard</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* ✅ NEW: Stats Section */}
      <section className="dashboard-section stats">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Homestays</h3>
            <p>{homestays.length}</p>
          </div>

          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p>{bookings.length}</p>
          </div>

          <div className="stat-card">
            <h3>Approved Bookings</h3>
            <p>{bookings.filter(b => b.status === "Approved").length}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h3 className="section-title">Add Homestay</h3>
        <div className="form-card">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            placeholder="Amenities (comma separated)"
            value={form.amenities}
            onChange={(e) => setForm({ ...form, amenities: e.target.value })}
          />
          <input
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <input
            placeholder="UPI QR Image URL"
            value={form.upiQrImage}
            onChange={(e) => setForm({ ...form, upiQrImage: e.target.value })}
          />
          <button className="primary-btn" onClick={addHomestay}>➕ Add Homestay</button>
        </div>
      </section>

      <section className="dashboard-section">
        <h3 className="section-title">Your Homestays</h3>
        <div className="cards-grid">
          {homestays.map((h) => (
            <div className="info-card" key={h._id}>
              <div className="card-header">
                <h4>{h.title}</h4>
                <span className={`status-badge ${h.approved ? 'approved' : 'pending'}`}>
                  {h.approved ? "Approved" : "Pending"}
                </span>
              </div>
              <p className="card-location">{h.location}</p>
              <p className="card-price">₹{h.price} / night</p>
              <input
                className="qr-input"
                placeholder="Update UPI QR Image URL"
                defaultValue={h.upiQrImage || ""}
                onBlur={(e) => updateQr(h._id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h3 className="section-title">Offline Booking (Walk-in)</h3>
        <div className="form-card">
          <input
            placeholder="Guest Name"
            value={offline.guestName}
            onChange={(e) =>
              setOffline({ ...offline, guestName: e.target.value })
            }
          />
          <input
            placeholder="Guest Email"
            value={offline.guestEmail}
            onChange={(e) =>
              setOffline({ ...offline, guestEmail: e.target.value })
            }
          />
          <select
            value={offline.homestayId}
            onChange={(e) =>
              setOffline({ ...offline, homestayId: e.target.value })
            }
          >
            <option value="">Select Homestay</option>
            {homestays.map((h) => (
              <option key={h._id} value={h._id}>
                {h.title}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={offline.checkinDate}
            onChange={(e) =>
              setOffline({ ...offline, checkinDate: e.target.value })
            }
          />
          <input
            type="date"
            value={offline.checkoutDate}
            onChange={(e) =>
              setOffline({ ...offline, checkoutDate: e.target.value })
            }
          />
          <input
            type="number"
            min="1"
            value={offline.guests}
            onChange={(e) =>
              setOffline({ ...offline, guests: e.target.value })
            }
          />
          <button className="primary-btn" onClick={createOfflineBooking}>➕ Add Offline Booking</button>
        </div>
      </section>

      <section className="dashboard-section">
        <h3 className="section-title">Bookings</h3>
        <div className="cards-grid">
          {bookings.map((b) => (
            <div className="info-card booking-card" key={b._id}>
              <div className="card-header">
                <h4>{b.homestayTitle}</h4>
                <span className={`booking-type ${b.bookingType === 'OFFLINE' ? 'offline' : 'online'}`}>
                  {b.bookingType} Booking
                </span>
              </div>
              <p className="booking-dates">{b.checkinDate} → {b.checkoutDate}</p>
              <p className="booking-guests">Guests: {b.guests}</p>
              <p>Booking Status: <span className="status-badge">{b.status}</span></p>
              <p>Payment Status: 
                <span className={`payment-status ${b.paymentStatus?.toLowerCase() || 'pending'}`}>
                  {b.paymentStatus || "Pending"}
                </span>
              </p>

              {/* ✅ NEW: Booking Status Buttons (for ONLINE bookings) */}
              {b.bookingType === "ONLINE" && (
                <div className="action-buttons">
                  <button 
                    className="action-btn approve"
                    onClick={() => updateBookingStatus(b._id, "approve")}
                  >
                    📅 Approve Booking
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => updateBookingStatus(b._id, "reject")}
                  >
                    📅 Reject Booking
                  </button>
                </div>
              )}

              {/* ✅ EXISTING: Payment Buttons (for pending payments) */}
              {b.bookingType === "ONLINE" &&
                (b.paymentStatus === "Pending" || !b.paymentStatus) && (
                  <div className="action-buttons">
                    <button 
                      className="action-btn approve"
                      onClick={() => updatePayment(b._id, "approve")}
                    >
                      💰 Approve Payment
                    </button>
                    <button 
                      className="action-btn reject"
                      onClick={() => updatePayment(b._id, "reject")}
                    >
                      💰 Reject Payment
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
