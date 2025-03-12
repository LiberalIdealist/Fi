"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import api from '../utils/api';

// Define auth user type
export type User = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  profile?: {
    role?: string;
    preferences?: any;
    createdAt?: string;
    [key: string]: any;
  };
};

// Create auth context
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<User | null>;
}

// Create a default context value for SSR
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  getIdToken: async () => '',
  login: async () => {},
  logout: async () => {},
  checkSession: async () => null,
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage on mount
    const checkAuth = async () => {
      try {
        // Only run in browser environment
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('fi_auth_token');
          
          if (token) {
            // You could verify the token or fetch user data here
            const userData = localStorage.getItem('user_data');
            if (userData) {
              setUser(JSON.parse(userData));
            } else {
              // Try to check session if token exists but no user data
              await checkSession();
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

  const checkSession = async (): Promise<User | null> => {
    try {
      // This endpoint should return full user data including Firestore profile
      const response = await api.get('/auth/session');
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Session check failed:", error);
      await logout();
      return null;
    }
  };

  // Get ID token for API requests
  const getIdToken = async (): Promise<string> => {
    // Only run in browser environment
    if (typeof window === 'undefined') return '';
    
    const token = localStorage.getItem('fi_auth_token');
    if (!token) throw new Error("No authentication token found");
    return token;
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      
      localStorage.setItem('fi_auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fi_auth_token');
      localStorage.removeItem('user_data');
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    getIdToken,
    login,
    logout,
    checkSession
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};