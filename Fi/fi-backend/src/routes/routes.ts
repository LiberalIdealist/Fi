/**
 * Enhanced route configuration with metadata
 */

// Define types for better documentation and type safety
interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requiresAuth: boolean;
}

interface RouteCategory {
  [key: string]: RouteConfig;
}

interface Routes {
  [category: string]: RouteCategory;
}

/**
 * Complete route definitions with metadata
 */
const routes: Routes = {
  auth: {
    login: {
      path: "/controllers/auth/login",
      method: "POST",
      description: "Authenticate user and return JWT token",
      requiresAuth: false
    },
    signup: {
      path: "/controllers/auth/signup",
      method: "POST",
      description: "Register a new user account",
      requiresAuth: false
    },
    session: {
      path: "/controllers/auth/session",
      method: "GET",
      description: "Validate user session and return user data",
      requiresAuth: true
    }
  },
  chat: {
    geminiAnalysis: {
      path: "/models/chat/gemini-analysis",
      method: "POST",
      description: "Analyze financial data using Google Gemini AI",
      requiresAuth: true
    },
    chatGPTProfiling: {
      path: "/models/chat/chatgpt-profiling",
      method: "POST",
      description: "Generate financial profile insights using ChatGPT",
      requiresAuth: true
    }
  },
  documents: {
    upload: {
      path: "/models/documents/upload",
      method: "POST",
      description: "Upload financial documents for analysis",
      requiresAuth: true
    },
    analyze: {
      path: "/models/documents/analyze",
      method: "POST",
      description: "Extract and analyze data from uploaded documents",
      requiresAuth: true
    },
    delete: {
      path: "/models/documents/delete",
      method: "DELETE",
      description: "Remove uploaded documents",
      requiresAuth: true
    }
  },
  market: {
    getStockData: {
      path: "/controllers/market/get-stock-data",
      method: "GET",
      description: "Fetch current stock data and related news",
      requiresAuth: true
    },
    getNews: {
      path: "/controllers/market/get-news",
      method: "GET",
      description: "Get latest financial news articles",
      requiresAuth: true
    },
    getMutualFunds: {
      path: "/controllers/market/get-mutual-funds",
      method: "GET",
      description: "Retrieve mutual funds information",
      requiresAuth: true
    }
  },
  profile: {
    getProfile: {
      path: "/controllers/profile/get-profile",
      method: "GET",
      description: "Retrieve user financial profile",
      requiresAuth: true
    },
    updateProfile: {
      path: "/controllers/profile/update-profile",
      method: "PUT",
      description: "Update user financial profile information",
      requiresAuth: true
    },
    deleteProfile: {
      path: "/controllers/profile/delete-profile",
      method: "DELETE",
      description: "Delete user profile and associated data",
      requiresAuth: true
    }
  },
  recommendations: {
    generatePortfolio: {
      path: "/controllers/recommendations/generate-portfolio",
      method: "POST",
      description: "Create personalized investment portfolio recommendations",
      requiresAuth: true
    },
    riskAssessment: {
      path: "/controllers/recommendations/risk-assessment",
      method: "POST",
      description: "Analyze user's risk tolerance and investment preferences",
      requiresAuth: true
    },
    swotAnalysis: {
      path: "/controllers/recommendations/swot-analysis",
      method: "POST",
      description: "Generate strengths, weaknesses, opportunities, and threats analysis of financial portfolio",
      requiresAuth: true
    }
  }
};

/**
 * Helper functions to use the routes
 */
export const getRoutePath = (category: string, routeName: string): string => {
  return routes[category]?.[routeName]?.path || '';
};

export const requiresAuth = (path: string): boolean => {
  for (const category in routes) {
    for (const route in routes[category]) {
      if (routes[category][route].path === path) {
        return routes[category][route].requiresAuth;
      }
    }
  }
  return true; // Default to requiring auth for safety
};

export default routes;