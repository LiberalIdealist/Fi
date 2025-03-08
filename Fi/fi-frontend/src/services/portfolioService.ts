import api from '../utils/api';

export interface PortfolioData {
  allocation?: Record<string, number>;
  recommendations?: string;
  expectedReturns?: string;
  [key: string]: any;
}

export interface PortfolioResponse {
  portfolio: PortfolioData | string;
  message?: string;
}

export interface RiskAssessmentResponse {
  riskProfile: string;
  score: number;
  details: Record<string, any>;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export const portfolioService = {
  // Generate portfolio based on user profile and analysis
  generatePortfolio: async (userData: any): Promise<PortfolioResponse> => {
    const response = await api.post('/recommendations/generate-portfolio', userData);
    return response.data;
  },
  
  // Get risk assessment
  getRiskAssessment: async (): Promise<RiskAssessmentResponse> => {
    const response = await api.get('/recommendations/risk-assessment');
    return response.data;
  },
  
  // Get SWOT analysis
  getSwotAnalysis: async (): Promise<SwotAnalysis> => {
    const response = await api.get('/recommendations/swot-analysis');
    return response.data;
  }
};