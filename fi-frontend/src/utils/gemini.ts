import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisRequest, MarketAnalysis, RiskLevel } from "@/types/analysis";
import { rateLimit } from "@/utils/rateLimit";
import { cache } from "@/utils/cache";

const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

class AnalysisError extends Error {
  constructor(
    message: string, 
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}

if (typeof process.env.GEMINI_API_KEY !== 'string') {
  throw new Error('GEMINI_API_KEY environment variable is not defined');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
} as const;

type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

const RISK_KEYWORDS = {
  high: ['volatile', 'risky', 'uncertain', 'unstable'],
  medium: ['moderate', 'stable', 'balanced'],
  low: ['safe', 'secure', 'consistent', 'reliable']
};

export async function getMarketAnalysis(
  request: AnalysisRequest
): Promise<MarketAnalysis> {
  try {
    const cachedAnalysis = await cache.get(getCacheKey(request));
    if (cachedAnalysis) {
      return JSON.parse(cachedAnalysis);
    }

    if (!await rateLimit.check()) {
      throw new AnalysisError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = generatePrompt(request);
    
    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new AnalysisError('No response from Gemini', 'NO_RESPONSE');
    }

    const text = result.response.text();
    const metrics = await analyzeText(text);

    const analysis: MarketAnalysis = {
      type: request.type,
      company: request.company,
      language: request.language || 'en',
      analysis: text,
      metrics,
      timestamp: new Date().toISOString()
    };

    await cache.set(getCacheKey(request), JSON.stringify(analysis), 3600);
    return analysis;

  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof AnalysisError) {
      throw error;
    }
    throw new AnalysisError(
      `Failed to generate market analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'ANALYSIS_FAILED'
    );
  }
}

function generatePrompt(request: AnalysisRequest): string {
  return `
    Analyze ${request.company} from ${request.type} perspective.
    Include:
    - Key performance metrics
    - Risk factors and mitigation strategies
    - Market opportunities and challenges
    - Competitive analysis
    - Future outlook
    
    Provide detailed analysis in ${SUPPORTED_LANGUAGES[request.language || 'en']}.
    Focus on Indian market context.
    Format the response in clear sections with bullet points.
  `.trim();
}

async function analyzeText(text: string): Promise<MarketAnalysis['metrics']> {
  const sentimentScore = calculateScore(text);
  const confidenceScore = calculateConfidence(text);
  const riskLevel = determineRisk(text);

  return {
    score: sentimentScore,
    confidence: confidenceScore,
    risk: riskLevel
  };
}

function getCacheKey(request: AnalysisRequest): string {
  return `analysis:${request.company}:${request.type}:${request.language}`;
}

// Helper functions
function calculateScore(analysis: string): number {
  const positiveWords = ['growth', 'profit', 'success', 'strong', 'positive'];
  const negativeWords = ['loss', 'debt', 'weak', 'negative', 'decline'];
  
  const words = analysis.toLowerCase().split(/\s+/);
  let score = 0.5; // neutral starting point
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 0.1;
    if (negativeWords.includes(word)) score -= 0.1;
  });
  
  return Math.max(0, Math.min(1, score));
}

function calculateConfidence(analysis: string): number {
  const confidenceWords = [
    'definitely', 'certainly', 'clearly', 'strongly',
    'likely', 'probably', 'possibly', 'maybe'
  ];
  
  const words = analysis.toLowerCase().split(/\s+/);
  let confidence = 0.5;
  
  words.forEach(word => {
    const index = confidenceWords.indexOf(word);
    if (index !== -1) {
      confidence += (0.1 * (confidenceWords.length - index)) / confidenceWords.length;
    }
  });
  
  return Math.max(0, Math.min(1, confidence));
}

function determineRisk(analysis: string): RiskLevel {
  const text = analysis.toLowerCase();
  let riskScore = 0;
  
  Object.entries(RISK_KEYWORDS).forEach(([level, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        riskScore += level === 'high' ? 2 : level === 'medium' ? 1 : 0;
      }
    });
  });
  
  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}
