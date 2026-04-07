import { API_BASE_URL } from "./authAPI";
import { tokenService } from "./tokenService";

const getAuthHeaders = () => {
  const token = tokenService.getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const expenseAPI = {
  addExpense: async ({ amount, category, date }) => {
    const response = await fetch(`${API_BASE_URL}/api/expenses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount: Number(amount),
        category: category?.trim() || "Others",
        date: date || new Date().toISOString(),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to add expense");
    }
    return data;
  },

  getExpenses: async (options = {}) => {
    const { month, all } = options;
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (all) params.set("all", "true");
    const qs = params.toString();
    const url = `${API_BASE_URL}/api/expenses${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, data: { expenses: [], total: 0, categoryTotals: {} } };
      }
      throw new Error(data.message || "Failed to get expenses");
    }
    return data;
  },

  getSummary: async (month) => {
    const url = month
      ? `${API_BASE_URL}/api/expenses/summary?month=${encodeURIComponent(month)}`
      : `${API_BASE_URL}/api/expenses/summary`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        return { success: true, data: { total: 0, categoryTotals: {} } };
      }
      throw new Error(data.message || "Failed to get summary");
    }
    return data;
  },

  getExpenseHistory: async (limit) => {
    const params = new URLSearchParams();

    if (limit) {
      params.set("limit", String(limit));
    }

    const qs = params.toString();
    const url = `${API_BASE_URL}/api/expenses/history${qs ? `?${qs}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get expense history");
    }

    return {
      data: {
        expenses: Array.isArray(data.expenses) ? data.expenses : [],
      },
    };
  },
};
