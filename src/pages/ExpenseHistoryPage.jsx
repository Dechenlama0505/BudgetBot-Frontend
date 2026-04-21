import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useExpenses } from "../context/ExpenseContext";
import { expenseAPI } from "../services/expenseAPI";
import { categoryAPI } from "../services/categoryAPI";
import ExpenseHistorySection from "../components/ExpenseHistorySection";
import AppBottomNav from "../components/AppBottomNav";
import { showError, showSuccess } from "../utils/toastUtils";

const toInputDate = (value) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const ExpenseHistoryPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const {
    categoryColors,
    expenseRefreshKey,
    deleteExpense,
    updateExpense,
  } = useExpenses();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    category: "",
    date: "",
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((res) => {
        setCategories(res.data?.categories || []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

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

  const closeEditModal = () => {
    setEditingExpense(null);
    setEditForm({
      amount: "",
      category: "",
      date: "",
    });
  };

  const handleOpenEdit = (expense) => {
    setError("");
    setEditingExpense(expense);
    setEditForm({
      amount: String(expense.amount ?? ""),
      category: expense.category || "",
      date: toInputDate(expense.date),
    });
  };

  const handleDeleteExpense = async (expense) => {
    if (!expense?.id || deletingExpenseId || editingExpenseId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete this ${expense.category} expense of NPR ${Number(
        expense.amount || 0
      ).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      })}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingExpenseId(expense.id);
    setError("");

    try {
      const response = await deleteExpense(expense.id);
      showSuccess(response.message || "Expense deleted successfully.");
      if (editingExpense?.id === expense.id) {
        closeEditModal();
      }
    } catch (deleteError) {
      const message = deleteError.message || "Failed to delete expense.";
      setError(message);
      showError(message);
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingExpense?.id || deletingExpenseId || editingExpenseId) {
      return;
    }

    const amount = Number(editForm.amount);

    if (!amount || amount <= 0) {
      const message = "Please enter a valid amount.";
      setError(message);
      showError(message);
      return;
    }

    if (!editForm.category) {
      const message = "Please select a category.";
      setError(message);
      showError(message);
      return;
    }

    if (!editForm.date) {
      const message = "Please select a date.";
      setError(message);
      showError(message);
      return;
    }

    setEditingExpenseId(editingExpense.id);
    setError("");

    try {
      const response = await updateExpense({
        expenseId: editingExpense.id,
        amount,
        category: editForm.category,
        date: new Date(editForm.date).toISOString(),
      });
      showSuccess(response.message || "Expense updated successfully.");
      closeEditModal();
    } catch (updateError) {
      const message = updateError.message || "Failed to update expense.";
      setError(message);
      showError(message);
    } finally {
      setEditingExpenseId(null);
    }
  };

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#E0E6E7";
  const panelBg = darkMode ? "#2F5A68" : "#A8B7C0";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const historyCardBg = darkMode ? "#1E3A45" : "#E8EDF0";
  const modalCardBg = darkMode ? "#274956" : "#F5F8F9";
  const inputBg = darkMode ? "#1E3A45" : "#FFFFFF";
  const inputBorder = darkMode ? "#3B6A78" : "#C4CFD4";

  const title = useMemo(() => "View All Expense History", []);

  return (
    <div
      className="flex h-dvh min-h-dvh w-full items-start justify-center sm:px-4"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="relative flex h-dvh min-h-dvh w-full flex-col sm:h-dvh sm:min-h-dvh sm:max-h-dvh sm:max-w-[430px] sm:rounded-[32px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
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
            <div
              className="mt-6 rounded-[18px] border px-4 py-4 text-center text-sm"
              style={{
                backgroundColor: historyCardBg,
                borderColor: darkMode ? "#355B68" : "#D7E0E4",
                color: textSub,
              }}
            >
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
            onEditExpense={handleOpenEdit}
            onDeleteExpense={handleDeleteExpense}
            editingExpenseId={editingExpenseId}
            deletingExpenseId={deletingExpenseId}
          />
        </div>

        <div className="mt-auto w-full">
          <AppBottomNav />
        </div>

        {editingExpense ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4">
            <div
              className="w-full max-w-[360px] rounded-[24px] border p-5 shadow-[0_20px_40px_rgba(0,0,0,0.24)]"
              style={{
                backgroundColor: modalCardBg,
                borderColor: darkMode ? "#355B68" : "#D7E0E4",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold" style={{ color: textMain }}>
                    Update Expense
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: textSub }}>
                    Edit the spent amount, category, or date.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editingExpenseId === editingExpense.id}
                  className="rounded-full border px-3 py-1 text-[11px] font-semibold disabled:opacity-60"
                  style={{
                    borderColor: darkMode ? "#355B68" : "#D3DCE0",
                    color: textMain,
                    backgroundColor: darkMode ? "#315764" : "#F1F5F6",
                  }}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    className="block text-xs font-semibold"
                    style={{ color: textSub }}
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textMain,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold"
                    style={{ color: textSub }}
                  >
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textMain,
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option
                        key={category._id || category.name}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold"
                    style={{ color: textSub }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textMain,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editingExpenseId === editingExpense.id}
                  className="rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-60"
                  style={{
                    borderColor: darkMode ? "#355B68" : "#D3DCE0",
                    color: textMain,
                    backgroundColor: darkMode ? "#315764" : "#F1F5F6",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editingExpenseId === editingExpense.id}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "#265D6F" }}
                >
                  {editingExpenseId === editingExpense.id ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ExpenseHistoryPage;
