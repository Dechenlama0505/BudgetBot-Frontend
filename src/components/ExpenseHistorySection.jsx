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

const ExpenseHistorySection = ({
  title = "Expense History",
  expenses = [],
  darkMode = false,
  textMain,
  textSub,
  panelBg,
  cardBg,
  categoryColors = {},
}) => {
  return (
    <section
      className="mt-4 mb-4 rounded-[24px] p-4"
      style={{ backgroundColor: panelBg }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold" style={{ color: textMain }}>
          {title}
        </h3>
      </div>

      {expenses.length ? (
        <div className="mt-4 space-y-3">
          {expenses.map((expense) => {
            const dotColor = categoryColors[expense.category] || "#265D6F";

            return (
              <div
                key={expense.id}
                className="rounded-xl border p-4"
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

                  <p className="text-sm font-semibold" style={{ color: textMain }}>
                    NPR {formatCurrency(expense.amount)}
                  </p>
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
          }}
        >
          No expense history yet.
        </div>
      )}
    </section>
  );
};

export default ExpenseHistorySection;
