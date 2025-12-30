import React, { useState, useEffect } from "react";
import "./Settings.css";
import { API_BASE_URL } from "../api";

export default function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const defaultAvatars = [
    "https://randomuser.me/api/portraits/men/75.jpg",
    "https://randomuser.me/api/portraits/women/65.jpg",
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/43.jpg",
  ];

  useEffect(() => {
    setEmail(localStorage.getItem("userEmail") || "");
    setName(localStorage.getItem("userName") || "");
    setMobile(localStorage.getItem("userMobile") || "");
    setAddress(localStorage.getItem("userAddress") || "");
    setSelectedAvatar(
      localStorage.getItem("userAvatar") || defaultAvatars[0]
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result);
      localStorage.setItem("userAvatar", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (name.trim() === "" || mobile.trim() === "") {
      alert("Name & Mobile cannot be empty!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Please login again!");
        return;
      }

      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("User email not found!");
        return;
      }

      const payload = {
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        profileImage: selectedAvatar,
      };

      const res = await fetch(`${API_BASE_URL}/admin/users/${userEmail}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update profile");
        return;
      }

      localStorage.setItem("userName", name.trim());
      localStorage.setItem("userMobile", mobile.trim());
      localStorage.setItem("userAddress", address.trim());
      localStorage.setItem("userAvatar", selectedAvatar);

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Error updating profile");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-box">
        <h2>⚙ Profile Settings</h2>

        <h3>Profile Photo</h3>

        <div className="avatar-row">
          <label className="upload-avatar">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <img
              src={selectedAvatar}
              alt="profile"
              className="avatar selected"
            />
            <p>Click to Upload</p>
          </label>

          {defaultAvatars.map((a) => (
            <img
              key={a}
              src={a}
              alt="avatar"
              className={`avatar ${selectedAvatar === a ? "selected" : ""}`}
              onClick={() => {
                setSelectedAvatar(a);
                localStorage.setItem("userAvatar", a);
              }}
            />
          ))}
        </div>

        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Email (Not Editable)</label>
        <input value={email} disabled />

        <label>Mobile Number</label>
        <input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Enter mobile number"
        />

        <label>Address (Optional)</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button className="save-btn" onClick={saveProfile}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
