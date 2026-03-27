import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenService } from "../services/tokenService";

const SuperAdminRoute = () => {
  if (!tokenService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (tokenService.getRole() !== "superadmin") {
    return <Navigate to={tokenService.getHomePath()} replace />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;
