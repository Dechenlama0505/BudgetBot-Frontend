import { API_BASE_URL } from "./authAPI";
import { tokenService } from "./tokenService";

const parseJSON = async (response) => {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return { data: payload.data ?? payload };
};

export const adminDashboardAPI = {
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenService.getToken()}`,
        "Content-Type": "application/json",
      },
    });

    return parseJSON(response);
  },
};
