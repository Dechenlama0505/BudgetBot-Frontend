import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenService } from "../services/tokenService";

const UserRoute = () => {
  if (!tokenService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = tokenService.getRole();

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === "superadmin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
