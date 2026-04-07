import { API_BASE_URL } from "./authAPI";
import { tokenService } from "./tokenService";

const getAuthHeaders = () => {
  const token = tokenService.getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeListArgs = (searchOrOptions) => {
  if (typeof searchOrOptions === "string") {
    return {
      search: searchOrOptions,
      status: "all",
    };
  }

  return {
    search: searchOrOptions?.search || "",
    status: searchOrOptions?.status || "all",
  };
};

const mapMember = (member) => ({
  id: member.id || member._id,
  fullName: member.fullName,
  email: member.email,
  role: member.role || "user",
  status: member.status || "active",
  monthlyIncome: member.monthlyIncome ?? null,
  profilePicture: member.profilePicture ?? null,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
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

const getRoleBasePath = () => {
  const role = tokenService.getRole();

  return role === "superadmin"
    ? `${API_BASE_URL}/api/superadmin`
    : `${API_BASE_URL}/api/admin`;
};

export const memberManagementAPI = {
  listMembers: async (searchOrOptions = "") => {
    const { search, status } = normalizeListArgs(searchOrOptions);
    const page = searchOrOptions?.page || 1;
    const limit = searchOrOptions?.limit || 100;
    const role = tokenService.getRole();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status && status !== "all") {
      params.set("status", status);
    }

    params.set("page", String(page));
    params.set("limit", String(limit));

    const query = params.toString();
    const payload = await requestJSON(
      `${role === "superadmin" ? `${API_BASE_URL}/api/superadmin` : getRoleBasePath()}/members${query ? `?${query}` : ""}`,
      { method: "GET" },
      "Failed to load members"
    );

    return {
      data: {
        members: (payload.data?.members || []).map(mapMember),
        pagination: payload.data?.pagination || {
          page,
          limit,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
        message: payload.message,
      },
    };
  },

  getMemberById: async (memberId) => {
    const role = tokenService.getRole();

    if (role === "superadmin") {
      const response = await memberManagementAPI.listMembers();
      const member =
        response.data?.members?.find((entry) => entry.id === memberId) || null;

      return {
        data: {
          member,
        },
      };
    }

    const payload = await requestJSON(
      `${getRoleBasePath()}/members/${memberId}`,
      { method: "GET" },
      "Failed to load member details"
    );

    return {
      data: {
        member: payload.data?.member ? mapMember(payload.data.member) : null,
        message: payload.message,
      },
    };
  },

  createMember: async (memberData) => {
    const payload = await requestJSON(
      `${getRoleBasePath()}/members`,
      {
        method: "POST",
        body: JSON.stringify({
          fullName: memberData.fullName,
          email: memberData.email,
          password: memberData.password,
          status: memberData.status,
        }),
      },
      "Failed to create member"
    );

    return {
      data: {
        member: payload.data?.member ? mapMember(payload.data.member) : null,
        message: payload.message,
      },
    };
  },

  updateMember: async (memberId, memberData) => {
    const payload = await requestJSON(
      `${getRoleBasePath()}/members/${memberId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          fullName: memberData.fullName,
          email: memberData.email,
          status: memberData.status,
        }),
      },
      "Failed to update member"
    );

    return {
      data: {
        member: payload.data?.member ? mapMember(payload.data.member) : null,
        message: payload.message,
      },
    };
  },

  changeMemberStatus: async (memberId, nextStatus) => {
    const payload = await requestJSON(
      `${getRoleBasePath()}/members/${memberId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          status: nextStatus,
        }),
      },
      "Failed to update member status"
    );

    return {
      data: {
        member: payload.data?.member ? mapMember(payload.data.member) : null,
        message: payload.message || "Member status updated successfully",
      },
    };
  },

  approveMember: async (memberId) => {
    if (tokenService.getRole() === "superadmin") {
      return memberManagementAPI.changeMemberStatus(memberId, "active");
    }

    const payload = await requestJSON(
      `${API_BASE_URL}/api/admin/members/${memberId}/approve`,
      { method: "PATCH" },
      "Failed to approve member"
    );

    return {
      data: {
        member: payload.data?.member ? mapMember(payload.data.member) : null,
        message: payload.message,
      },
    };
  },

  rejectMember: async (memberId) => {
    if (tokenService.getRole() === "superadmin") {
      return memberManagementAPI.changeMemberStatus(memberId, "inactive");
    }

    const payload = await requestJSON(
      `${API_BASE_URL}/api/admin/members/${memberId}/reject`,
      { method: "PATCH" },
      "Failed to reject member"
    );

    return {
      data: {
        member: payload.data?.member ? mapMember(payload.data.member) : null,
        message: payload.message,
      },
    };
  },

  deleteMember: async (memberId) => {
    const payload = await requestJSON(
      `${getRoleBasePath()}/members/${memberId}`,
      { method: "DELETE" },
      "Failed to delete member"
    );

    return {
      data: {
        success: payload.success,
        message: payload.message,
      },
    };
  },

  listRecentActivity: async (limit = 3) => {
    const role = tokenService.getRole();

    if (role === "superadmin") {
      const payload = await requestJSON(
        `${API_BASE_URL}/api/superadmin/activity`,
        { method: "GET" },
        "Failed to load recent activity"
      );

      return {
        data: {
          activity: Array.isArray(payload.data) ? payload.data : [],
          message: payload.message,
        },
      };
    }

    const payload = await requestJSON(
      `${API_BASE_URL}/api/admin/activity/recent?limit=${encodeURIComponent(limit)}`,
      { method: "GET" },
      "Failed to load recent activity"
    );

    return {
      data: {
        activity: payload.data?.activity || [],
        message: payload.message,
      },
    };
  },
};
