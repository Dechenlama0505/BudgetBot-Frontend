import React from "react";

const MobileAppFrame = ({ backgroundColor, children, bottomNav }) => {
  return (
    <div
      className="flex min-h-screen w-full justify-center sm:px-4 sm:py-6"
      style={{ backgroundColor }}
    >
      <div
        className="relative flex min-h-screen w-full flex-col overflow-hidden border border-transparent sm:min-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-3rem)] sm:max-w-[430px] sm:rounded-[32px] sm:border-white/20 sm:shadow-[0_24px_60px_rgba(21,39,49,0.22)]"
        style={{ backgroundColor }}
      >
        {children}
        {bottomNav}
      </div>
    </div>
  );
};

export default MobileAppFrame;
