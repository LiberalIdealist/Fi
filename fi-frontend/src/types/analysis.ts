export type AnalysisType = 'Market' | 'Financial' | 'Risk' | 'Sentiment';

export interface AnalysisRequest {
  query: string;
  company?: string;
  ticker?: string;
  type?: string;
  context?: {
    marketIndicators?: Array<{
      name: string;
      value: string;
      change: string;
    }>;
    userProfile?: {
      riskTolerance?: string;
      investmentHorizon?: string;
    };
  };
}

export interface MarketAnalysis {
  company?: string;
  type?: string;
  analysis?: {
    technical?: string;
    fundamental?: string;
    risk?: string;
  };
  content?: string; // For direct response content
  summary?: string;
  keyHighlights?: string[];
  metrics?: {
    score: number;
    confidence: number;
    risk: number;
  };
  timestamp?: string;
}
