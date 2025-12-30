// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./AdminDashboard.css";
import { API_BASE_URL } from "../api";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [users, setUsers] = useState({});
  const [guides, setGuides] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [attractions, setAttractions] = useState([]);

  const [attractionForm, setAttractionForm] = useState({
    name: "",
    location: "",
    description: "",
    imageData: "",
  });

  const [homestayForm, setHomestayForm] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    amenities: "",
    imageData: "",
    upiQrImage: "",
  });

  const [editingHomestayId, setEditingHomestayId] = useState(null);
  const [editingAttractionId, setEditingAttractionId] = useState(null);

  const [editingUserEmail, setEditingUserEmail] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    mobile: "",
    role: "",
    approved: false,
  });

  const adminName = localStorage.getItem("userName") || "Admin";
  const token = localStorage.getItem("authToken") || "";

  const authHeaders = useMemo(
    () =>
      token
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        : { "Content-Type": "application/json" },
    [token]
  );

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data);
      const guideList = Object.entries(data)
        .filter(([_, u]) => u.role === "Local Guide")
        .map(([email, u]) => ({ email, ...u }));
      setGuides(guideList);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  const fetchHomestays = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/homestays`, {
        headers: authHeaders,
      });
      const data = await res.json();
      setHomestays(data);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  const fetchAttractions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/attractions`, {
        headers: authHeaders,
      });
      const data = await res.json();
      setAttractions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAttractions([]);
    }
  }, [authHeaders]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: authHeaders,
      });
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchUsers();
    fetchHomestays();
    fetchAttractions();
    fetchBookings();
  }, [fetchUsers, fetchHomestays, fetchAttractions, fetchBookings]);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "homestay") {
        setHomestayForm((prev) => ({ ...prev, imageData: reader.result }));
      } else if (type === "upi-qr") {
        setHomestayForm((prev) => ({ ...prev, upiQrImage: reader.result }));
      } else {
        setAttractionForm((prev) => ({ ...prev, imageData: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addHomestay = async () => {
    try {
      const payload = {
        title: homestayForm.title,
        location: homestayForm.location,
        price: Number(homestayForm.price),
        image: homestayForm.imageData,
        description: homestayForm.description,
        amenities: homestayForm.amenities
          ? homestayForm.amenities.split(",").map((a) => a.trim())
          : [],
        upiQrImage: homestayForm.upiQrImage || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/admin/homestays`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to add homestay");
        return;
      }

      alert("Homestay Added ✔ (Pending Approval)");
      setHomestayForm({
        title: "",
        location: "",
        price: "",
        description: "",
        amenities: "",
        imageData: "",
        upiQrImage: "",
      });
      setEditingHomestayId(null);
      fetchHomestays();
    } catch (err) {
      console.error("Add homestay error:", err);
      alert("Error adding homestay");
    }
  };

  const updateHomestay = async (id) => {
    try {
      const payload = {
        title: homestayForm.title,
        location: homestayForm.location,
        price: Number(homestayForm.price),
        image: homestayForm.imageData || undefined,
        description: homestayForm.description,
        amenities: homestayForm.amenities
          ? homestayForm.amenities.split(",").map((a) => a.trim())
          : [],
        upiQrImage: homestayForm.upiQrImage || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/admin/homestays/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update homestay");
        return;
      }

      alert("Homestay Updated ✔");
      setHomestayForm({
        title: "",
        location: "",
        price: "",
        description: "",
        amenities: "",
        imageData: "",
        upiQrImage: "",
      });
      setEditingHomestayId(null);
      fetchHomestays();
    } catch (err) {
      console.error("Update homestay error:", err);
      alert(`Error updating homestay: ${err.message}`);
    }
  };

  const editHomestay = (homestay) => {
    const homestayId = homestay._id || homestay.id;
    setEditingHomestayId(homestayId);
    setHomestayForm({
      title: homestay.title || "",
      location: homestay.location || "",
      price: homestay.price || "",
      description: homestay.description || "",
      amenities: Array.isArray(homestay.amenities)
        ? homestay.amenities.join(", ")
        : homestay.amenities || "",
      imageData: homestay.image || "",
      upiQrImage: homestay.upiQrImage || "",
    });
  };

  const cancelEditHomestay = () => {
    setEditingHomestayId(null);
    setHomestayForm({
      title: "",
      location: "",
      price: "",
      description: "",
      amenities: "",
      imageData: "",
      upiQrImage: "",
    });
  };

  const addAttraction = async () => {
    try {
      const payload = {
        name: attractionForm.name,
        location: attractionForm.location,
        image: attractionForm.imageData,
        description: attractionForm.description,
      };

      const res = await fetch(`${API_BASE_URL}/admin/attractions`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to add attraction");
        return;
      }

      alert("Attraction Added ✔");
      setAttractionForm({
        name: "",
        location: "",
        description: "",
        imageData: "",
      });
      fetchAttractions();
    } catch (err) {
      console.error("Add attraction error:", err);
      alert("Error adding attraction");
    }
  };

  const updateAttraction = async (id) => {
    try {
      const payload = {
        name: attractionForm.name,
        location: attractionForm.location,
        image: attractionForm.imageData || undefined,
        description: attractionForm.description,
      };

      const res = await fetch(`${API_BASE_URL}/admin/attractions/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update attraction");
        return;
      }

      alert("Attraction Updated ✔");
      setAttractionForm({
        name: "",
        location: "",
        description: "",
        imageData: "",
      });
      setEditingAttractionId(null);
      fetchAttractions();
    } catch (err) {
      console.error("Update attraction error:", err);
      alert(`Error updating attraction: ${err.message}`);
    }
  };

  const editAttraction = (attraction) => {
    const attractionId = attraction._id || attraction.id;
    setEditingAttractionId(attractionId);
    setAttractionForm({
      name: attraction.name || "",
      location: attraction.location || "",
      description: attraction.description || "",
      imageData: attraction.image || "",
    });
  };

  const cancelEditAttraction = () => {
    setEditingAttractionId(null);
    setAttractionForm({
      name: "",
      location: "",
      description: "",
      imageData: "",
    });
  };

  const approveGuide = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/approve`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to approve guide");
        return;
      }

      alert("Local Guide Approved ✔");
      fetchUsers();
    } catch (err) {
      console.error("Approve guide error:", err);
      alert("Error approving guide");
    }
  };

  const approveHomestay = async (id) => {
    const homestayId = id._id || id.id || id;
    await fetch(`${API_BASE_URL}/admin/homestays/approve/${homestayId}`, {
      method: "PATCH",
      headers: authHeaders,
    });
    fetchHomestays();
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const itemId = id._id || id.id || id;
      const url =
        type === "homestay"
          ? `${API_BASE_URL}/admin/homestays/${itemId}`
          : `${API_BASE_URL}/admin/attractions/${itemId}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      if (type === "homestay") fetchHomestays();
      else fetchAttractions();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update booking status");
        return;
      }
      fetchBookings();
    } catch (err) {
      alert("Error updating booking status");
    }
  };

  const approvePayment = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/bookings/${id}/approve-payment`,
        {
          method: "PUT",
          headers: authHeaders,
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to approve payment");
        return;
      }
      fetchBookings();
      alert("Payment Approved ✔");
    } catch (err) {
      console.error(err);
      alert("Error approving payment");
    }
  };

  const rejectPayment = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/bookings/${id}/reject-payment`,
        {
          method: "PUT",
          headers: authHeaders,
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to reject payment");
        return;
      }
      fetchBookings();
      alert("Payment Rejected ✔");
    } catch (err) {
      console.error(err);
      alert("Error rejecting payment");
    }
  };

  const deleteBooking = async (id) => {
    if (
      !window.confirm(
        "Delete this booking permanently? This is for test/fake bookings only."
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      fetchBookings();
      alert("Booking deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting booking");
    }
  };

  const deleteUser = async (email) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${email}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const editUser = (email, user) => {
    setEditingUserEmail(email);
    setUserForm({
      name: user.name || "",
      mobile: user.mobile || "",
      role: user.role || "",
      approved: user.approved || false,
    });
  };

  const updateUser = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${editingUserEmail}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(userForm),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Update failed");
        return;
      }

      setEditingUserEmail(null);
      fetchUsers();
    } catch (err) {
      console.error("Update user error:", err);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="admin-menu">
          <li
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activeSection === "users" ? "active" : ""}
            onClick={() => setActiveSection("users")}
          >
            Manage Users
          </li>
          <li
            className={activeSection === "guides" ? "active" : ""}
            onClick={() => setActiveSection("guides")}
          >
            Manage Guides
          </li>
          <li
            className={activeSection === "homestays" ? "active" : ""}
            onClick={() => setActiveSection("homestays")}
          >
            Manage Homestays
          </li>
          <li
            className={activeSection === "attractions" ? "active" : ""}
            onClick={() => setActiveSection("attractions")}
          >
            Manage Attractions
          </li>
          <li
            className={activeSection === "bookings" ? "active" : ""}
            onClick={() => setActiveSection("bookings")}
          >
            Manage Bookings
          </li>
          <li className="logout-red" onClick={logout}>
            Logout
          </li>
        </ul>
      </aside>

      <main className="admin-main-content">
        <h1 className="admin-title">Welcome {adminName}</h1>

        {activeSection === "dashboard" && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <h2>Guides</h2>
              <p>{guides.length}</p>
            </div>
            <div className="admin-stat-card">
              <h2>Homestays</h2>
              <p>{homestays.length}</p>
            </div>
            <div className="admin-stat-card">
              <h2>Attractions</h2>
              <p>{attractions.length}</p>
            </div>
            <div className="admin-stat-card">
              <h2>Bookings</h2>
              <p>{bookings.length}</p>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <>
            <h2 className="admin-table-title">All Users</h2>

            {editingUserEmail && (
              <div className="admin-form">
                <h3 className="form-title">Edit User</h3>

                <input
                  placeholder="Name"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                />

                <input
                  placeholder="Mobile"
                  value={userForm.mobile}
                  onChange={(e) =>
                    setUserForm({ ...userForm, mobile: e.target.value })
                  }
                />

                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                >
                  <option value="Tourist">Tourist</option>
                  <option value="Host">Host</option>
                  <option value="Local Guide">Local Guide</option>
                </select>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={userForm.approved}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        approved: e.target.checked,
                      })
                    }
                  />{" "}
                  Approved
                </label>

                <div className="form-buttons">
                  <button className="approve-btn" onClick={updateUser}>
                    Update User
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => setEditingUserEmail(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Approved</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(users).map(([email, u]) => (
                  <tr key={email}>
                    <td>{email}</td>
                    <td>{u.name}</td>
                    <td>{u.mobile}</td>
                    <td>{u.role}</td>
                    <td>{u.approved ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="approve-btn small"
                        onClick={() => editUser(email, u)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn small"
                        onClick={() => deleteUser(email)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {Object.keys(users).length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {activeSection === "guides" && (
          <>
            <h2 className="admin-table-title">Local Guides</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((g) => (
                  <tr key={g.email}>
                    <td>{g.email}</td>
                    <td>{g.name}</td>
                    <td>{g.mobile}</td>
                    <td>{g.approved ? "Approved" : "Pending"}</td>
                    <td>
                      {!g.approved && (
                        <button
                          className="approve-btn small"
                          onClick={() => approveGuide(g.email)}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {guides.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      No guides found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {activeSection === "homestays" && (
          <>
            <h2 className="admin-section-title">
              {editingHomestayId ? "Edit Homestay" : "Add Homestay"}
            </h2>
            <div className="admin-form">
              <input
                placeholder="Title"
                value={homestayForm.title}
                onChange={(e) =>
                  setHomestayForm({ ...homestayForm, title: e.target.value })
                }
              />
              <input
                placeholder="Location"
                value={homestayForm.location}
                onChange={(e) =>
                  setHomestayForm({
                    ...homestayForm,
                    location: e.target.value,
                  })
                }
              />
              <input
                placeholder="Price (per night)"
                value={homestayForm.price}
                onChange={(e) =>
                  setHomestayForm({
                    ...homestayForm,
                    price: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="Description"
                value={homestayForm.description}
                onChange={(e) =>
                  setHomestayForm({
                    ...homestayForm,
                    description: e.target.value,
                  })
                }
              />
              <input
                placeholder="Amenities (comma separated)"
                value={homestayForm.amenities}
                onChange={(e) =>
                  setHomestayForm({
                    ...homestayForm,
                    amenities: e.target.value,
                  })
                }
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "homestay")}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "upi-qr")}
              />
              {homestayForm.upiQrImage && (
                <div style={{ margin: "10px 0" }}>
                  <img
                    src={homestayForm.upiQrImage}
                    alt="UPI QR Preview"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                  <small>UPI QR Preview</small>
                </div>
              )}
              <div className="form-buttons">
                <button
                  className="approve-btn"
                  onClick={
                    editingHomestayId
                      ? () => updateHomestay(editingHomestayId)
                      : addHomestay
                  }
                >
                  {editingHomestayId ? "Update Homestay" : "+ Add Homestay"}
                </button>
                {editingHomestayId && (
                  <button className="delete-btn" onClick={cancelEditHomestay}>
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <h2 className="admin-table-title">Existing Homestays</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>UPI QR</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {homestays.map((h) => (
                  <tr key={h._id || h.id}>
                    <td>{h.title}</td>
                    <td>{h.location}</td>
                    <td>₹{h.price}</td>
                    <td>{h.approved ? "✔ Approved" : "Pending"}</td>
                    <td>
                      {h.upiQrImage && (
                        <img
                          src={h.upiQrImage}
                          alt="UPI QR"
                          className="qr-thumb"
                          style={{ maxWidth: "80px", maxHeight: "80px" }}
                        />
                      )}
                    </td>
                    <td>
                      {!h.approved && (
                        <button
                          className="approve-btn small"
                          onClick={() => approveHomestay(h)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="approve-btn small"
                        onClick={() => editHomestay(h)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn small"
                        onClick={() => deleteItem(h, "homestay")}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {homestays.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No homestays yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {activeSection === "attractions" && (
          <>
            <h2 className="admin-section-title">
              {editingAttractionId ? "Edit Attraction" : "Add Attraction"}
            </h2>
            <div className="admin-form">
              <input
                placeholder="Name"
                value={attractionForm.name}
                onChange={(e) =>
                  setAttractionForm({
                    ...attractionForm,
                    name: e.target.value,
                  })
                }
              />
              <input
                placeholder="Location"
                value={attractionForm.location}
                onChange={(e) =>
                  setAttractionForm({
                    ...attractionForm,
                    location: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="Description"
                value={attractionForm.description}
                onChange={(e) =>
                  setAttractionForm({
                    ...attractionForm,
                    description: e.target.value,
                  })
                }
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "attraction")}
              />
              <div className="form-buttons">
                <button
                  className="approve-btn"
                  onClick={
                    editingAttractionId
                      ? () => updateAttraction(editingAttractionId)
                      : addAttraction
                  }
                >
                  {editingAttractionId ? "Update Attraction" : "+ Add Attraction"}
                </button>
                {editingAttractionId && (
                  <button className="delete-btn" onClick={cancelEditAttraction}>
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <h2 className="admin-table-title">Existing Attractions</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attractions.map((a) => (
                  <tr key={a._id || a.id}>
                    <td>{a.name}</td>
                    <td>{a.location}</td>
                    <td>
                      <button
                        className="approve-btn small"
                        onClick={() => editAttraction(a)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn small"
                        onClick={() => deleteItem(a, "attraction")}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {attractions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="empty-cell">
                      No attractions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {activeSection === "bookings" && (
          <>
            <h2 className="admin-table-title">All Bookings</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tourist</th>
                  <th>Email</th>
                  <th>Homestay</th>
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Total (₹)</th>
                  <th>Booking Status</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.touristName || "-"}</td>
                    <td>{b.touristEmail}</td>
                    <td>{b.homestayTitle}</td>
                    <td>
                      {b.checkinDate} → {b.checkoutDate}
                    </td>
                    <td>{b.guests}</td>
                    <td>{b.totalPrice || "-"}</td>
                    <td>{b.status}</td>
                    <td>
                      <b
                        className={`payment-status ${
                          b.paymentStatus === "Approved"
                            ? "approved"
                            : b.paymentStatus === "Rejected"
                            ? "rejected"
                            : "pending"
                        }`}
                      >
                        {b.paymentStatus || "Pending"}
                      </b>
                    </td>
                    <td className="btn-cell">
                      {b.paymentStatus !== "Approved" && (
                        <button
                          className="approve-btn small success"
                          onClick={() => approvePayment(b._id)}
                        >
                          Approve Payment
                        </button>
                      )}
                      {b.paymentStatus !== "Rejected" && (
                        <button
                          className="delete-btn small danger"
                          onClick={() => rejectPayment(b._id)}
                        >
                          Reject Payment
                        </button>
                      )}
                      {b.status !== "Approved" && (
                        <button
                          className="approve-btn small"
                          onClick={() => updateBookingStatus(b._id, "Approved")}
                        >
                          Approve Booking
                        </button>
                      )}
                      {b.status !== "Failed" && (
                        <button
                          className="delete-btn small"
                          onClick={() => updateBookingStatus(b._id, "Failed")}
                        >
                          Fail Booking
                        </button>
                      )}
                      <button
                        className="delete-btn small danger"
                        onClick={() => deleteBooking(b._id)}
                      >
                        Delete Booking
                      </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="9" className="empty-cell">
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  );
}
