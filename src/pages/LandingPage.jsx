import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0E6E7]">
      {/* phone frame */}
      <div className="relative flex h-[896px] w-[414px] max-w-full flex-col overflow-hidden rounded-[32px] bg-[#A8B7C0] shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
        {/* top area */}
        <div className="flex flex-1 flex-col items-center pt-24">
          <img
            src="/budgetBotLogo.png"
            alt="BudgetBot logo"
            className="mb-10 h-150 w-10 object-contain"
          />
          <h1 className="font-righteous text-[36px] tracking-wide text-[#2A5B6C]">
            BudgetBot
          </h1>
        </div>

        {/* curved bottom section */}
        <div className="relative mt-10 bg-[#2A5B6C] pt-24 pb-10">
          <div className="pointer-events-none absolute -top-20 left-0 right-0 h-24 rounded-b-[50%] bg-[#A8B7C0]" />

          <div className="relative z-10 flex flex-col items-center px-8 text-center">
            <h2 className="font-roboto text-[28px] text-white">
              BudgetBot
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-[#E2EDF2]">
              Sign in to start your savings journey
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#E2EDF2]">
              — or be mindful about spending
            </p>

            <button
              type="button"
              onClick={() => navigate("/createaccount")}
              className="mt-8 w-full max-w-xs rounded-full bg-[#C9D1D7] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#2A5B6C]"
            >
              CREATE ACCOUNT
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-[#D0DEE5]"
            >
              LOG IN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
