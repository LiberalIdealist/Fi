import api from '../utils/api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('fi_auth_token', response.data.token);
      // Also store user data for consistency with AuthContext
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  signup: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    // Store token and user data if received from signup
    if (response.data?.token) {
      localStorage.setItem('fi_auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('fi_auth_token');
    localStorage.removeItem('user_data');
  },
  
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/session');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  getIdToken: (): string | null => {
    return localStorage.getItem('fi_auth_token');
  },
  
  getUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};