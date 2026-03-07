export const tokenService = {
    setToken: (token) => {
      localStorage.setItem('auth_token', token);
    },
    
    getToken: () => {
      return localStorage.getItem('auth_token');
    },
    
    removeToken: () => {
      localStorage.removeItem('auth_token');
    },
    
    isAuthenticated: () => {
      return !!localStorage.getItem('auth_token');
    },
  };