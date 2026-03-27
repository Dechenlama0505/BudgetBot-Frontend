import React from "react";

const MobileAppFrame = ({ backgroundColor, children, bottomNav }) => {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor }}
    >
      <div
        className="relative flex h-[896px] w-[414px] max-w-full flex-col rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor }}
      >
        {children}
        {bottomNav}
      </div>
    </div>
  );
};

export default MobileAppFrame;
