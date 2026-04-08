import React from "react";

const MobileAppFrame = ({ backgroundColor, children, bottomNav }) => {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-2 py-3"
      style={{ backgroundColor }}
    >
      <div
        className="relative flex h-[896px] w-[414px] max-w-full flex-col overflow-hidden rounded-[32px] border border-white/20 shadow-[0_24px_60px_rgba(21,39,49,0.22)]"
        style={{ backgroundColor }}
      >
        {children}
        {bottomNav}
      </div>
    </div>
  );
};

export default MobileAppFrame;
