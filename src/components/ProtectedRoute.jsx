// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("role");

  if (!isAuthenticated || !token) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(userRole)) {
      const roleRoutes = {
        Admin: "/admin-dashboard",
        Host: "/host/dashboard",
        "Local Guide": "/local-guide-dashboard",
      };
      return <Navigate to={roleRoutes[userRole] || "/tourist-dashboard"} replace />;
    }
  }

  return children;
}
