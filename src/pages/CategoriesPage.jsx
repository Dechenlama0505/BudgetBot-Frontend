import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBottomNav from "../components/AppBottomNav";
import { useExpenses } from "../context/ExpenseContext";

const CATEGORY_DATA = [
  { id: "food", label: "Food & Drinks", src: "/foodndrink.png" },
  { id: "groceries", label: "Groceries", src: "/groceries.png" },
  { id: "transport", label: "Transport", src: "/transport.png" },
  { id: "saving", label: "Saving", src: "/saving.png" },
  { id: "rent", label: "Rent", src: "/rent.png" },
  { id: "health", label: "Health", src: "/health.png" },
  { id: "education", label: "Education", src: "/education.png" },
  { id: "debt", label: "Debt", src: "/debt.png" },
  { id: "insurance", label: "Insurance", src: "/insurance.png" },
  { id: "internet", label: "Internet", src: "/internet.png" },
  { id: "investment", label: "Investment", src: "/investment.png" },
  { id: "gifts", label: "Gifts", src: "/gifts.png" },
  { id: "tax", label: "Tax", src: "/Tax.png" },
  { id: "travel", label: "Travel", src: "/travel.png" },
  { id: "emergency", label: "Emergency Fund", src: "/emergencyfund.png" },
  { id: "mobile", label: "Mobile Bill", src: "/mobilebill.png" },
  { id: "shopping", label: "Shopping", src: "/shopping.png" },
  { id: "entertainment", label: "Entertainment", src: "/entertainment.png" },
  { id: "others", label: "Others", src: "/others.png" },
];

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const { categoryColors, updateCategoryColor } = useExpenses();

  const handleDotClick = (id) => {
    setOpenMenuId((current) => (current === id ? null : id));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0E6E7]">
      <div className="relative flex h-[896px] w-[414px] max-w-full flex-col overflow-hidden rounded-[32px] bg-[#E0E6E7] shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-center rounded-t-[32px] bg-[#A8B7C0] px-4 py-3">
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
          <div className="rounded-[20px] bg-[#A8B7C0] px-4 py-3">
            {CATEGORY_DATA.map((cat) => (
              <div
                key={cat.id}
                className="relative flex items-center justify-between border-b border-[#C4CFD4] py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0E6E7]">
                    <img
                      src={cat.src}
                      alt={cat.label}
                      className="h-6 w-6 object-contain"
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#265D6F]">
                      {cat.label}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: categoryColors[cat.label] || "#CCCCCC" }}
                      />
                      <input
                        type="color"
                        value={categoryColors[cat.label] || "#CCCCCC"}
                        onChange={(e) => updateCategoryColor(cat.label, e.target.value)}
                        className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => handleDotClick(cat.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#265D6F] hover:bg-[#E0E6E7]"
                  >
                    <span className="flex flex-col items-center justify-between">
                      <span className="h-1 w-1 rounded-full bg-[#265D6F]" />
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-[#265D6F]" />
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-[#265D6F]" />
                    </span>
                  </button>

                  {openMenuId === cat.id && (
                    <div className="absolute right-0 top-9 z-20 w-32 rounded-lg bg-white py-2 px-3 text-xs shadow-md">
                      <p className="text-[#265D6F]">Pick a color below.</p>
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