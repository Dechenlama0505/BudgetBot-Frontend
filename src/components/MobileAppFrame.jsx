import React from "react";

const MobileAppFrame = ({ backgroundColor, children, bottomNav }) => {
  return (
    <div
      className="flex min-h-dvh w-full items-start justify-center sm:px-4"
      style={{ backgroundColor }}
    >
      <div
        className="relative flex min-h-dvh w-full flex-col overflow-hidden border border-transparent sm:min-h-dvh sm:max-h-dvh sm:max-w-[430px] sm:rounded-[32px] sm:border-white/20 sm:shadow-[0_24px_60px_rgba(21,39,49,0.22)]"
        style={{ backgroundColor }}
      >
        {children}
        {bottomNav}
      </div>
    </div>
  );
};

export default MobileAppFrame;
