"use client";

import { useState, useEffect, createContext, useContext } from 'react';

// Define auth user type
type User = {
  uid: string;
  email: string | null;
  displayName?: string | null;
};

// Create auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create a default context value for SSR
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  getIdToken: async () => '',
  login: async () => {},
  logout: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage on mount
    const checkAuth = async () => {
      try {
        // Only run in browser environment
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          
          if (token) {
            // You could verify the token or fetch user data here
            const userData = localStorage.getItem('user_data');
            if (userData) {
              setUser(JSON.parse(userData));
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Get ID token for API requests
  const getIdToken = async (): Promise<string> => {
    // Only run in browser environment
    if (typeof window === 'undefined') return '';
    
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error("No authentication token found");
    return token;
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    getIdToken,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook with SSR safety
export const useAuth = () => {
  // For server-side rendering, return the default context
  if (typeof window === 'undefined') {
    return defaultContextValue;
  }
  
  const context = useContext(AuthContext);
  return context;
};