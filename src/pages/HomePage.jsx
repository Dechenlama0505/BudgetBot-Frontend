// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppBottomNav from "../components/AppBottomNav";
import { authAPI } from "../services/authAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [food, setFood] = useState(0);
  const [education, setEducation] = useState(0);
  const [bills, setBills] = useState(0);
  const [savings, setSavings] = useState(0);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!tokenService.isAuthenticated()) {
          navigate("/login");
          return;
        }

        const response = await authAPI.getProfile();

        setUserName(response.data.user.fullName);
        setUserEmail(response.data.user.email);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        tokenService.removeToken();
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E0E6E7]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
          <p className="mt-4 text-sm text-[#265D6F]">Loading...</p>
        </div>
      </div>
    );
  }

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#A8B7C0";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const progressBg = darkMode ? "#355B68" : "#C4CFD4";

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: containerBg }}
    >
      {/* APP FRAME */}
      <div
        className="flex h-[896px] w-[414px] max-w-full flex-col rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: containerBg }}
      >
        {/* main content area */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
          {/* Greeting card */}
          <section
            className="mb-4 rounded-[26px] px-6 py-5"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#2A5B6C]">
                <img
                  src="/budgetbotlogoHome.png"
                  alt="BudgetBot logo"
                  className="h-14 w-14 object-contain"
                />
              </div>
              <h2
                className="text-xl font-semibold"
                style={{ color: textMain }}
              >
                Hello, {userName}
              </h2>
            </div>
          </section>

          {/* This Month's Budget */}
          <section
            className="mb-3 rounded-[22px] px-6 py-3"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex items-center justify-between text-sm font-semibold">
              <span style={{ color: textMain }}>This Month&apos;s Budget</span>
              <span
                className="text-xs font-normal"
                style={{ color: textSub }}
              >
                NPR 0
              </span>
            </div>
            <p
              className="mt-1 text-[11px]"
              style={{ color: textSub }}
            >
              0% used
            </p>
            <div
              className="mt-3 h-3 rounded-full"
              style={{ backgroundColor: progressBg }}
            >
              <div className="h-3 w-0 rounded-full bg-[#265D6F]" />
            </div>
          </section>

          {/* Income / Expenses / Remaining */}
          <section
            className="mb-4 rounded-[22px] px-6 py-4"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex justify-between text-xs" style={{ color: textSub }}>
              <span>Income</span>
              <span>Expenses</span>
              <span>Remaining</span>
              <span>others</span>
              
            </div>
            <div
              className="mt-2 flex justify-between text-sm font-semibold"
              style={{ color: textMain }}
            >
              <span>Rs. 0</span>
              <span>Rs. 0</span>
              <span>Rs. 0</span>
              <span>Rs. 0</span>
            </div>
          </section>

          {/* Set Your Budget card */}
          <section
            className="flex-1 rounded-[26px] px-6 py-5"
            style={{ backgroundColor: cardBg }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: textMain }}
            >
              Set Your Budget
            </h3>
            <p
              className="mt-1 text-[11px]"
              style={{ color: textSub }}
            >
              Allocate your monthly spendings out of 100%
            </p>

            <div
              className="mt-6 space-y-6 text-sm"
              style={{ color: textMain }}
            >
              {/* Food & Drinks */}
              <div>
                <div className="flex items-center justify-between">
                  <span>Food &amp; Drinks</span>
                  <span>{food}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={food}
                  onChange={(e) => setFood(Number(e.target.value))}
                  className="mt-2 w-full accent-[#265D6F]"
                />
              </div>

              {/* Education */}
              <div>
                <div className="flex items-center justify-between">
                  <span>Education</span>
                  <span>{education}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={education}
                  onChange={(e) => setEducation(Number(e.target.value))}
                  className="mt-2 w-full accent-[#265D6F]"
                />
              </div>

              {/* Home Bills */}
              <div>
                <div className="flex items-center justify-between">
                  <span>Home Bills</span>
                  <span>{bills}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bills}
                  onChange={(e) => setBills(Number(e.target.value))}
                  className="mt-2 w-full accent-[#265D6F]"
                />
              </div>

              {/* Savings */}
              <div>
                <div className="flex items-center justify-between">
                  <span>Savings</span>
                  <span>{savings}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={savings}
                  onChange={(e) => setSavings(Number(e.target.value))}
                  className="mt-2 w-full accent-[#265D6F]"
                />
              </div>
            </div>

            {/* Add Category */}
            <button
              type="button"
              className="mt-6 w-full text-center text-sm font-semibold"
              style={{ color: textMain }}
            >
              + Add Category
            </button>

            {/* Continue */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="w-40 rounded-full bg-[#265D6F] py-3 text-sm font-semibold text-[#E0E6E7]"
              >
                Continue
              </button>
            </div>
          </section>
        </div>

        {/* NAV BAR AT BOTTOM */}
        <AppBottomNav />
      </div>
    </div>
  );
};

export default HomePage;
