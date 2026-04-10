import React from "react";
import { NavLink } from "react-router-dom";

const RoleBottomNav = ({ items }) => {
  return (
    <nav className="h-20 w-full border-t border-[#D3DCE0] bg-[#E0E6E7] px-6 sm:rounded-b-[32px] sm:border-t-0">
      <div className="flex h-full items-center justify-between">
        {items.map((item) => (
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
};

export default RoleBottomNav;
