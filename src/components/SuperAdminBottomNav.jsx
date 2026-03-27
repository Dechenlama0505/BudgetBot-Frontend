import React from "react";
import RoleBottomNav from "./RoleBottomNav";

const items = [
  { to: "/superadmin/dashboard", label: "Dashboard", icon: "/homelogo.png" },
  { to: "/superadmin/members", label: "Members", icon: "/categorylogo.png" },
  { to: "/superadmin/admins", label: "Admins", icon: "/insightlogo.png" },
  { to: "/superadmin/profile", label: "Profile", icon: "/profilelogo.png" },
];

const SuperAdminBottomNav = () => {
  return <RoleBottomNav items={items} />;
};

export default SuperAdminBottomNav;
