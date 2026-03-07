// src/components/AppBottomNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/home", label: "Home", icon: "/homelogo.png" },
  { to: "/insight", label: "Insight", icon: "/insightlogo.png" },
  { to: "/addspending", label: "Add Spending", icon: "/addspendinglogo.png" },
  { to: "/categories", label: "Categories", icon: "/categorylogo.png" },
  { to: "/profile", label: "Profile", icon: "/profilelogo.png" },
];

const AppBottomNav = () => (
  <nav className="h-20 w-full rounded-b-[32px] bg-[#E0E6E7] px-6">
    <div className="flex h-full items-center justify-between">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              "flex flex-col items-center text-[11px] no-underline",
              isActive ? "text-[#265D6F] font-semibold" : "text-[#6E828D]",
            ].join(" ")
          }
        >
          <img
            src={item.icon}
            alt={item.label}
            className="mb-1 h-6 w-6 object-contain"
          />
          <span className="leading-none">{item.label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

export default AppBottomNav;
