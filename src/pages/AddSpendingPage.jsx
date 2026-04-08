import React, { useState, useEffect } from "react";
import AppBottomNav from "../components/AppBottomNav";
import { useTheme } from "../context/ThemeContext";
import { useExpenses } from "../context/ExpenseContext";
import { categoryAPI } from "../services/categoryAPI";
import { showError, showSuccess } from "../utils/toastUtils";

const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    min: `${year}-${month}-01`,
    max: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
};

const formatAmount = (value) => {
  if (!value) return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const AddSpendingPage = () => {
  const { darkMode } = useTheme();
  const { addExpense } = useExpenses();

  const [categories, setCategories] = useState([]);
  const [rawAmount, setRawAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("neutral");

  useEffect(() => {
    categoryAPI.getCategories().then((res) => {
      setCategories(res.data?.categories || []);
    }).catch(() => setCategories([]));
  }, []);

  const handleKeyPress = (digit) => {
    if (digit === "clear") {
      setRawAmount("");
      return;
    }

    if (rawAmount.length >= 12) return;

    const next = rawAmount + digit;
    setRawAmount(String(Number(next)));
  };

  const handleAddExpense = async () => {
    const amount = Number(rawAmount);

    if (!amount || amount <= 0) {
      const nextMessage = "Please enter an amount.";
      setMessageType("error");
      setMessage(nextMessage);
      showError(nextMessage);
      return;
    }

    if (!category) {
      const nextMessage = "Please select a category.";
      setMessageType("error");
      setMessage(nextMessage);
      showError(nextMessage);
      return;
    }

    if (!date) {
      const nextMessage = "Please select a date.";
      setMessageType("error");
      setMessage(nextMessage);
      showError(nextMessage);
      return;
    }

    setMessage("");
    try {
      const response = await addExpense({ amount, category, date });
      const successMessage =
        response.message || "Expense added successfully.";
      setRawAmount("");
      setCategory("");
      setDate("");
      setMessageType("success");
      setMessage(successMessage);
      showSuccess(successMessage);
    } catch (err) {
      setMessageType("error");
      setMessage(showError(err, "Failed to add expense. Try again."));
    }
  };

  const displayAmount = formatAmount(rawAmount);

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const topPanelBg = darkMode ? "#274956" : "#A8B7C0";
  const innerBg = darkMode ? "#2F5A68" : "#E0E6E7";
  const numpadBg = darkMode ? "#274956" : "#A8B7C0";
  const numKeyBg = darkMode ? "#2F5A68" : "#E0E6E7";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const inputBorder = darkMode ? "#3B6A78" : "#C4CFD4";

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="flex h-[896px] w-[414px] max-w-full flex-col rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: containerBg }}
      >
        <div className="flex-1 px-4 pt-5">
          <div
            className="mb-4 flex items-center justify-center rounded-[24px] px-4 py-4 shadow-[0_16px_32px_rgba(21,39,49,0.12)]"
            style={{ backgroundColor: topPanelBg }}
          >
            <div className="flex items-center gap-3">
              <img
                src="/budgetbotlogoHome.png"
                alt="BudgetBot"
                className="h-8 w-8 object-contain"
              />
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: textSub }}>
                  Add Spending
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: textMain }}>
                  Capture today&apos;s expense in seconds
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-[24px] px-4 pb-5 pt-1 shadow-[0_14px_28px_rgba(21,39,49,0.08)]"
            style={{ backgroundColor: innerBg }}
          >
            <div className="mb-6 flex flex-col items-center pt-2">
              <span
                className="text-xs font-semibold tracking-wide"
                style={{ color: textSub }}
              >
                NRP
              </span>
              <h1
                className="mt-2 text-[34px] font-bold tracking-[0.01em]"
                style={{ color: textMain }}
              >
                NRP {displayAmount}
              </h1>
            </div>

            <div className="mb-4">
              <label
                className="block text-xs font-semibold"
                style={{ color: textSub }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                style={{ borderColor: inputBorder, color: textMain }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label
                className="block text-xs font-semibold"
                style={{ color: textSub }}
              >
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getCurrentMonthRange().min}
                max={getCurrentMonthRange().max}
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                style={{ borderColor: inputBorder, color: textMain }}
              />
              <p className="mt-1 text-[10px]" style={{ color: textSub }}>
                Current month only
              </p>
            </div>

            {message && (
              <div
                className="mb-4 rounded-[18px] border px-4 py-3 text-center text-sm"
                style={{
                  borderColor:
                    messageType === "error" ? "#FCA5A5" : "#A7D7C5",
                  backgroundColor:
                    messageType === "error" ? "rgba(127,29,29,0.12)" : "rgba(16,185,129,0.12)",
                  color: messageType === "error" ? "#FCA5A5" : textMain,
                }}
              >
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddExpense}
              className="mb-4 w-full rounded-xl bg-[#265D6F] py-3 text-sm font-semibold text-[#E0E6E7] shadow-[0_12px_24px_rgba(11,26,33,0.14)] transition hover:translate-y-[-1px]"
            >
              Add Expense
            </button>
          </div>

          <div
            className="mt-4 rounded-[24px] px-4 py-5 shadow-[0_14px_28px_rgba(21,39,49,0.08)]"
            style={{ backgroundColor: numpadBg }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: textSub }}>
                Quick keypad
              </p>
              <p className="text-[11px]" style={{ color: textSub }}>
                Tap to enter amount
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(
                (digit, index) => (
                  <button
                    key={digit + index}
                    type="button"
                    onClick={() => handleKeyPress(digit)}
                    className="flex h-16 items-center justify-center rounded-2xl text-xl font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:translate-y-[-1px]"
                    style={{ backgroundColor: numKeyBg, color: textMain }}
                  >
                    {digit}
                  </button>
                )
              )}

              <div />

              <button
                type="button"
                onClick={() => handleKeyPress("clear")}
                className="flex h-16 items-center justify-center rounded-2xl text-xl font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:translate-y-[-1px]"
                style={{ backgroundColor: numKeyBg, color: textMain }}
              >
                ⌫
              </button>
            </div>
          </div>
        </div>

        <AppBottomNav />
      </div>
    </div>
  );
};

export default AddSpendingPage;
