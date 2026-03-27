import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenService } from "../services/tokenService";

const AdminRoute = () => {
  if (!tokenService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = tokenService.getRole();

  if (role === "superadmin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  if (role !== "admin") {
    return <Navigate to={tokenService.getHomePath()} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
