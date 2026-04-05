// src/pages/HomePage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AppBottomNav from "../components/AppBottomNav";
import { authAPI } from "../services/authAPI";
import { budgetAPI } from "../services/budgetAPI";
import { expenseAPI } from "../services/expenseAPI";
import { insightsAPI } from "../services/insightsAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (yyyyMm) => {
  const [y, m] = yyyyMm.split("-").map(Number);
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[m - 1]} ${y}`;
};

const getPredictionPriority = (prediction) => {
  const status = String(prediction?.status || "").toLowerCase();
  const overrunPercent = Number(prediction?.overrunPercent || 0);

  if (status.includes("high")) return 4;
  if (status.includes("exceed") || status.includes("overrun")) return 3;
  if (overrunPercent > 0) return 2;
  return 1;
};

const getTopPrediction = (predictions) => {
  if (!predictions.length) return null;

  return [...predictions].sort((a, b) => {
    const priorityDiff = getPredictionPriority(b) - getPredictionPriority(a);
    if (priorityDiff !== 0) return priorityDiff;
    return Number(b.overrunPercent || 0) - Number(a.overrunPercent || 0);
  })[0];
};

const HomePage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [userName, setUserName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [totalBudget, setTotalBudget] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const [predictionInfo, setPredictionInfo] = useState("");
  const [topPrediction, setTopPrediction] = useState(null);

  const currentMonth = useMemo(() => getCurrentMonth(), []);

  // Fetch user profile once on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!tokenService.isAuthenticated()) {
          navigate("/login");
          return;
        }
        const response = await authAPI.getProfile();
        setUserName(response.data.user.fullName);
        setMonthlyIncome(response.data.user.monthlyIncome ?? null);
        setBudgetCategories(response.data.user.budgetCategories || []);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        tokenService.removeToken();
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Fetch budget, expenses for selected month
  useEffect(() => {
    if (!tokenService.isAuthenticated()) return;
    const fetchMonthData = async () => {
      const cats = budgetCategories.length ? budgetCategories : [];
      try {
        const [budgetRes, expenseRes] = await Promise.all([
          budgetAPI.getBudget(selectedMonth),
          expenseAPI.getSummary(selectedMonth),
        ]);
        const b = budgetRes.data?.budget;
        setMonthExpenses(expenseRes.data?.total ?? 0);
        if (b) {
          setTotalBudget(b.totalAmount || 0);
          const allocs = b.allocations || {};
          setAllocations((prev) => {
            const next = { ...prev };
            cats.forEach((c) => {
              next[c] = typeof allocs[c] === "number" ? allocs[c] : 0;
            });
            return next;
          });
        } else {
          setTotalBudget(0);
          setAllocations((prev) => {
            const next = { ...prev };
            cats.forEach((c) => {
              if (typeof next[c] !== "number") next[c] = 0;
            });
            return next;
          });
        }
      } catch {
        setMonthExpenses(0);
        setTotalBudget(0);
      }
    };
    fetchMonthData();
  }, [selectedMonth, budgetCategories]);

  const loadPredictions = useCallback(async () => {
    if (!tokenService.isAuthenticated()) return;
    try {
      setPredictionLoading(true);
      setPredictionError("");
      setPredictionInfo("");
      const response = await insightsAPI.getBudgetPredictions(selectedMonth);
      const predictions = Array.isArray(response.data) ? response.data : [];
      setTopPrediction(getTopPrediction(predictions));
      if (response.budgetRequired && response.message) {
        setPredictionInfo(response.message);
      }
    } catch (error) {
      setTopPrediction(null);
      setPredictionInfo("");
      setPredictionError(error.message || "Failed to load AI insight");
    } finally {
      setPredictionLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);


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

  const maxBudget = monthlyIncome ?? 0;
  const budgetUsedPct = totalBudget > 0 ? Math.min(100, (monthExpenses / totalBudget) * 100) : 0;
  const remaining = (monthlyIncome ?? 0) - monthExpenses;
  /** Rs. next to sliders: use saved total budget, or preview as % of income until user sets total */
  const budgetBaseForCategoryDisplay =
    totalBudget > 0 ? totalBudget : maxBudget > 0 ? maxBudget : 0;

  const goPrevMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const goNextMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (next <= currentMonth) setSelectedMonth(next);
  };

  const handleSetBudget = () => {
    setBudgetError("");
    const val = Number(budgetInput.replace(/,/g, ""));
    if (isNaN(val) || val < 0) {
      setBudgetError("Enter a valid amount");
      return;
    }
    if (val > maxBudget) {
      setBudgetError(`Budget cannot exceed income (Rs. ${maxBudget.toLocaleString()})`);
      return;
    }
    setTotalBudget(val);
    setBudgetInput("");
    setShowBudgetInput(false);
  };

  const handleSaveBudget = async () => {
    setSaveMessage("");
    setSaveError("");
    if (totalBudget <= 0) {
      setSaveError('Set "This Month\'s Budget" above first (sliders use that total when saving).');
      return;
    }
    const allocSum = Object.values(allocations).reduce((a, b) => a + b, 0);
    if (allocSum > 100) {
      setSaveError("Total allocation cannot exceed 100%");
      return;
    }
    try {
      await budgetAPI.saveBudget({
        month: selectedMonth,
        totalAmount: totalBudget,
        allocations,
      });
      setSaveMessage("Budget saved successfully.");
      loadPredictions();
    } catch (err) {
      setSaveError(err.message || "Failed to save budget");
    }
  };

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
          {/* Month selector */}
          <section
            className="mb-3 flex items-center justify-between rounded-[22px] px-4 py-2"
            style={{ backgroundColor: cardBg }}
          >
            <button
              type="button"
              onClick={goPrevMonth}
              className="text-sm font-semibold"
              style={{ color: textMain }}
            >
              ← Prev
            </button>
            <span className="text-sm font-semibold" style={{ color: textMain }}>
              {formatMonthLabel(selectedMonth)}
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              disabled={selectedMonth >= currentMonth}
              className="text-sm font-semibold disabled:opacity-50"
              style={{ color: textMain }}
            >
              Next →
            </button>
          </section>

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
                NPR {totalBudget.toLocaleString()}
              </span>
            </div>
            <p
              className="mt-1 text-[11px]"
              style={{ color: textSub }}
            >
              {totalBudget > 0
                ? `${budgetUsedPct.toFixed(0)}% used`
                : "Set your total budget (max: income)"}
            </p>
            {showBudgetInput ? (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder={`Max Rs. ${maxBudget.toLocaleString()}`}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: progressBg }}
                />
                <button
                  type="button"
                  onClick={handleSetBudget}
                  className="rounded-lg bg-[#265D6F] px-3 py-2 text-sm font-semibold text-white"
                >
                  Set
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetInput(false);
                    setBudgetInput("");
                    setBudgetError("");
                  }}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: progressBg, color: textMain }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowBudgetInput(true)}
                className="mt-2 text-xs font-medium"
                style={{ color: "#3A6B7A" }}
              >
                {totalBudget > 0 ? "Edit Budget" : "Set Budget"}
              </button>
            )}
            {budgetError && (
              <p className="mt-1 text-xs text-red-600">{budgetError}</p>
            )}
            <div
              className="mt-3 h-3 rounded-full"
              style={{ backgroundColor: progressBg }}
            >
              <div
                className="h-3 rounded-full bg-[#265D6F] transition-all"
                style={{ width: `${budgetUsedPct}%` }}
              />
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
              <span>Rs. {monthlyIncome != null ? monthlyIncome.toLocaleString() : "0"}</span>
              <span>Rs. {monthExpenses.toLocaleString()}</span>
              <span
                style={{
                  color: remaining < 0 ? "#dc2626" : textMain,
                }}
              >
                Rs. {remaining.toLocaleString()}
              </span>
              <span>Rs. 0</span>
            </div>
          </section>

          <section
            className="mb-4 rounded-[22px] px-6 py-4"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: textMain }}
                >
                  AI Budget Alert
                </h3>
                {predictionLoading ? (
                  <p className="mt-2 text-[11px]" style={{ color: textSub }}>
                    Loading AI insight...
                  </p>
                ) : predictionError ? (
                  <p className="mt-2 text-[11px]" style={{ color: "#dc2626" }}>
                    {predictionError}
                  </p>
                ) : predictionInfo ? (
                  <p className="mt-2 text-[11px] leading-5" style={{ color: textSub }}>
                    {predictionInfo}
                  </p>
                ) : topPrediction ? (
                  <p className="mt-2 text-[11px] leading-5" style={{ color: textSub }}>
                    {topPrediction.message}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px]" style={{ color: textSub }}>
                    No AI insights available for this month.
                  </p>
                )}
              </div>

              {!predictionLoading && !predictionError && topPrediction && (
                <button
                  type="button"
                  onClick={() => navigate("/insight")}
                  className="shrink-0 rounded-full bg-[#265D6F] px-3 py-2 text-[11px] font-semibold text-[#E0E6E7]"
                >
                  View Insights
                </button>
              )}
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
              Allocate your total budget (100%) across categories
            </p>
            {totalBudget > 0 ? (
              <p className="mt-1 text-[10px]" style={{ color: textSub }}>
                Total budget: Rs. {totalBudget.toLocaleString()} — e.g. 10% = Rs. {(totalBudget * 0.1).toLocaleString()}
              </p>
            ) : maxBudget > 0 ? (
              <p className="mt-1 text-[10px]" style={{ color: textSub }}>
                Amounts show as % of your income (Rs. {maxBudget.toLocaleString()}) until you set &quot;This Month&apos;s Budget&quot; above.
              </p>
            ) : null}

            <div
              className="mt-6 space-y-6 text-sm"
              style={{ color: textMain }}
            >
              {budgetCategories.length === 0 ? (
                <p className="text-sm" style={{ color: textSub }}>
                  No categories added yet. Customize your categories to set budget allocation.
                </p>
              ) : (
                budgetCategories.map((catName) => {
                  const pct = allocations[catName] ?? 0;
                  const amount = (budgetBaseForCategoryDisplay * pct) / 100;
                  return (
                    <div key={catName}>
                      <div className="flex items-center justify-between">
                        <span>{catName}</span>
                        <span>{pct}% — Rs. {amount.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={allocations[catName] ?? 0}
                        onChange={(e) =>
                          setAllocations((prev) => ({
                            ...prev,
                            [catName]: Number(e.target.value),
                          }))
                        }
                        className="mt-2 w-full accent-[#265D6F]"
                      />
                    </div>
                  );
                })
              )}
            </div>

            {saveMessage && (
              <p className="mt-3 text-center text-sm text-green-600">{saveMessage}</p>
            )}
            {saveError && (
              <p className="mt-3 text-center text-sm text-red-600">{saveError}</p>
            )}

            {/* Customize Categories */}
            <Link
              to="/categories"
              className="mt-6 block w-full text-center text-sm font-semibold"
              style={{ color: textMain }}
            >
              Customize Categories
            </Link>

            {/* Save Budget */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleSaveBudget}
                className="w-40 rounded-full bg-[#265D6F] py-3 text-sm font-semibold text-[#E0E6E7]"
              >
                Save Budget
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
