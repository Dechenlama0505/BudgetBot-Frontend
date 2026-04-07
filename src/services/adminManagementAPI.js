import { API_BASE_URL } from "./authAPI";
import { tokenService } from "./tokenService";

const getAuthHeaders = () => {
  const token = tokenService.getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const mapAccount = (account) => ({
  id: account.id || account._id,
  fullName: account.fullName,
  email: account.email,
  role: account.role || "admin",
  status: account.status || "active",
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

const requestJSON = async (url, options = {}, fallbackMessage = "Request failed") => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload;
};

const filterAccounts = (accounts, search = "") => {
  const normalized = search.trim().toLowerCase();

  if (!normalized) {
    return accounts;
  }

  return accounts.filter((account) => {
    return (
      account.fullName?.toLowerCase().includes(normalized) ||
      account.email?.toLowerCase().includes(normalized) ||
      account.status?.toLowerCase().includes(normalized) ||
      account.role?.toLowerCase().includes(normalized)
    );
  });
};

export const adminManagementAPI = {
  listAdmins: async (search = "") => {
    const [adminsPayload, superAdminsPayload] = await Promise.all([
      requestJSON(`${API_BASE_URL}/api/superadmin/admins`, { method: "GET" }, "Failed to load admins"),
      requestJSON(
        `${API_BASE_URL}/api/superadmin/superadmins`,
        { method: "GET" },
        "Failed to load super admins"
      ),
    ]);

    const accounts = [
      ...(adminsPayload.data?.admins || []).map(mapAccount),
      ...(superAdminsPayload.data?.superAdmins || []).map(mapAccount),
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return {
      data: {
        admins: filterAccounts(accounts, search),
      },
    };
  },

  listSuperAdmins: async () => {
    const payload = await requestJSON(
      `${API_BASE_URL}/api/superadmin/superadmins`,
      { method: "GET" },
      "Failed to load super admins"
    );

    return {
      data: {
        superAdmins: (payload.data?.superAdmins || []).map(mapAccount),
        message: payload.message,
      },
    };
  },

  createAdmin: async (accountData) => {
    const isSuperAdmin = accountData.role === "superadmin";
    const endpoint = isSuperAdmin ? "superadmins" : "admins";
    const payload = await requestJSON(
      `${API_BASE_URL}/api/superadmin/${endpoint}`,
      {
        method: "POST",
        body: JSON.stringify({
          fullName: accountData.fullName,
          email: accountData.email,
          password: accountData.password,
        }),
      },
      `Failed to create ${isSuperAdmin ? "super admin" : "admin"}`
    );

    const account = payload.data?.superAdmin || payload.data?.admin || null;

    return {
      data: {
        admin: account ? mapAccount(account) : null,
        message: payload.message,
      },
    };
  },

  createSuperAdmin: async (accountData) => {
    return adminManagementAPI.createAdmin({
      ...accountData,
      role: "superadmin",
    });
  },

  updateAdmin: async (accountId, accountData) => {
    const isSuperAdmin = accountData.role === "superadmin";
    const endpoint = isSuperAdmin ? "superadmins" : "admins";
    const payload = await requestJSON(
      `${API_BASE_URL}/api/superadmin/${endpoint}/${accountId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          fullName: accountData.fullName,
          status: accountData.status,
        }),
      },
      `Failed to update ${isSuperAdmin ? "super admin" : "admin"}`
    );

    const account = payload.data?.superAdmin || payload.data?.admin || null;

    return {
      data: {
        admin: account ? mapAccount(account) : null,
        message: payload.message,
      },
    };
  },

  updateSuperAdmin: async (accountId, accountData) => {
    return adminManagementAPI.updateAdmin(accountId, {
      ...accountData,
      role: "superadmin",
    });
  },

  deleteAdmin: async (accountId, role = "admin") => {
    const endpoint = role === "superadmin" ? "superadmins" : "admins";
    const payload = await requestJSON(
      `${API_BASE_URL}/api/superadmin/${endpoint}/${accountId}`,
      { method: "DELETE" },
      `Failed to delete ${role === "superadmin" ? "super admin" : "admin"}`
    );

    return {
      data: {
        success: payload.success,
        message: payload.message,
      },
    };
  },

  deleteSuperAdmin: async (accountId) => {
    return adminManagementAPI.deleteAdmin(accountId, "superadmin");
  },

  listRecentActivity: async (limit = 3) => {
    const payload = await requestJSON(
      `${API_BASE_URL}/api/superadmin/activity?limit=${encodeURIComponent(limit)}`,
      { method: "GET" },
      "Failed to load recent activity"
    );

    return {
      data: {
        activity: Array.isArray(payload.data) ? payload.data.slice(0, limit) : [],
        message: payload.message,
      },
    };
  },
};
