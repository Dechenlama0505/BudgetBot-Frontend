import { API_BASE_URL } from "./authAPI";
import { tokenService } from "./tokenService";

const getAuthHeaders = () => {
  const token = tokenService.getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const categoryAPI = {
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get categories");
    }
    return data;
  },

  updateBudgetCategories: async (budgetCategories) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/budget-categories`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ budgetCategories }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update budget categories");
    }
    return data;
  },
};
