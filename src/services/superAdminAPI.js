import { API_BASE_URL } from "./authAPI";
import { tokenService } from "./tokenService";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${tokenService.getToken()}`,
  "Content-Type": "application/json",
});

const parseJSON = async (response) => {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return { data: payload.data ?? payload };
};

export const superAdminAPI = {
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/superadmin/dashboard/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return parseJSON(response);
  },

  listRecentMembers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/superadmin/members/recent`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return parseJSON(response);
  },

  listRecentActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/api/superadmin/activity`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return parseJSON(response);
  },
};
