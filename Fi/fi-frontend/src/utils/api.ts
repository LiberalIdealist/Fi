import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Extend the AxiosInstance type to include our custom methods
interface ExtendedAxiosInstance extends AxiosInstance {
  health: () => Promise<boolean>;
  retryRequest: (config: AxiosRequestConfig, maxRetries?: number) => Promise<any>;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // Fallback URL
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json'
  }
}) as ExtendedAxiosInstance;

// Safe localStorage access (prevents errors in SSR environments)
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fi_auth_token');
  }
  return null;
};

// Request interceptor with better error handling
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      // Fix the headers type issue
      config.headers = config.headers || axios.AxiosHeaders.from({});
      // Set the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request configuration error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError | any) => {
    // Create a safe error object with defaults for logging
    const safeError = {
      url: error?.config?.url || 'unknown URL',
      method: error?.config?.method || 'unknown method',
      status: error?.response?.status || 'no status',
      data: error?.response?.data || 'no data',
      message: error?.message || 'Unknown error'
    };
    
    // Log the safe error object
    console.error('API request failed:', safeError);
    
    // Special handling for network errors (no response received)
    if (error?.message === 'Network Error') {
      const networkError = new Error('Network error: Unable to reach the server. Please check your connection.') as any;
      networkError.isNetworkError = true;
      networkError.status = 0;
      return Promise.reject(networkError);
    }

    // Handle CORS errors
    if (error?.message?.includes('CORS')) {
      const corsError = new Error('Cross-Origin Request Blocked: The server is not configured to allow requests from this origin.') as any;
      corsError.isCorsError = true;
      corsError.status = 0;
      return Promise.reject(corsError);
    }
    
    // Handle timeout errors
    if (error?.code === 'ECONNABORTED') {
      const timeoutError = new Error('Request timeout: The server took too long to respond.') as any;
      timeoutError.isTimeoutError = true;
      timeoutError.status = 408;
      return Promise.reject(timeoutError);
    }

    // Specific handling for auth errors
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      console.warn('Authentication error detected:', error.response.status);
      
      // Only redirect if in browser and not already on auth page
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/signup')) {
        
        console.log('Clearing invalid auth data and redirecting to login');
        localStorage.removeItem('fi_auth_token');
        localStorage.removeItem('user_data');
        
        // Use window.location for a clean redirect that resets the app state
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 100);
      }
    }

    // Extract a meaningful error message with fallbacks at each level
    const errorMessage = 
      error?.response?.data?.error || 
      error?.response?.data?.message || 
      error?.message ||
      'Unknown API error';
    
    // Create enhanced error object with better type safety
    const enhancedError = new Error(`API Error: ${errorMessage}`) as any;
    enhancedError.status = error?.response?.status;
    enhancedError.data = error?.response?.data;
    enhancedError.originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

// Add API health check method
api.health = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    return false;
  }
};

// Add retry functionality for failed requests
api.retryRequest = async (config: AxiosRequestConfig, maxRetries = 3): Promise<any> => {
  let retries = 0;
  
  const executeRequest = async (): Promise<any> => {
    try {
      return await api.request(config);
    } catch (error) {
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying request (${retries}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        return executeRequest();
      }
      throw error;
    }
  };
  
  return executeRequest();
};

// Function to safely store API responses in cache
const cacheResponse = (key: string, data: any, expiryMinutes: number = 30): void => {
  if (typeof window !== 'undefined') {
    const item = {
      data,
      expiry: Date.now() + (expiryMinutes * 60 * 1000)
    };
    try {
      localStorage.setItem(`fi_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  }
};

// Function to get cached response
const getCachedResponse = (key: string): any | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(`fi_cache_${key}`);
    if (!item) return null;
    
    const parsedItem = JSON.parse(item);
    
    // Check if cache has expired
    if (Date.now() > parsedItem.expiry) {
      localStorage.removeItem(`fi_cache_${key}`);
      return null;
    }
    
    return parsedItem.data;
  } catch (error) {
    console.warn('Failed to retrieve cached response:', error);
    return null;
  }
};

// Add to API object
api.cacheResponse = cacheResponse;
api.getCachedResponse = getCachedResponse;

// Update the interface to include the new methods
declare module 'axios' {
  interface AxiosInstance {
    health: () => Promise<boolean>;
    retryRequest: (config: AxiosRequestConfig, maxRetries?: number) => Promise<any>;
    cacheResponse: (key: string, data: any, expiryMinutes?: number) => void;
    getCachedResponse: (key: string) => any | null;
  }
}

export default api;