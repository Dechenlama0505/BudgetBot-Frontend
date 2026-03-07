import { API_BASE_URL } from "./authAPI";
import { tokenService } from "./tokenService";

const getAuthHeaders = () => {
  const token = tokenService.getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const getCurrentMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export const budgetAPI = {
  getBudget: async (month) => {
    const m = month || getCurrentMonth();
    const response = await fetch(`${API_BASE_URL}/api/budgets?month=${m}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get budget");
    }
    return data;
  },

  saveBudget: async ({ month, totalAmount, allocations }) => {
    const m = month || getCurrentMonth();
    const response = await fetch(`${API_BASE_URL}/api/budgets`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        month: m,
        totalAmount: Number(totalAmount) || 0,
        allocations: allocations || {},
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to save budget");
    }
    return data;
  },
};
