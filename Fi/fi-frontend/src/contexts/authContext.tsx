"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Add this import if you're using Next.js router
import { useRouter } from 'next/navigation';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (idToken: string) => Promise<User | null>;
  logout: () => Promise<void>;
  checkSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();

  // Debug state changes
  useEffect(() => {
    console.log('AuthContext state changed:', { user: user?.uid || null, loading });
  }, [user, loading]);

  // Initial session check on mount
  useEffect(() => {
    console.log('AuthProvider: Initial mount, checking session');
    let isMounted = true;
    
    const initialSessionCheck = async () => {
      try {
        // First check if we have saved user data
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('fi_auth_token');
          const savedUserData = localStorage.getItem('user_data');
          
          console.log('AuthProvider: Found token:', !!token, 'Found user data:', !!savedUserData);
          
          // If we have saved user data, use it immediately to avoid loading state
          if (savedUserData && token) {
            try {
              const parsedUser = JSON.parse(savedUserData);
              if (isMounted) {
                setUser(parsedUser);
                console.log('AuthProvider: Set user from localStorage');
              }
            } catch (e) {
              console.error('Failed to parse saved user data');
              localStorage.removeItem('user_data');
            }
          }
          
          // If we have a token, verify it with the backend
          if (token) {
            try {
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              const response = await api.get('/auth/session');
              
              if (response.data?.user && isMounted) {
                const userData = response.data.user;
                setUser(userData);
                localStorage.setItem('user_data', JSON.stringify(userData));
                console.log('AuthProvider: Session verified with backend');
              }
            } catch (error) {
              console.error('Session verification failed:', error);
              // Clear invalid auth data
              localStorage.removeItem('fi_auth_token');
              localStorage.removeItem('user_data');
              if (isMounted) {
                setUser(null);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error during initial session check:', error);
      } finally {
        // Always set these states when done
        if (isMounted) {
          setLoading(false);
          setInitialCheckDone(true);
          console.log('AuthProvider: Initial check complete, loading =', false);
        }
      }
    };
    
    initialSessionCheck();
    
    // Safety timeout - ensure loading state is reset after 3 seconds max
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.log('AuthProvider: ⚠️ Safety timeout triggered');
        setLoading(false);
        setInitialCheckDone(true);
      }
    }, 3000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const loginWithGoogle = async (idToken: string): Promise<User | null> => {
    try {
      setLoading(true);
      console.log('AuthProvider: Logging in with Google token');
      
      const response = await api.post('/auth/google', { idToken });
      
      if (response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        
        // Store auth data
        localStorage.setItem('fi_auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        console.log('AuthProvider: Google login successful');
        return userData;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Google login failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('AuthProvider: Logging out');
      
      // Clear auth data
      localStorage.removeItem('fi_auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      
      // Try to invalidate the session on the server
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Error during server logout:', error);
      }
      
      // Redirect to login
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async (): Promise<User | null> => {
    try {
      console.log('AuthProvider: Checking session');
      if (typeof window === 'undefined') {
        console.log('AuthProvider: Server-side check, no session');
        return null;
      }
      
      // If we already have a user, return it
      if (user) {
        console.log('AuthProvider: User already exists, no need to check session');
        return user;
      }
      
      const token = localStorage.getItem('fi_auth_token');
      if (!token) {
        console.log('AuthProvider: No token found');
        setLoading(false);
        return null;
      }
      
      console.log('AuthProvider: Token found, verifying with backend');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get('/auth/session');
      
      if (response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        console.log('AuthProvider: Session verified successfully');
        return userData;
      } else {
        throw new Error('Invalid session response');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('fi_auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    logout,
    checkSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};