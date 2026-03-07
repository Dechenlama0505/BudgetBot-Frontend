import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useExpenses } from "../context/ExpenseContext";
import AppBottomNav from "../components/AppBottomNav";

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const InsightPage = () => {
  const { darkMode } = useTheme();
  const { totalExpenses, categoryBreakdown } = useExpenses();

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#E0E6E7";
  const panelBg = darkMode ? "#2F5A68" : "#A8B7C0";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="flex h-[896px] w-[414px] max-w-full flex-col rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: cardBg }}
      >
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <h1 className="text-center text-xl font-bold" style={{ color: textMain }}>
            Insight
          </h1>

          <div
            className="mt-5 rounded-[24px] p-5"
            style={{ backgroundColor: panelBg }}
          >
            <h2 className="text-center text-sm font-semibold" style={{ color: textSub }}>
              Total Spending
            </h2>
            <p className="mt-1 text-center text-2xl font-bold" style={{ color: textMain }}>
              NRP {formatCurrency(totalExpenses)}
            </p>

            <div className="mt-6 flex justify-center">
              {totalExpenses > 0 ? (
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <g transform="translate(110,110) rotate(-90)">
                    <circle
                      r={radius}
                      fill="transparent"
                      stroke={darkMode ? "#1E3A45" : "#D3DCE0"}
                      strokeWidth="28"
                    />
                    {categoryBreakdown.map((item) => {
                      const dash = (item.percentage / 100) * circumference;
                      const gap = circumference - dash;
                      const offset = -((cumulativePercent / 100) * circumference);
                      cumulativePercent += item.percentage;

                      return (
                        <circle
                          key={item.category}
                          r={radius}
                          fill="transparent"
                          stroke={item.color}
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
                    NRP {formatCurrency(totalExpenses)}
                  </text>
                </svg>
              ) : (
                <div
                  className="flex h-[220px] w-[220px] items-center justify-center rounded-full border text-center text-sm"
                  style={{ borderColor: textSub, color: textSub }}
                >
                  No spending data yet
                </div>
              )}
            </div>
          </div>

          <div
            className="mt-4 rounded-[24px] p-4"
            style={{ backgroundColor: panelBg }}
          >
            <h3 className="mb-3 text-base font-bold" style={{ color: textMain }}>
              Spending Summary
            </h3>

            {categoryBreakdown.length === 0 ? (
              <p className="text-sm" style={{ color: textSub }}>
                Add spending to see your chart summary.
              </p>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((item) => (
                  <div key={item.category}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-semibold" style={{ color: textMain }}>
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: textMain }}>
                          {item.percentage.toFixed(1)}%
                        </div>
                        <div className="text-xs" style={{ color: textSub }}>
                          NRP {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>

                    <div
                      className="h-3 w-full overflow-hidden rounded-full"
                      style={{ backgroundColor: darkMode ? "#1E3A45" : "#D3DCE0" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto w-full">
          <AppBottomNav />
        </div>
      </div>
    </div>
  );
};

export default InsightPage;