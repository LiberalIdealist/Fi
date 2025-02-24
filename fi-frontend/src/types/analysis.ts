export type AnalysisType = 'Market' | 'Financial' | 'Risk' | 'Sentiment';

export interface MarketAnalysis {
  company: string;
  type: AnalysisType;
  analysis: string;
  summary: string;
  keyHighlights: string[];
  metrics: {
    score: number;
    confidence: number;
    risk: number;
  };
  timestamp: string;
}

export interface AnalysisRequest {
  company: string;
  type: AnalysisType;
  ticker: string;
}
