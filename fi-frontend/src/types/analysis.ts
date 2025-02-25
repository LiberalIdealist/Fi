export type AnalysisType = 'Market' | 'Financial' | 'Risk' | 'Sentiment';

export interface MarketAnalysis {
  company: string;
  type: AnalysisType;
  analysis: {
    technical: string;
    fundamental: string;
    risk: string;
  };
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
  ticker?: string; // Make ticker optional
}
