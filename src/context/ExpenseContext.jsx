import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { expenseAPI } from "../services/expenseAPI";
import { tokenService } from "../services/tokenService";

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
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expenseRefreshKey, setExpenseRefreshKey] = useState(0);

  const [categoryColors, setCategoryColors] = useState(() => {
    const saved = localStorage.getItem("budgetbot_category_colors");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORY_COLORS;
  });

  useEffect(() => {
    localStorage.setItem("budgetbot_category_colors", JSON.stringify(categoryColors));
  }, [categoryColors]);

  const refreshExpenses = useCallback(async (options = {}) => {
    if (!tokenService.isAuthenticated()) {
      setExpenses([]);
      setTotalExpenses(0);
      setCategoryTotals({});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await expenseAPI.getExpenses(options);
      if (res.success && res.data) {
        setExpenses(res.data.expenses || []);
        setTotalExpenses(res.data.total ?? 0);
        setCategoryTotals(res.data.categoryTotals || {});
        setExpenseRefreshKey((prev) => prev + 1);
      } else {
        setExpenses([]);
        setTotalExpenses(0);
        setCategoryTotals({});
      }
    } catch (err) {
      setError(err.message);
      setExpenses([]);
      setTotalExpenses(0);
      setCategoryTotals({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshExpenses();
  }, [refreshExpenses]);

  const addExpense = useCallback(
    async ({ amount, category, date }) => {
      const numAmount = Number(amount);
      const cat = (category && String(category).trim()) || "Others";
      const dateObj = date ? new Date(date) : new Date();

      const res = await expenseAPI.addExpense({
        amount: numAmount,
        category: cat,
        date: dateObj.toISOString(),
      });

      if (res.success && res.data) {
        const newExpense = {
          _id: res.data._id,
          id: res.data._id,
          amount: res.data.amount,
          category: res.data.category,
          date: res.data.date,
          createdAt: res.data.createdAt,
        };
        setExpenses((prev) => [newExpense, ...prev]);
        setTotalExpenses((prev) => prev + numAmount);
        setCategoryTotals((prev) => ({
          ...prev,
          [cat]: (prev[cat] || 0) + numAmount,
        }));
        setExpenseRefreshKey((prev) => prev + 1);
      }
      return res;
    },
    []
  );

  const updateCategoryColor = (category, color) => {
    setCategoryColors((prev) => ({
      ...prev,
      [category]: color,
    }));
  };

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

  const value = useMemo(
    () => ({
      expenses,
      addExpense,
      totalExpenses,
      categoryBreakdown,
      categoryColors,
      updateCategoryColor,
      refreshExpenses,
      expenseRefreshKey,
      loading,
      error,
    }),
    [
      expenses,
      addExpense,
      totalExpenses,
      categoryBreakdown,
      categoryColors,
      refreshExpenses,
      expenseRefreshKey,
      loading,
      error,
    ]
  );

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
