// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* ===== COMMON PAGES ===== */
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";

/* ===== DASHBOARDS ===== */
import TouristDashboard from "./pages/TouristDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HostDashboard from "./pages/HostDashboard";
import LocalGuideDashboard from "./pages/LocalGuideDashboard";

/* ===== TOURIST PAGES ===== */
import HomestayList from "./pages/HomestayList";
import HomestayDetails from "./pages/HomestayDetails";
import BookingPage from "./pages/BookingPage";
import AttractionsPage from "./pages/AttractionsPage";
import LocalGuides from "./pages/LocalGuides";
import Settings from "./pages/Settings";

/* ===== HOST ===== */
import HostLogin from "./pages/HostLogin";

/* ===== ADMIN LOGIN ===== */
import AdminLogin from "./pages/AdminLogin";

/* ===== AUTH GUARD ===== */
import ProtectedRoute from "./components/ProtectedRoute";

/* ===== STYLES ===== */
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ===================== PUBLIC ===================== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/host/login" element={<HostLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ===================== TOURIST ===================== */}
        <Route
          path="/tourist-dashboard"
          element={
            <ProtectedRoute role="Tourist">
              <TouristDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/homestays"
          element={
            <ProtectedRoute role="Tourist">
              <HomestayList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/homestay/:id"
          element={
            <ProtectedRoute role="Tourist">
              <HomestayDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute role="Tourist">
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attractions"
          element={
            <ProtectedRoute role="Tourist">
              <AttractionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/local-guides"
          element={
            <ProtectedRoute role="Tourist">
              <LocalGuides />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute role={["Tourist", "Host", "Local Guide", "Admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ===================== ADMIN ===================== */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ===================== HOST ===================== */}
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute role="Host">
              <HostDashboard />
            </ProtectedRoute>
          }
        />

        {/* ===================== LOCAL GUIDE ===================== */}
        <Route
          path="/local-guide-dashboard"
          element={
            <ProtectedRoute role="Local Guide">
              <LocalGuideDashboard />
            </ProtectedRoute>
          }
        />

        {/* ===================== FALLBACK ===================== */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
