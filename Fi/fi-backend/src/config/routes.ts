const routes = {
    auth: {
      login: "/api/auth/login",
      signup: "/api/auth/signup",
      session: "/api/auth/session",
    },
    chat: {
      geminiAnalysis: "/api/chat/gemini-analysis",
      chatGPTProfiling: "/api/chat/chatgpt-profiling",
    },
    documents: {
      upload: "/api/documents/upload",
      analyze: "/api/documents/analyze",
      delete: "/api/documents/delete",
    },
    market: {
      getStockData: "/api/market/get-stock-data",
      getNews: "/api/market/get-news",
      getMutualFunds: "/api/market/get-mutual-funds",
    },
    profile: {
      getProfile: "/api/profile/get-profile",
      updateProfile: "/api/profile/update-profile",
      deleteProfile: "/api/profile/delete-profile",
    },
    recommendations: {
      generatePortfolio: "/api/recommendations/generate-portfolio",
      riskAssessment: "/api/recommendations/risk-assessment",
      swotAnalysis: "/api/recommendations/swot-analysis",
    }
  };
  
  export default routes;