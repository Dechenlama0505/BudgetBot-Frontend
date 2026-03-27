import React from "react";
import RoleBottomNav from "./RoleBottomNav";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "/homelogo.png" },
  { to: "/admin/members", label: "Members", icon: "/categorylogo.png" },
  { to: "/admin/profile", label: "Profile", icon: "/profilelogo.png" },
];

const AdminBottomNav = () => {
  return <RoleBottomNav items={items} />;
};

export default AdminBottomNav;
