const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const getSafeUser = () => {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const tokenService = {
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user || null));
  },

  getUser: () => {
    return getSafeUser();
  },

  getRole: () => {
    return getSafeUser()?.role || null;
  },

  getStatus: () => {
    return getSafeUser()?.status || null;
  },

  getHomePath: () => {
    const role = tokenService.getRole();

    if (role === "admin") return "/admin/dashboard";
    if (role === "superadmin") return "/superadmin/dashboard";

    return "/home";
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  logout: () => {
    tokenService.clearAuth();
  },

  removeToken: () => {
    tokenService.clearAuth();
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
