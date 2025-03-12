import api from '../utils/api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('fi_auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  googleLogin: async (idToken: string) => {
    const response = await api.post('/auth/google', { idToken });
    
    if (response.data?.user) {
      // Add console log to verify what's being stored
      console.log('Storing auth token:', idToken);
      console.log('Storing user data:', response.data.user);
      
      // Store the ID token - make sure this is working
      localStorage.setItem('fi_auth_token', idToken);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  signup: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
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
      localStorage.removeItem('fi_auth_token');
      localStorage.removeItem('user_data');
      throw error;
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