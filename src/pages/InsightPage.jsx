import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useExpenses } from "../context/ExpenseContext";
import { insightsAPI, getCurrentMonth } from "../services/insightsAPI";
import { expenseAPI } from "../services/expenseAPI";
import AppBottomNav from "../components/AppBottomNav";
import ExpenseHistorySection from "../components/ExpenseHistorySection";
import { showError } from "../utils/toastUtils";

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const formatMonthLabel = (yyyyMm) => {
  const [y, m] = yyyyMm.split("-").map(Number);
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[m - 1]} ${y}`;
};

const getPredictionStatusTone = (prediction) => {
  const status = String(prediction?.status || "").toLowerCase();
  const overrunPercent = Number(prediction?.overrunPercent || 0);

  if (status.includes("high")) {
    return {
      text: "#dc2626",
      pillBg: "#FEE2E2",
      pillText: "#B91C1C",
    };
  }

  if (status.includes("exceed") || status.includes("overrun") || overrunPercent > 0) {
    return {
      text: "#C2410C",
      pillBg: "#FFEDD5",
      pillText: "#C2410C",
    };
  }

  return {
    text: "#15803D",
    pillBg: "#DCFCE7",
    pillText: "#15803D",
  };
};

const InsightPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const aiForecastRef = useRef(null);
  const { darkMode } = useTheme();
  const { categoryColors, expenseRefreshKey } = useExpenses();

  const currentMonth = useMemo(getCurrentMonth, []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [insights, setInsights] = useState(null);
  const [incomeVsSpending, setIncomeVsSpending] = useState(null);
  const [monthLoading, setMonthLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const [predictionInfo, setPredictionInfo] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Income vs Spending: fetch once on mount (same for all months)
  useEffect(() => {
    insightsAPI
      .getIncomeVsSpending()
      .then((res) => setIncomeVsSpending(res.data))
      .catch(() => setIncomeVsSpending(null));
  }, [expenseRefreshKey]);

  // Insights for selected month: refetch when month changes
  useEffect(() => {
    setMonthLoading(true);
    insightsAPI
      .getInsights(selectedMonth)
      .then((res) => setInsights(res.data))
      .catch(() => setInsights(null))
      .finally(() => setMonthLoading(false));
  }, [selectedMonth, expenseRefreshKey]);

  useEffect(() => {
    setPredictionLoading(true);
    setPredictionError("");
    setPredictionInfo("");
    insightsAPI
      .getBudgetPredictions(selectedMonth)
      .then((res) => {
        setPredictions(Array.isArray(res.data) ? res.data : []);
        if (res.budgetRequired && res.message) {
          setPredictionInfo(res.message);
        }
      })
      .catch((error) => {
        setPredictions([]);
        setPredictionInfo("");
        setPredictionError(error.message || "Failed to load AI budget forecast");
      })
      .finally(() => setPredictionLoading(false));
  }, [selectedMonth, expenseRefreshKey]);

  useEffect(() => {
    if (location.hash === "#ai-forecast") {
      const timer = setTimeout(() => {
        if (aiForecastRef.current) {
          aiForecastRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [location.hash, selectedMonth, predictionLoading]);

  useEffect(() => {
    setHistoryLoading(true);
    setHistoryError("");

    expenseAPI
      .getExpenses({ all: true })
      .then((res) => {
        const nextExpenses = (res.data?.expenses || []).map((expense) => ({
          id: expense._id || expense.id,
          category: expense.category,
          amount: expense.amount,
          date: expense.date,
        })).sort((a, b) => new Date(b.date) - new Date(a.date));

        setExpenseHistory(nextExpenses);
      })
      .catch((error) => {
        const message =
          error.message || "Failed to load expense history.";
        setExpenseHistory([]);
        setHistoryError(message);
        showError(message);
      })
      .finally(() => setHistoryLoading(false));
  }, [expenseRefreshKey]);

  const goPreviousMonth = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const goNextMonth = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (selectedMonth >= currentMonth) return;
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const incomeVsData = incomeVsSpending?.months ?? [];
  const maxVal = Math.max(...incomeVsData.flatMap((m) => [m.income, m.spending]), 1);

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#E0E6E7";
  const panelBg = darkMode ? "#2F5A68" : "#A8B7C0";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const innerPanelBg = darkMode ? "#1E3A45" : "#E8EDF0";
  const sectionShadow = "0 14px 28px rgba(21,39,49,0.07)";

  const totalSpent = insights?.totalSpent ?? 0;
  const totalBudget = insights?.totalBudget ?? 0;
  const categoryBreakdown = insights?.categoryBreakdown ?? [];
  const budgetUsedPercent = insights?.budgetUsedPercent ?? 0;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  // Full-page loading only on very first load (no data yet)
  if (insights === null && monthLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: containerBg }}
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
          <p className="mt-4 text-sm text-[#265D6F]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full justify-center sm:px-4 sm:py-6"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="flex min-h-screen w-full flex-col sm:min-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-3rem)] sm:max-w-[430px] sm:rounded-[32px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: cardBg }}
      >
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pt-6">
          <h1
            className="text-center text-xl font-bold"
            style={{ color: textMain }}
          >
            Insight
          </h1>

          {/* Income vs Spending Bar Chart - last 4 months */}
          {incomeVsData.length > 0 && (
            <div
            className="mt-5 rounded-[24px] p-4"
            style={{ backgroundColor: panelBg, boxShadow: sectionShadow }}
          >
              <h2
                className="mb-3 text-center text-sm font-semibold"
                style={{ color: textMain }}
              >
                Income vs Spending
              </h2>
              <div className="flex items-end justify-around gap-2" style={{ minHeight: 120 }}>
                {incomeVsData.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="flex w-full items-end justify-center gap-0.5"
                      style={{ height: 100 }}
                    >
                      <div
                        className="w-3 rounded-t"
                        style={{
                          height: `${Math.max(2, (m.income / maxVal) * 90)}px`,
                          backgroundColor: "#22c55e",
                        }}
                        title={`Income: Rs. ${formatCurrency(m.income)}`}
                      />
                      <div
                        className="w-3 rounded-t"
                        style={{
                          height: `${Math.max(2, (m.spending / maxVal) * 90)}px`,
                          backgroundColor: "#dc2626",
                        }}
                        title={`Spending: Rs. ${formatCurrency(m.spending)}`}
                      />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: textSub }}>
                      {m.label.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-4 text-xs" style={{ color: textSub }}>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Income
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#dc2626]" /> Spending
                </span>
              </div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-[10px]" style={{ color: textSub }}>
                  <thead>
                    <tr className="border-b" style={{ borderColor: panelBg }}>
                      <th className="py-1 text-left">Month</th>
                      <th className="py-1 text-right">Income</th>
                      <th className="py-1 text-right">Spending</th>
                      <th className="py-1 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeVsData.map((m) => (
                      <tr key={m.month}>
                        <td className="py-0.5">{m.label}</td>
                        <td className="text-right">Rs. {formatCurrency(m.income)}</td>
                        <td className="text-right">Rs. {formatCurrency(m.spending)}</td>
                        <td
                          className="text-right font-medium"
                          style={{ color: m.net < 0 ? "#dc2626" : textMain }}
                        >
                          Rs. {formatCurrency(m.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total Spending / Pie Chart - filtered by selected month */}
          <div
            className="relative mt-5 rounded-[24px] p-5"
            style={{ backgroundColor: panelBg, boxShadow: sectionShadow }}
          >
            {monthLoading && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-[24px]"
                style={{ backgroundColor: `${panelBg}E6` }}
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#265D6F] border-t-transparent" />
              </div>
            )}
            <h2
              className="text-center text-sm font-semibold"
              style={{ color: textMain }}
            >
              {formatMonthLabel(selectedMonth)} — Total Spending
            </h2>
            <p
              className="mt-1 text-center text-2xl font-bold"
              style={{ color: textMain }}
            >
              NPR {formatCurrency(totalSpent)}
            </p>
            {totalBudget > 0 && (
              <p
                className="mt-1 text-center text-xs"
                style={{ color: textSub }}
              >
                Budget: NPR {formatCurrency(totalBudget)} — {budgetUsedPercent.toFixed(0)}% used
              </p>
            )}

            <div className="mt-6 flex justify-center">
              {totalSpent > 0 ? (
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <g transform="translate(110,110) rotate(-90)">
                    <circle
                      r={radius}
                      fill="transparent"
                      stroke={darkMode ? "#1E3A45" : "#D3DCE0"}
                      strokeWidth="28"
                    />
                    {categoryBreakdown
                      .filter((i) => i.spent > 0)
                      .map((item) => {
                        const pct =
                          totalSpent > 0 ? (item.spent / totalSpent) * 100 : 0;
                        const dash = (pct / 100) * circumference;
                        const gap = circumference - dash;
                        const offset =
                          -((cumulativePercent / 100) * circumference);
                        cumulativePercent += pct;
                        const color =
                          categoryColors[item.category] || "#CCCCCC";
                        return (
                          <circle
                            key={item.category}
                            r={radius}
                            fill="transparent"
                            stroke={color}
                            strokeWidth="28"
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={offset}
                            strokeLinecap="butt"
                          />
                        );
                      })}
                  </g>
                  <text
                    x="110"
                    y="102"
                    textAnchor="middle"
                    fontSize="15"
                    fill={textSub}
                    fontWeight="600"
                  >
                    Total
                  </text>
                  <text
                    x="110"
                    y="125"
                    textAnchor="middle"
                    fontSize="18"
                    fill={textMain}
                    fontWeight="700"
                  >
                    NPR {formatCurrency(totalSpent)}
                  </text>
                </svg>
              ) : (
                <div
                  className="flex h-[220px] w-[220px] items-center justify-center rounded-full border bg-white/15 text-center text-sm"
                  style={{ borderColor: textSub, color: textSub }}
                >
                  No spending data yet
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between">
              <button
                type="button"
                onClick={goPreviousMonth}
                className="rounded-lg px-3 py-1.5 text-sm font-medium"
                style={{ backgroundColor: darkMode ? "#355B68" : "#A8B7C0", color: textMain }}
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                disabled={selectedMonth >= currentMonth}
                className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: darkMode ? "#355B68" : "#A8B7C0", color: textMain }}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Spending vs Budget - Bar graphs per category */}
          <div
            className="relative mt-4 rounded-[24px] p-4"
            style={{ backgroundColor: panelBg, boxShadow: sectionShadow }}
          >
            {monthLoading && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-[24px]"
                style={{ backgroundColor: `${panelBg}E6` }}
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#265D6F] border-t-transparent" />
              </div>
            )}
            <h3
              className="mb-3 text-base font-bold"
              style={{ color: textMain }}
            >
              {formatMonthLabel(selectedMonth)} — Spending vs Budget
            </h3>

            {categoryBreakdown.length === 0 ? (
              <p className="text-sm" style={{ color: textSub }}>
                Add spending and set budget to see insights.
              </p>
            ) : (
              <div className="space-y-5">
                {categoryBreakdown.map((item) => {
                  const color =
                    categoryColors[item.category] || "#CCCCCC";
                  const maxVal = Math.max(
                    item.budgetAmount,
                    item.spent,
                    1
                  );
                  const budgetWidth =
                    (item.budgetAmount / maxVal) * 100;
                  const spentWidth = (item.spent / maxVal) * 100;
                  const barBg = darkMode ? "#1E3A45" : "#D3DCE0";
                  const spentBarColor = item.crossed ? "#dc2626" : color;

                  return (
                    <div
                      key={item.category}
                      className="rounded-[18px] border p-3"
                      style={{
                        backgroundColor: innerPanelBg,
                        borderColor: darkMode ? "#355B68" : "#D3DCE0",
                      }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: textMain }}
                          >
                            {item.category}
                            {item.crossed && (
                              <span className="ml-1 text-xs text-red-600">
                                (over budget)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Budget bar */}
                      <div className="mb-1">
                        <div className="mb-0.5 flex justify-between text-xs" style={{ color: textSub }}>
                          <span>Budget</span>
                          <span>Rs. {formatCurrency(item.budgetAmount)}</span>
                        </div>
                        <div
                          className="h-4 w-full overflow-hidden rounded"
                          style={{ backgroundColor: barBg }}
                        >
                          <div
                            className="h-full rounded transition-all"
                            style={{
                              width: `${budgetWidth}%`,
                              backgroundColor: darkMode
                                ? "#4A6B78"
                                : "#9CA8B0",
                            }}
                          />
                        </div>
                      </div>

                      {/* Spent bar */}
                      <div>
                        <div className="mb-0.5 flex justify-between text-xs" style={{ color: textSub }}>
                          <span>Spent</span>
                          <span>Rs. {formatCurrency(item.spent)}</span>
                        </div>
                        <div
                          className="h-4 w-full overflow-hidden rounded"
                          style={{ backgroundColor: barBg }}
                        >
                          <div
                            className="h-full rounded transition-all"
                            style={{
                              width: `${spentWidth}%`,
                              backgroundColor: spentBarColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            id="ai-forecast"
            ref={aiForecastRef}
            className="relative mt-4 mb-4 rounded-[24px] p-4"
            style={{ backgroundColor: panelBg, boxShadow: sectionShadow }}
          >
            {predictionLoading && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-[24px]"
                style={{ backgroundColor: `${panelBg}E6` }}
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#265D6F] border-t-transparent" />
              </div>
            )}

            <h3
              className="text-base font-bold"
              style={{ color: textMain }}
            >
              AI Budget Forecast
            </h3>
            <p
              className="mt-1 text-xs"
              style={{ color: textSub }}
            >
              {formatMonthLabel(selectedMonth)} prediction by category
            </p>

            {predictionError ? (
              <p className="mt-4 text-sm" style={{ color: "#dc2626" }}>
                {predictionError}
              </p>
            ) : predictionInfo ? (
              <p className="mt-4 text-sm leading-relaxed" style={{ color: textSub }}>
                {predictionInfo}
              </p>
            ) : !predictionLoading && predictions.length === 0 ? (
              <p className="mt-4 text-sm" style={{ color: textSub }}>
                No AI budget predictions available for this month.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {predictions.map((item) => {
                  const tone = getPredictionStatusTone(item);
                  const color = categoryColors[item.category] || "#265D6F";

                  return (
                    <div
                      key={item.category}
                    className="rounded-[18px] border p-4"
                    style={{
                        backgroundColor: innerPanelBg,
                        borderColor: darkMode ? "#355B68" : "#D3DCE0",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <h4
                            className="text-sm font-semibold"
                            style={{ color: textMain }}
                          >
                            {item.category}
                          </h4>
                        </div>

                        <span
                          className="rounded-full px-3 py-1 text-[10px] font-semibold"
                          style={{
                            backgroundColor: darkMode ? "#355B68" : tone.pillBg,
                            color: darkMode ? "#E4EDF2" : tone.pillText,
                          }}
                        >
                          {Number(item.overrunPercent) > 0
                            ? `${item.status || "On track"} (+${item.overrunPercent}%)`
                            : item.status || "Safe (0%)"}
                        </span>
                      </div>

                      <div
                        className="mt-4 grid grid-cols-2 gap-3 text-xs"
                        style={{ color: textSub }}
                      >
                        <div className="rounded-lg px-3 py-2" style={{ backgroundColor: darkMode ? "#274956" : "#DCE4E8" }}>
                          <p>Predicted final spend</p>
                          <p className="mt-1 text-sm font-semibold" style={{ color: textMain }}>
                            Rs. {formatCurrency(item.predictedFinalSpend)}
                          </p>
                        </div>
                        <div className="rounded-lg px-3 py-2" style={{ backgroundColor: darkMode ? "#274956" : "#DCE4E8" }}>
                          <p>Predicted overrun</p>
                          <p className="mt-1 text-sm font-semibold" style={{ color: tone.text }}>
                            {Number(item.overrunPercent || 0)}%
                          </p>
                        </div>
                      </div>


                      <p
                        className="mt-4 text-xs leading-5"
                        style={{ color: tone.text }}
                      >
                        {item.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ExpenseHistorySection
            title={
              historyLoading ? "Expense History" : "Expense History"
            }
            expenses={historyError ? [] : expenseHistory.slice(0, 5)}
            darkMode={darkMode}
            textMain={textMain}
            textSub={textSub}
            panelBg={panelBg}
            cardBg={darkMode ? "#1E3A45" : "#E8EDF0"}
            categoryColors={categoryColors}
            onViewAll={() => navigate("/expense-history")}
            viewAllLabel="View All"
          />
          {historyLoading ? (
            <div className="mt-[-4px] mb-4 rounded-[18px] border px-4 py-3 text-center text-sm" style={{ backgroundColor: darkMode ? "#274956" : "#F1F5F6", borderColor: darkMode ? "#355B68" : "#D7E0E4", color: textSub }}>
              Loading expense history...
            </div>
          ) : null}
          {historyError ? (
            <div className="mt-[-4px] mb-4 rounded-[18px] border border-red-300 bg-red-100/80 px-4 py-3 text-center text-sm text-red-700">
              {historyError}
            </div>
          ) : null}
        </div>

        <div className="mt-auto w-full">
          <AppBottomNav />
        </div>
      </div>
    </div>
  );
};

export default InsightPage;
