export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001";

const parseJSON = async (response) => {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return { data: payload.data ?? payload };
};

export const authAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return parseJSON(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    return parseJSON(response);
  },

  getProfile: async () => {
    const token = localStorage.getItem("auth_token");

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return parseJSON(response);
  },

  updateProfile: async (fullName, monthlyIncome, profilePicture) => {
    const token = localStorage.getItem("auth_token");
    const formData = new FormData();

    if (fullName) {
      formData.append("fullName", fullName);
    }

    if (
      monthlyIncome !== null &&
      monthlyIncome !== undefined &&
      monthlyIncome !== ""
    ) {
      formData.append("monthlyIncome", monthlyIncome);
    }

    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return parseJSON(response);
  },

  deleteProfilePicture: async () => {
    const token = localStorage.getItem("auth_token");

    const response = await fetch(`${API_BASE_URL}/api/auth/profile/picture`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return parseJSON(response);
  },

  changePassword: async (currentPassword, newPassword, confirmNewPassword) => {
    const token = localStorage.getItem("auth_token");

    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    });

    return parseJSON(response);
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    return parseJSON(response);
  },

  resetPassword: async (email, token, newPassword, confirmNewPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        token,
        newPassword,
        confirmNewPassword,
      }),
    });

    return parseJSON(response);
  },
};
