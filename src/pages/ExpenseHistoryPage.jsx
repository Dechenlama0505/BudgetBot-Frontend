import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useExpenses } from "../context/ExpenseContext";
import { expenseAPI } from "../services/expenseAPI";
import ExpenseHistorySection from "../components/ExpenseHistorySection";
import AppBottomNav from "../components/AppBottomNav";
import { showError } from "../utils/toastUtils";

const ExpenseHistoryPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { categoryColors, expenseRefreshKey } = useExpenses();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    expenseAPI
      .getExpenses({ all: true })
      .then((res) => {
        const nextExpenses = (res.data?.expenses || [])
          .map((expense) => ({
            id: expense._id || expense.id,
            category: expense.category,
            amount: expense.amount,
            date: expense.date,
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setExpenses(nextExpenses);
      })
      .catch((fetchError) => {
        const message = fetchError.message || "Failed to load expense history.";
        setExpenses([]);
        setError(message);
        showError(message);
      })
      .finally(() => setLoading(false));
  }, [expenseRefreshKey]);

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#E0E6E7";
  const panelBg = darkMode ? "#2F5A68" : "#A8B7C0";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const historyCardBg = darkMode ? "#1E3A45" : "#E8EDF0";

  const title = useMemo(() => "View All Expense History", []);

  return (
    <div
      className="flex min-h-screen w-full justify-center sm:px-4 sm:py-6"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="flex min-h-screen w-full flex-col sm:min-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-3rem)] sm:max-w-[430px] sm:rounded-[32px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: cardBg }}
      >
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <div className="mt-1 mb-3">
            <button
              type="button"
              onClick={() => navigate("/insight")}
              className="rounded-full border px-3 py-1 text-[11px] font-semibold"
              style={{
                borderColor: darkMode ? "#355B68" : "#D3DCE0",
                color: textMain,
                backgroundColor: darkMode ? "#274956" : "#F1F5F6",
              }}
            >
              ← Back to Insight
            </button>
          </div>

          <h1 className="text-center text-xl font-bold" style={{ color: textMain }}>
            {title}
          </h1>

          {loading ? (
            <div className="mt-6 rounded-[18px] border px-4 py-4 text-center text-sm" style={{ backgroundColor: historyCardBg, borderColor: darkMode ? "#355B68" : "#D7E0E4", color: textSub }}>
              Loading expense history...
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[18px] border border-red-300 bg-red-100/80 px-4 py-4 text-center text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <ExpenseHistorySection
            title="Expense History by Month"
            expenses={error ? [] : expenses}
            darkMode={darkMode}
            textMain={textMain}
            textSub={textSub}
            panelBg={panelBg}
            cardBg={historyCardBg}
            categoryColors={categoryColors}
          />
        </div>

        <div className="mt-auto w-full">
          <AppBottomNav />
        </div>
      </div>
    </div>
  );
};

export default ExpenseHistoryPage;
