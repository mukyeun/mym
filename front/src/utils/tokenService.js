const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const tokenService = {
  setToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('Token saved:', token.slice(0, 15) + '...');
    }
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('User saved:', user);
    }
  },

  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  hasToken: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  hasUser: () => {
    return !!localStorage.getItem(USER_KEY);
  },

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('Auth data cleared');
  },

  getAuthStatus: () => {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    const hasUser = !!localStorage.getItem(USER_KEY);
    console.log('Stored auth data:', { hasToken, hasUser });
    return { hasToken, hasUser };
  }
};

export default tokenService;