import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppBottomNav from "../components/AppBottomNav";
import { categoryAPI } from "../services/categoryAPI";
import { authAPI } from "../services/authAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";
import { showError, showSuccess } from "../utils/toastUtils";

const FALLBACK_CATEGORY_COLORS = {
  "Food & Drinks": "#FF8A65",
  Groceries: "#4DB6AC",
  Transport: "#7986CB",
  Saving: "#81C784",
  Savings: "#81C784",
  Rent: "#A1887F",
  Health: "#F06292",
  Education: "#4FC3F7",
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
  "Home Bills": "#9575CD",
  Others: "#FFD54F",
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!tokenService.isAuthenticated()) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [catRes, profileRes] = await Promise.all([
        categoryAPI.getCategories(),
        authAPI.getProfile(),
      ]);
      setCategories(catRes.data?.categories || []);
      setBudgetCategories(profileRes.data?.user?.budgetCategories || []);
    } catch (err) {
      setError(err.message);
      if (err.message?.includes("401") || err.message?.includes("authorized")) {
        tokenService.removeToken();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDotClick = (id) => {
    setOpenMenuId((current) => (current === id ? null : id));
  };

  const handleAddToBudget = async (categoryName) => {
    setOpenMenuId(null);
    try {
      const next = [...budgetCategories, categoryName];
      const res = await categoryAPI.updateBudgetCategories(next);
      setBudgetCategories(res.data?.user?.budgetCategories || next);
      showSuccess(
        res.message || "Category added to your budget successfully."
      );
    } catch (err) {
      setError(showError(err, "Failed to update budget categories"));
    }
  };

  const handleRemoveFromBudget = async (categoryName) => {
    setOpenMenuId(null);
    try {
      const next = budgetCategories.filter((c) => c !== categoryName);
      const res = await categoryAPI.updateBudgetCategories(next);
      setBudgetCategories(res.data?.user?.budgetCategories || next);
      showSuccess(
        res.message || "Category removed from your budget successfully."
      );
    } catch (err) {
      setError(showError(err, "Failed to update budget categories"));
    }
  };

  const isInBudget = (name) => budgetCategories.includes(name);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: darkMode ? "#1E3A45" : "#E0E6E7" }}
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
          <p className="mt-4 text-sm text-[#265D6F]">Loading...</p>
        </div>
      </div>
    );
  }

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const panelBg = darkMode ? "#274956" : "#A8B7C0";
  const innerCardBg = darkMode ? "#21414D" : "#ECF1F3";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const getCategoryIcon = (category) => {
    if (category?.name === "Home Bills") {
      return "/homebills.png";
    }

    if (category?.name === "Savings") {
      return "/saving.png";
    }

    return category?.icon || "/others.png";
  };
  const getCategoryColor = (category) => {
    const trimmedName = category?.name?.trim() || "";

    return (
      category?.color ||
      FALLBACK_CATEGORY_COLORS[trimmedName] ||
      "#A0AEC0"
    );
  };

  return (
    <div
      className="flex min-h-dvh w-full items-start justify-center sm:px-4"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="relative flex min-h-dvh w-full flex-col overflow-hidden sm:min-h-dvh sm:max-h-dvh sm:max-w-[430px] sm:rounded-[32px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: containerBg }}
      >
        <div className="flex items-center justify-center rounded-t-[32px] px-4 py-3" style={{ backgroundColor: panelBg }}>
          <h1 className="text-lg font-semibold text-white">Manage Categories</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-3">
          {error && (
            <div className="mb-3 rounded-[18px] border border-red-300/50 bg-red-100/70 px-4 py-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="rounded-[24px] px-4 py-4 shadow-[0_16px_30px_rgba(21,39,49,0.08)]" style={{ backgroundColor: panelBg }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: textSub }}>
                  Category Library
                </p>
                <p className="mt-1 text-sm" style={{ color: textMain }}>
                  Organize what shows up in your budget setup.
                </p>
              </div>
              <span className="rounded-full bg-white/40 px-3 py-1 text-[11px] font-semibold" style={{ color: textMain }}>
                {categories.length} total
              </span>
            </div>
            {categories.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-white/40 px-4 py-10 text-center text-sm" style={{ color: textSub }}>
                No categories available yet.
              </div>
            ) : categories.map((cat) => (
              <div
                key={cat._id || cat.name}
                className="relative mb-3 flex items-center justify-between rounded-[20px] px-3 py-3 last:mb-0"
                style={{ backgroundColor: innerCardBg }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70">
                    <img
                      src={getCategoryIcon(cat)}
                      alt={cat.name}
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: getCategoryColor(cat) }}
                      />
                      <span className="text-sm font-semibold" style={{ color: textMain }}>
                        {cat.name}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px]" style={{ color: textSub }}>
                      {isInBudget(cat.name) ? "Included in your budget setup" : "Not added to your budget yet"}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => handleDotClick(cat._id || cat.name)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/60"
                    style={{ color: textMain }}
                  >
                    <span className="flex flex-col items-center justify-between">
                      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: textMain }} />
                      <span className="mt-0.5 h-1 w-1 rounded-full" style={{ backgroundColor: textMain }} />
                      <span className="mt-0.5 h-1 w-1 rounded-full" style={{ backgroundColor: textMain }} />
                    </span>
                  </button>

                  {openMenuId === (cat._id || cat.name) && (
                    <div
                      className="absolute right-0 top-9 z-20 w-48 rounded-lg bg-white py-2 px-3 text-xs shadow-md"
                      style={{ border: "1px solid #C4CFD4" }}
                    >
                      {isInBudget(cat.name) ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveFromBudget(cat.name)}
                          className="block w-full text-left text-[#265D6F] hover:bg-gray-100"
                        >
                          Remove from Set Your Budget
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToBudget(cat.name)}
                          className="block w-full text-left text-[#265D6F] hover:bg-gray-100"
                        >
                          Add to Set Your Budget
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AppBottomNav />
      </div>
    </div>
  );
};

export default CategoriesPage;
