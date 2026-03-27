import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenService } from "../services/tokenService";

const AuthenticatedRoute = () => {
  if (!tokenService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthenticatedRoute;
