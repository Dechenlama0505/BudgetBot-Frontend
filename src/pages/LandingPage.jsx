import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0E6E7]">
      <div className="relative flex h-[896px] w-[414px] max-w-full flex-col overflow-hidden rounded-[32px] bg-[#A8B7C0] shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-[300px] pt-10">
          <img
            src="/budgetBotLogo.png"
            alt="BudgetBot logo"
            className="mb-5 h-[168px] w-[168px] object-contain"
          />
          <h1 className="font-righteous text-[48px] leading-none tracking-[0.01em] text-[#2A5B6C]">
            BudgetBot
          </h1>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <svg
            viewBox="0 0 414 150"
            className="block h-[160px] w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,84 C66,148 154,154 231,98 C293,54 350,-2 414,52 L414,150 L0,150 Z"
              fill="#2A5B6C"
            />
          </svg>

          <div className="-mt-px bg-[#2A5B6C] px-8 pb-16 pt-3">
            <div className="flex flex-col items-center text-center">
              <h2 className="font-roboto text-[32px] font-normal leading-none text-white">
                BudgetBot
              </h2>

              <div className="mt-5 space-y-1 text-center text-[18px] leading-[1.45] text-[#E2EDF2]">
                <p>Sign in to start your savings journey</p>
                <p>
                  <span className="mr-2 inline-block w-20 align-middle border-t border-[#E2EDF2]" />
                  <span className="align-middle">or be mindful about spending</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/createaccount")}
                className="mt-11 h-[44px] w-full max-w-[234px] rounded-full bg-[#C9D1D7] px-4 text-[13px] font-semibold tracking-[0.03em] text-white"
              >
                CREATE ACCOUNT
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-5 text-[11px] font-semibold tracking-[0.08em] text-[#C9D1D7]"
              >
                LOG IN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
