import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ExpenseContext = createContext();

const DEFAULT_CATEGORY_COLORS = {
  "Food & Drinks": "#FF8A65",
  Education: "#4FC3F7",
  "Home Bills": "#9575CD",
  Savings: "#81C784",
  Others: "#FFD54F",
  Groceries: "#4DB6AC",
  Transport: "#7986CB",
  Saving: "#81C784",
  Rent: "#A1887F",
  Health: "#F06292",
  Debt: "#E57373",
  Insurance: "#64B5F6",
  Internet: "#BA68C8",
  Investment: "#AED581",
  Gifts: "#FFB74D",
  Tax: "#90A4AE",
  Travel: "#4DD0E1",
  "Emergency Fund": "#DCE775",
  "Mobile Bill": "#7986CB",
  Shopping: "#FF8A80",
  Entertainment: "#F48FB1",
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("budgetbot_expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [categoryColors, setCategoryColors] = useState(() => {
    const saved = localStorage.getItem("budgetbot_category_colors");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORY_COLORS;
  });

  useEffect(() => {
    localStorage.setItem("budgetbot_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("budgetbot_category_colors", JSON.stringify(categoryColors));
  }, [categoryColors]);

  const addExpense = ({ amount, category, date }) => {
    const newExpense = {
      id: Date.now().toString(),
      amount: Number(amount),
      category,
      date,
    };

    setExpenses((prev) => [newExpense, ...prev]);
  };

  const updateCategoryColor = (category, color) => {
    setCategoryColors((prev) => ({
      ...prev,
      [category]: color,
    }));
  };

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    expenses.forEach((item) => {
      const cat = item.category || "Others";
      totals[cat] = (totals[cat] || 0) + Number(item.amount || 0);
    });
    return totals;
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: categoryColors[category] || "#CCCCCC",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [categoryTotals, totalExpenses, categoryColors]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        totalExpenses,
        categoryBreakdown,
        categoryColors,
        updateCategoryColor,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);