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

export const insightsAPI = {
  getInsights: async (month) => {
    const m = month || getCurrentMonth();
    const response = await fetch(`${API_BASE_URL}/api/insights?month=${m}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get insights");
    }
    return data;
  },

  getIncomeVsSpending: async () => {
    const response = await fetch(`${API_BASE_URL}/api/insights/income-vs-spending`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get income vs spending");
    }
    return data;
  },
};

export { getCurrentMonth };
