import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppBottomNav from "../components/AppBottomNav";
import { categoryAPI } from "../services/categoryAPI";
import { authAPI } from "../services/authAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleDotClick = (id) => {
    setOpenMenuId((current) => (current === id ? null : id));
  };

  const handleAddToBudget = async (categoryName) => {
    setOpenMenuId(null);
    try {
      const next = [...budgetCategories, categoryName];
      const res = await categoryAPI.updateBudgetCategories(next);
      setBudgetCategories(res.data?.user?.budgetCategories || next);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveFromBudget = async (categoryName) => {
    setOpenMenuId(null);
    try {
      const next = budgetCategories.filter((c) => c !== categoryName);
      const res = await categoryAPI.updateBudgetCategories(next);
      setBudgetCategories(res.data?.user?.budgetCategories || next);
    } catch (err) {
      setError(err.message);
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

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="relative flex h-[896px] w-[414px] max-w-full flex-col overflow-hidden rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: containerBg }}
      >
        <div className="flex items-center justify-center rounded-t-[32px] px-4 py-3" style={{ backgroundColor: panelBg }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-4 text-2xl text-[#265D6F]"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-white">Manage Categories</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-3">
          {error && (
            <p className="mb-3 text-center text-sm text-red-600">{error}</p>
          )}
          <div className="rounded-[20px] px-4 py-3" style={{ backgroundColor: panelBg }}>
            {categories.map((cat) => (
              <div
                key={cat._id || cat.name}
                className="relative flex items-center justify-between border-b border-[#C4CFD4] py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0E6E7]">
                    <img
                      src={cat.icon || "/others.png"}
                      alt={cat.name}
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#265D6F]">
                      {cat.name}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color || "#CCCCCC" }}
                      />
                      <span
                        className="h-3 w-6 rounded"
                        style={{ backgroundColor: cat.color || "#CCCCCC" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => handleDotClick(cat._id || cat.name)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#265D6F] hover:bg-[#E0E6E7]"
                  >
                    <span className="flex flex-col items-center justify-between">
                      <span className="h-1 w-1 rounded-full bg-[#265D6F]" />
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-[#265D6F]" />
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-[#265D6F]" />
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
