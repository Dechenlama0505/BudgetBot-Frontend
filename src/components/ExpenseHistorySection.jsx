import React from "react";

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const formatDate = (dateString) => {
  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getExpenseMonthKey = (dateString) => {
  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey) {
    return "Unknown Month";
  }

  const [year, month] = monthKey.split("-").map(Number);
  const parsedDate = new Date(year, (month || 1) - 1, 1);

  if (Number.isNaN(parsedDate.getTime())) {
    return monthKey;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

const ExpenseHistorySection = ({
  title = "Expense History",
  expenses = [],
  darkMode = false,
  textMain,
  textSub,
  panelBg,
  cardBg,
  categoryColors = {},
  onViewAll,
  viewAllLabel = "View All",
  onEditExpense,
  onDeleteExpense,
  editingExpenseId = null,
  deletingExpenseId = null,
}) => {
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const monthKey = getExpenseMonthKey(expense.date);

    if (!monthKey) {
      return groups;
    }

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }

    groups[monthKey].push(expense);
    return groups;
  }, {});

  const monthKeys = Object.keys(groupedExpenses).sort((a, b) =>
    b.localeCompare(a)
  );

  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState(0);

  React.useEffect(() => {
    setSelectedMonthIndex(0);
  }, [expenses]);

  const safeMonthIndex = Math.min(selectedMonthIndex, Math.max(monthKeys.length - 1, 0));
  const selectedMonthKey = monthKeys[safeMonthIndex] || "";
  const visibleExpenses = selectedMonthKey ? groupedExpenses[selectedMonthKey] || [] : [];

  return (
    <section
      className="mt-4 mb-4 rounded-[24px] p-4"
      style={{ backgroundColor: panelBg, boxShadow: "0 14px 28px rgba(21,39,49,0.07)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold" style={{ color: textMain }}>
          {title}
        </h3>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-full border px-3 py-1 text-[11px] font-semibold"
            style={{
              borderColor: darkMode ? "#355B68" : "#D3DCE0",
              color: textMain,
              backgroundColor: darkMode ? "#274956" : "#F1F5F6",
            }}
          >
            {viewAllLabel}
          </button>
        ) : null}
      </div>

      {expenses.length ? (
        <div className="mt-4 space-y-3">
          <div
            className="flex items-center justify-between rounded-[18px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            style={{
              backgroundColor: cardBg,
              borderColor: darkMode ? "#355B68" : "#D3DCE0",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setSelectedMonthIndex((current) => Math.max(0, current - 1))
              }
              disabled={safeMonthIndex <= 0}
              className="text-sm font-semibold disabled:opacity-40"
              style={{ color: textMain }}
            >
              ←
            </button>

            <span className="text-sm font-semibold" style={{ color: textMain }}>
              {formatMonthLabel(selectedMonthKey)}
            </span>

            <button
              type="button"
              onClick={() =>
                setSelectedMonthIndex((current) =>
                  Math.min(monthKeys.length - 1, current + 1)
                )
              }
              disabled={safeMonthIndex >= monthKeys.length - 1}
              className="text-sm font-semibold disabled:opacity-40"
              style={{ color: textMain }}
            >
              →
            </button>
          </div>

          {visibleExpenses.map((expense) => {
            const dotColor = categoryColors[expense.category] || "#265D6F";
            const isEditing = editingExpenseId === expense.id;
            const isDeleting = deletingExpenseId === expense.id;

            return (
              <div
                key={expense.id}
                className="rounded-[18px] border p-4"
                style={{
                  backgroundColor: cardBg,
                  borderColor: darkMode ? "#355B68" : "#D3DCE0",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: textMain }}>
                        {expense.category}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: textSub }}>
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-[132px] flex-col items-end gap-2">
                    <p className="text-sm font-semibold" style={{ color: textMain }}>
                      NPR {formatCurrency(expense.amount)}
                    </p>

                    <div className="flex flex-wrap justify-end gap-2">
                      {onEditExpense ? (
                        <button
                          type="button"
                          onClick={() => onEditExpense(expense)}
                          disabled={isEditing || isDeleting}
                          className="rounded-full border px-3 py-1 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            borderColor: darkMode ? "#355B68" : "#B6C8CF",
                            color: textMain,
                            backgroundColor: darkMode ? "#315764" : "#F5FAFB",
                          }}
                        >
                          {isEditing ? "Saving..." : "Update"}
                        </button>
                      ) : null}

                      {onDeleteExpense ? (
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(expense)}
                          disabled={isEditing || isDeleting}
                          className="rounded-full border px-3 py-1 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            borderColor: darkMode ? "#7F1D1D" : "#F2B8B5",
                            color: darkMode ? "#FECACA" : "#B42318",
                            backgroundColor: darkMode ? "rgba(127,29,29,0.18)" : "#FFF1F0",
                          }}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="mt-4 rounded-[18px] border border-dashed px-4 py-8 text-center text-sm"
          style={{
            borderColor: darkMode ? "#355B68" : "#C4CFD4",
            color: textSub,
            backgroundColor: cardBg,
          }}
        >
          No expense history yet.
        </div>
      )}
    </section>
  );
};

export default ExpenseHistorySection;
