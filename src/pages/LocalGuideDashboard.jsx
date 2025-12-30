// src/pages/LocalGuideDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LocalGuideDashboard.css";
import { API_BASE_URL } from "../api";

export default function LocalGuideDashboard() {
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName") || "Local Guide";
  const userAvatar =
    localStorage.getItem("userAvatar") ||
    "https://randomuser.me/api/portraits/men/32.jpg";

  const [isApproved, setIsApproved] = useState(false);

  const token = localStorage.getItem("authToken") || "";
  const authHeaders = token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" };

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  const [profile, setProfile] = useState({
    bio: "",
    languages: [],
    expertise: [],
    basePrice: 0,
  });

  const [availabilityList, setAvailabilityList] = useState([]);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [slotMorning, setSlotMorning] = useState(false);
  const [slotEvening, setSlotEvening] = useState(false);

  const [portfolio, setPortfolio] = useState([]);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    imageData: "",
  });

  const [hireRequests, setHireRequests] = useState([]);

  const fetchApprovalStatus = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/guides/approval-status?email=${encodeURIComponent(
          userEmail
        )}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (res.ok) {
        setIsApproved(data.isApproved || false);
        localStorage.setItem("isApproved", data.isApproved ? "true" : "false");
      }
    } catch (error) {
      console.error("Approval status fetch error:", error);
    }
  };

  const fetchGuideData = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/guides/profile?email=${encodeURIComponent(userEmail)}`
      );
      const data = await res.json();
      if (res.ok) {
        setProfile({
          bio: data.bio || "",
          languages: data.languages || [],
          expertise: data.expertise || [],
          basePrice: data.basePrice || 0,
        });
        setAvailabilityList(data.availability || []);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHireRequests = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/guides/hire-requests?email=${encodeURIComponent(
          userEmail
        )}`
      );
      const data = await res.json();
      if (res.ok) setHireRequests(data || []);
    } catch (err) {
      console.error("Guide hire-requests error:", err);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/guides/portfolio?email=${encodeURIComponent(
          userEmail
        )}`
      );
      const data = await res.json();
      if (res.ok) setPortfolio(data);
    } catch (err) {
      console.error("Guide portfolio error:", err);
    }
  };

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { replace: true });
      return;
    }
    fetchApprovalStatus();
    fetchGuideData();
    fetchHireRequests();
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAvailability = async () => {
    if (!availabilityDate || (!slotMorning && !slotEvening)) {
      alert("Select date + at least one slot!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/guides/availability/add`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          email: userEmail,
          date: availabilityDate,
          morning: slotMorning,
          evening: slotEvening,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAvailabilityList(data.availability || []);
        setAvailabilityDate("");
        setSlotMorning(false);
        setSlotEvening(false);
        alert("Availability updated ✔");
      } else {
        alert(data.message || "Failed to add availability");
      }
    } catch (error) {
      console.error("Availability update error:", error);
    }
  };

  const handlePortfolioImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setPortfolioForm((prev) => ({ ...prev, imageData: reader.result }));
    reader.readAsDataURL(file);
  };

  const addPortfolioItem = async () => {
    if (!portfolioForm.title) {
      alert("Title required");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/guides/portfolio/add`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          email: userEmail,
          title: portfolioForm.title,
          description: portfolioForm.description,
          image: portfolioForm.imageData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPortfolio(data.portfolio || []);
        setPortfolioForm({ title: "", description: "", imageData: "" });
        alert("Portfolio item added ✔");
      } else {
        alert(data.message || "Failed to add portfolio item");
      }
    } catch (err) {
      console.error("Portfolio add error:", err);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/guides/hire-requests/${id}/status`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update status");
        return;
      }
      setHireRequests((prev) =>
        prev.map((r) => (r._id === id ? data.hire : r))
      );
    } catch (err) {
      console.error("Hire status error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (!isApproved) {
    return (
      <div className="guide-not-approved">
        <h2>⛔ Your Local Guide account is not approved yet</h2>
        <p>Please wait until Admin reviews your profile</p>
        <p>
          <button className="guide-status-btn" onClick={fetchApprovalStatus}>
            🔄 Check Status
          </button>
        </p>
        <button className="guide-home-btn" onClick={handleLogout}>
          Back to Home
        </button>
      </div>
    );
  }

  if (loading) return <p className="guide-loading">Loading...</p>;

  const pendingCount = hireRequests.filter(
    (r) => r.status === "Pending"
  ).length;
  const approvedCount = hireRequests.filter(
    (r) => r.status === "Approved"
  ).length;
  const completedCount = hireRequests.filter(
    (r) => r.status === "Completed"
  ).length;
  const totalEarnings = hireRequests
    .filter((r) => r.status === "Completed")
    .reduce((sum, r) => sum + (r.agreedPrice || 0), 0);

  return (
    <div className="guide-dash-container">
      <aside className="guide-sidebar">
        <div className="guide-profile">
          <img src={userAvatar} alt="profile" />
          <h3>{userName}</h3>
          <p className="guide-role-label">Local Guide</p>
        </div>

        <ul className="guide-menu">
          <li
            className={activeSection === "overview" ? "active" : ""}
            onClick={() => setActiveSection("overview")}
          >
            📊 Overview
          </li>
          <li
            className={activeSection === "hire-requests" ? "active" : ""}
            onClick={() => setActiveSection("hire-requests")}
          >
            📩 Hire Requests
          </li>
          <li
            className={activeSection === "availability" ? "active" : ""}
            onClick={() => setActiveSection("availability")}
          >
            📆 Availability
          </li>
          <li
            className={activeSection === "profile" ? "active" : ""}
            onClick={() => setActiveSection("profile")}
          >
            ⚙ Profile
          </li>
          <li
            className={activeSection === "portfolio" ? "active" : ""}
            onClick={() => setActiveSection("portfolio")}
          >
            📸 Portfolio
          </li>
          <li onClick={handleLogout}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="guide-main">
        {activeSection === "overview" && (
          <>
            <h2>Welcome {userName}! 🎉</h2>
            <p className="guide-subtext">
              Your profile is <b>approved</b> and visible to tourists.
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Pending Requests</h3>
                <p className="stat-value">{pendingCount}</p>
              </div>
              <div className="stat-card">
                <h3>Approved</h3>
                <p className="stat-value">{approvedCount}</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-value">{completedCount}</p>
              </div>
              <div className="stat-card">
                <h3>Total Earnings</h3>
                <p className="stat-value">₹{totalEarnings}</p>
              </div>
            </div>

            <h3 className="guide-section-title">Latest Hire Requests</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tourist</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hireRequests.slice(0, 5).map((r) => (
                    <tr key={r._id}>
                      <td>{r.touristName || "-"}</td>
                      <td>{r.touristEmail}</td>
                      <td>{r.message || "-"}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                  {hireRequests.length === 0 && (
                    <tr>
                      <td colSpan="4" className="data-table-empty">
                        No hire requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSection === "hire-requests" && (
          <>
            <h2>📩 Hire Requests</h2>
            <p className="section-subtext">
              Approve or reject tourist requests to hire you as a guide.
            </p>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tourist</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hireRequests.map((r) => (
                    <tr key={r._id}>
                      <td>{r.touristName || "-"}</td>
                      <td>{r.touristEmail}</td>
                      <td>{r.message || "-"}</td>
                      <td>{r.status}</td>
                      <td>
                        {r.status === "Pending" && (
                          <>
                            <button
                              className="small-btn"
                              onClick={() =>
                                updateRequestStatus(r._id, "Approved")
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="small-btn danger"
                              onClick={() =>
                                updateRequestStatus(r._id, "Rejected")
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {hireRequests.length === 0 && (
                    <tr>
                      <td colSpan="5" className="data-table-empty">
                        No hire requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSection === "profile" && (
          <>
            <h2>⚙ Account Profile</h2>

            <label>Email (Not Editable)</label>
            <input
              type="text"
              value={userEmail}
              disabled
              className="input-disabled"
            />

            <label>Name</label>
            <input
              value={userName}
              onChange={(e) => {
                setProfile({ ...profile, name: e.target.value });
                localStorage.setItem("userName", e.target.value);
              }}
              placeholder="Enter full name"
            />

            <label>Profile Image URL</label>
            <input
              value={userAvatar}
              onChange={(e) => {
                setProfile({ ...profile, profileImage: e.target.value });
                localStorage.setItem("userAvatar", e.target.value);
              }}
              placeholder="Paste image link"
            />
            {userAvatar && (
              <img
                src={userAvatar}
                alt="Preview"
                className="profile-preview"
              />
            )}

            <label>Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
            />

            <label>Languages (comma separated)</label>
            <input
              value={(profile.languages || []).join(",")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  languages: e.target.value
                    .split(",")
                    .map((i) => i.trim())
                    .filter(Boolean),
                })
              }
            />

            <label>Expertise (comma separated)</label>
            <input
              value={(profile.expertise || []).join(",")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  expertise: e.target.value
                    .split(",")
                    .map((i) => i.trim())
                    .filter(Boolean),
                })
              }
            />

            <label>Base Price ₹/day</label>
            <input
              type="number"
              value={profile.basePrice}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  basePrice: Number(e.target.value),
                })
              }
            />

            <button
              className="action-btn"
              onClick={async () => {
                const res = await fetch(
                  `${API_BASE_URL}/guides/profile/update`,
                  {
                    method: "PATCH",
                    headers: authHeaders,
                    body: JSON.stringify({
                      email: userEmail,
                      profile: {
                        ...profile,
                        name: userName,
                        profileImage: userAvatar,
                      },
                    }),
                  }
                );
                const data = await res.json();
                if (res.ok) {
                  alert("Profile updated successfully 🎉");
                } else {
                  alert(data.message || "Error updating profile ❌");
                }
              }}
            >
              💾 Save Changes
            </button>
          </>
        )}

        {activeSection === "availability" && (
          <>
            <h2>📆 Set Availability</h2>

            <input
              type="date"
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
            />

            <div className="slot-container">
              <label>
                <input
                  type="checkbox"
                  checked={slotMorning}
                  onChange={(e) => setSlotMorning(e.target.checked)}
                />
                Morning
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={slotEvening}
                  onChange={(e) => setSlotEvening(e.target.checked)}
                />
                Evening
              </label>
            </div>

            <button className="add-btn" onClick={addAvailability}>
              ➕ Add / Update Availability
            </button>

            <h3 className="guide-section-title">Upcoming Availability</h3>
            <ul className="availability-list">
              {availabilityList.length === 0 ? (
                <p>No availability added yet</p>
              ) : (
                availabilityList.map((a, i) => (
                  <li key={i}>
                    <b>{a.date}</b> —{" "}
                    {[a.morning ? "Morning" : "", a.evening ? "Evening" : ""]
                      .filter(Boolean)
                      .join(" & ")}
                  </li>
                ))
              )}
            </ul>
          </>
        )}

        {activeSection === "portfolio" && (
          <>
            <h2>📸 Portfolio</h2>
            <p className="section-subtext">
              Add tour photos and experiences that tourists will see.
            </p>

            <div className="admin-form">
              <input
                placeholder="Title"
                value={portfolioForm.title}
                onChange={(e) =>
                  setPortfolioForm((p) => ({ ...p, title: e.target.value }))
                }
              />
              <textarea
                placeholder="Description"
                value={portfolioForm.description}
                onChange={(e) =>
                  setPortfolioForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
              <input
                type="file"
                accept="image/*"
                onChange={handlePortfolioImage}
              />
              <button className="approve-btn" onClick={addPortfolioItem}>
                + Add Portfolio Item
              </button>
            </div>

            <div className="portfolio-grid">
              {portfolio.map((item) => (
                <div key={item._id} className="portfolio-card">
                  {item.image && <img src={item.image} alt={item.title} />}
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
              {portfolio.length === 0 && (
                <p className="portfolio-empty">No portfolio items yet.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
