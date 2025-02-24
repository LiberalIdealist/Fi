import { SUPPORTED_LANGUAGES } from '@/utils/gemini';

export type AnalysisType = 'technical' | 'fundamental' | 'sentiment';
export type RiskLevel = 'low' | 'medium' | 'high';
export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export interface AnalysisMetrics {
  score: number;      // Range: 0 to 1
  confidence: number; // Range: 0 to 1
  risk: RiskLevel;
}

export interface AnalysisRequest {
  company: string;
  type: AnalysisType;
  language?: SupportedLanguage;
}

export interface MarketAnalysis {
  type: AnalysisType;
  company: string;
  language: SupportedLanguage;
  analysis: string;
  metrics: AnalysisMetrics;
  timestamp: string;
}

export interface AnalysisError {
  code: string;
  message: string;
  details?: unknown;
}
