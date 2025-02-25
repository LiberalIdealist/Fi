import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MarketAnalysis, AnalysisRequest } from '@/types/analysis';
import { INDIAN_COMPANIES } from '@/utils/constants';

const execPromise = promisify(exec);

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;

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

interface GeminiError {
  code: string;
  message: string;
  details?: unknown;
}

const handleGeminiError = (error: unknown): GeminiError => {
  if (error instanceof AnalysisError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred'
  };
};

const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  error: (message: string, error: unknown) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: handleGeminiError(error)
    }));
  }
};

if (typeof process.env.GEMINI_API_KEY !== 'string') {
  throw new Error('GEMINI_API_KEY environment variable is not defined');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RISK_KEYWORDS = {
  high: ['volatile', 'risky', 'uncertain', 'unstable'],
  medium: ['moderate', 'stable', 'balanced'],
  low: ['safe', 'secure', 'consistent', 'reliable']
};

function generatePrompt(request: AnalysisRequest, stockData: string): string {
  return `
# ${request.company} (${request.ticker}) Market Analysis

## Data Input
${stockData}

## Analysis Requirements
Please provide a comprehensive analysis including:

### Technical Analysis
- Price trends and patterns
- Moving averages (50-day, 200-day)
- Volume analysis
- Key technical indicators (RSI, MACD)

### Fundamental Analysis
- Financial ratios
- Earnings growth
- Market position
- Industry comparison

### Risk Assessment
- Market risks
- Company-specific risks
- Mitigation strategies

### Market Context
- Indian market perspective
- Global economic impact
- Sector outlook

### Competitive Analysis
- Market share
- Peer comparison
- Competitive advantages

## Output Format
1. Executive Summary (2-3 sentences)
2. Key Investment Points (3-5 bullet points)
3. Detailed Analysis (structured sections)
4. Investment Recommendation (Buy/Hold/Sell with rationale)

Use Markdown formatting for better readability.
`.trim();
}

function validateStockData(stockData: string): boolean {
  try {
    const data = JSON.parse(stockData);
    if (data.error) {
      console.error('Stock data error:', data.error);
      return false;
    }
    const requiredFields = ['Financials', 'Indicators', 'Sentiment'];
    return requiredFields.every(field => data[field] && Object.keys(data[field]).length > 0);
  } catch (error) {
    console.error('Stock data validation error:', error);
    return false;
  }
}

async function getStockData(ticker: string): Promise<string> {
  try {
    const { stdout, stderr } = await execPromise(`python /workspaces/Fi/stock_data.py "${ticker}"`);
    if (stderr) {
      console.error(`Stock data stderr: ${stderr}`);
    }
    if (!validateStockData(stdout)) {
      throw new Error('Insufficient market data available');
    }
    return stdout;
  } catch (error) {
    console.error('Stock data error:', (error as Error).message);
    throw new Error('Failed to fetch complete market data');
  }
}

interface ParsedAnalysis {
  summary: string;
  keyPoints: string[];
  technicalAnalysis: string;
  fundamentalAnalysis: string;
  riskAssessment: string;
  recommendation: string;
}

function extractSection(sections: string[], sectionName: string): string {
  const section = sections.find(s => s.includes(sectionName));
  return section ? section.split('\n').slice(1).join('\n').trim() : '';
}

function extractBulletPoints(sections: string[], sectionName: string): string[] {
  const section = sections.find(s => s.includes(sectionName));
  if (!section) return [];
  
  return section
    .split('\n')
    .filter(line => line.startsWith('- '))
    .map(line => line.substring(2).trim());
}

function parseAnalysisResponse(text: string): ParsedAnalysis {
  const sections = text.split('\n#');
  return {
    summary: extractSection(sections, 'Executive Summary'),
    keyPoints: extractBulletPoints(sections, 'Key Investment Points'),
    technicalAnalysis: extractSection(sections, 'Technical Analysis'),
    fundamentalAnalysis: extractSection(sections, 'Fundamental Analysis'),
    riskAssessment: extractSection(sections, 'Risk Assessment'),
    recommendation: extractSection(sections, 'Investment Recommendation')
  };
}

function getTickerFromCompany(companyName: string): string | undefined {
  const normalizedName = companyName.toUpperCase();
  
  // Common name mappings with updated HDFC handling
  const nameToTicker: Record<string, string> = {
    'TCS': 'TCS.NS',
    'INFOSYS': 'INFY.NS',
    'HINDUSTAN UNILEVER': 'HINDUNILVR.NS',
    'HDFC': 'HDFCBANK.NS',  // Updated to new merged entity
    'HDFC BANK': 'HDFCBANK.NS',
    'BHARTI AIRTEL': 'BHARTIARTL.NS',
    'LARSEN': 'LT.NS',
    'L&T': 'LT.NS',
    // Add more mappings as needed
  };

  // First check name mappings
  if (nameToTicker[normalizedName]) {
    return nameToTicker[normalizedName];
  }

  // Then try direct matches
  const directMatch = INDIAN_COMPANIES.find(ticker => 
    ticker.split('.')[0] === normalizedName
  );
  return directMatch;
}

const analysisCache = new Map<string, {
  data: MarketAnalysis;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedAnalysis(
  company: string
): Promise<MarketAnalysis | null> {
  const cached = analysisCache.get(company);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export async function getMarketAnalysis(
  request: AnalysisRequest
): Promise<MarketAnalysis> {
  try {
    validateAnalysisRequest(request);
    
    const cached = await getCachedAnalysis(request.company);
    if (cached) return cached;
    
    const analysis = await withRateLimit(
      request.company,
      async (): Promise<MarketAnalysis> => {
        const ticker = getTickerFromCompany(request.company);
        if (!ticker) {
          throw new AnalysisError(
            'Invalid company ticker',
            'INVALID_TICKER'
          );
        }

        const stockData = await getStockData(ticker);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = generatePrompt(request, stockData);
        
        const result = await model.generateContent(prompt);
        if (!result || !result.response) {
          throw new Error('Failed to generate analysis');
        }

        const text = result.response.text();
        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        const parsedAnalysis = parseAnalysisResponse(text);

        return {
          company: request.company,
          type: request.type,
          analysis: {
            technical: parsedAnalysis.technicalAnalysis || 'Technical analysis unavailable',
            fundamental: parsedAnalysis.fundamentalAnalysis || 'Fundamental analysis unavailable',
            risk: parsedAnalysis.riskAssessment || 'Risk assessment unavailable'
          },
          summary: parsedAnalysis.summary || 'Analysis summary unavailable',
          keyHighlights: parsedAnalysis.keyPoints.length > 0 ? parsedAnalysis.keyPoints : ['No key highlights available'],
          metrics: {
            score: calculateScore(text),
            confidence: calculateConfidence(text),
            risk: determineRisk(text)
          },
          timestamp: new Date().toISOString()
        };
      }
    );
    
    analysisCache.set(request.company, {
      data: analysis,
      timestamp: Date.now()
    });
    
    return analysis;
  } catch (error) {
    logger.error('Analysis failed', error);
    throw error;
  }
}

export async function processWithGemini(
  prompt: string, 
  timeout = DEFAULT_TIMEOUT, 
  retries = DEFAULT_RETRIES
): Promise<any> {
  try {
    const response = await fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching market analysis:", error);
    throw new Error("Analysis request failed");
  }
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

function determineRisk(analysis: string): number {
  const text = analysis.toLowerCase();
  let riskScore = 0;
  
  Object.entries(RISK_KEYWORDS).forEach(([level, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        riskScore += level === 'high' ? 2 : level === 'medium' ? 1 : 0;
      }
    });
  });
  
  // Convert risk score to a normalized number between 0 and 1
  return Math.min(1, riskScore / 6);
}

const EXTENDED_SENTIMENT_KEYWORDS = {
  positive: ['bullish', 'outperform', 'upgrade', 'growth', 'profit'],
  negative: ['bearish', 'downgrade', 'underperform', 'loss', 'debt'],
  neutral: ['hold', 'stable', 'unchanged', 'mixed']
};

function calculateEnhancedScore(analysis: string): number {
  const words = analysis.toLowerCase().split(/\s+/);
  let score = 0.5;
  let weightedCount = 0;
  
  words.forEach(word => {
    if (EXTENDED_SENTIMENT_KEYWORDS.positive.includes(word)) {
      score += 0.1;
      weightedCount++;
    }
    if (EXTENDED_SENTIMENT_KEYWORDS.negative.includes(word)) {
      score -= 0.1;
      weightedCount++;
    }
  });
  
  return weightedCount > 0 
    ? Math.max(0, Math.min(1, score))
    : 0.5;
}

export async function processMarketAnalysis(request: AnalysisRequest): Promise<MarketAnalysis> {
  try {
    const analysis = {
      technical: `Technical analysis for ${request.company}...`,
      fundamental: `Fundamental analysis for ${request.company}...`,
      risk: `Risk assessment for ${request.company}...`
    };
    
    const metrics = {
      score: Math.random(),
      confidence: Math.random(),
      risk: Math.random()
    };

    return {
      company: request.company,
      type: request.type,
      analysis,
      summary: '',
      keyHighlights: ['No key highlights available'],
      metrics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini processing error:', (error as Error).message);
    throw new Error('Failed to process market analysis');
  }
}

// API Timeout & Rate Limit Config
const API_TIMEOUT = 10000; // 10s
const MAX_RETRIES = 3;

// Function to fetch stock data
export const getStockDataFromAPI = async (ticker: string, metric: string) => {
  try {
    const response = await axios.get(`/api/stockData?ticker=${ticker}&metric=${metric}`, {
      timeout: API_TIMEOUT,
    });

    if (!response.data) throw new Error("No data received from stock API.");
    return response.data;
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, (error as Error).message);
    return null;
  }
};

// Function to get sentiment analysis
export const getSentimentAnalysis = async (news: string[]) => {
  try {
    const response = await axios.post("/api/sentiment", { news }, { timeout: API_TIMEOUT });
    return response.data;
  } catch (error) {
    console.error("Error fetching sentiment analysis:", (error as Error).message);
    return null;
  }
};

// Gemini AI handler for stock analysis
export const queryGemini = async (query: string, context?: any) => {
  try {
    const response = await axios.post("/api/gemini", { query, context }, { timeout: API_TIMEOUT });
    return response.data;
  } catch (error) {
    console.error("Error querying Gemini:", (error as Error).message);
    return null;
  }
};

// Main function to process stock-related queries
export const analyzeStockQuery = async (query: string) => {
  if (query.includes("sentiment")) {
    return getSentimentAnalysis(["Reliance Q3 results are bullish", "TCS sees profit surge"]);
  }

  if (query.includes("PE ratio") || query.includes("financials")) {
    return getStockDataFromAPI("RELIANCE.NS", "PE_Ratio");
  }

  return queryGemini(query);
};

const rateLimiter = new Map<string, number>();

async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>,
  delayMs: number = 1000
): Promise<T> {
  const lastCall = rateLimiter.get(key) || 0;
  const now = Date.now();
  
  if (now - lastCall < delayMs) {
    await new Promise(resolve => setTimeout(resolve, delayMs - (now - lastCall)));
  }
  
  rateLimiter.set(key, now);
  return fn();
}

function validateAnalysisRequest(request: AnalysisRequest): void {
  if (!request.company?.trim()) {
    throw new AnalysisError('Company name is required', 'INVALID_INPUT');
  }
  
  if (!INDIAN_COMPANIES.some(ticker => 
    ticker.startsWith(request.company.toUpperCase())
  )) {
    throw new AnalysisError(
      'Company not found in Indian markets',
      'COMPANY_NOT_FOUND'
    );
  }
}
