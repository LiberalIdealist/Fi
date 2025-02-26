import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MarketAnalysis, AnalysisRequest } from '@/types/analysis';

const execPromise = promisify(exec);

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;

// Add this near the top of the file - local declaration instead of importing
const INDIAN_COMPANIES = [
  'TCS.NS', 'RELIANCE.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS', 
  'BHARTIARTL.NS', 'LT.NS', 'ICICIBANK.NS', 'SBIN.NS', 'AXISBANK.NS'
];

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

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found, some functionality will be limited');
}
const genAI = new GoogleGenerativeAI(apiKey);

const RISK_KEYWORDS = {
  high: ['volatile', 'risky', 'uncertain', 'unstable'],
  medium: ['moderate', 'stable', 'balanced'],
  low: ['safe', 'secure', 'consistent', 'reliable']
};

function generatePrompt(request: AnalysisRequest, stockData?: string): string {
  // For general market queries without specific stock data
  if (!stockData) {
    return `
# Indian Market Analysis Request

## Query
${request.query}

## Current Market Context
${request.context?.marketIndicators?.map(i => `- ${i.name}: ${i.value} (${i.change})`).join('\n') || 'No market indicators provided'}

## Analysis Requirements
Please provide an analysis focused specifically on Indian markets, including:

1. Current market sentiment in India
2. Key economic factors affecting Indian markets
3. Sectoral outlook (IT, Banking, Manufacturing, etc.)
 4. RBI policy impact
5. FPI/DII flow analysis
6. Global factors specifically affecting Indian markets
7. Short to medium term outlook for Indian investors

Format your response with clear sections, highlighting key points for Indian investors.
`;
  }
  
  // For specific stock analysis (using existing code for stock data)
  return `
# ${request.company || request.ticker} Market Analysis (Indian Context)

## Data Input
${stockData}

## Analysis Requirements
Please provide a comprehensive analysis of this Indian company including:

### Technical Analysis
- Price trends and patterns on NSE/BSE
- Moving averages (50-day, 200-day)
- Volume analysis
- Key technical indicators (RSI, MACD)

### Fundamental Analysis
- Financial ratios compared to Indian peers
- Earnings growth in domestic market context
- Market position in India
- Industry comparison with Indian competitors

### Indian Market Context
- Impact of domestic economic factors
- RBI policy implications
- FII/DII investment patterns
- Sectoral outlook in Indian economy

## Output Format
1. Executive Summary (2-3 sentences)
2. Key Investment Points for Indian Investors (3-5 bullet points)
3. Detailed Analysis (structured sections)
4. Investment Recommendation (Buy/Hold/Sell with rationale for Indian investors)

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
    // First check if the Python script exists
    const pythonScriptPath = '/workspaces/Fi/stock_data.py';
    
    try {
      await execPromise(`test -f ${pythonScriptPath}`);
    } catch (error) {
      throw new Error(`Python script not found at ${pythonScriptPath}`);
    }
    
    const { stdout, stderr } = await execPromise(`python ${pythonScriptPath} "${ticker}"`);
    if (stderr) {
      console.error(`Stock data stderr: ${stderr}`);
    }
    
    if (!stdout || stdout.trim() === '') {
      throw new Error('No output from stock data script');
    }
    
    if (!validateStockData(stdout)) {
      // Return a minimal valid structure instead of throwing
      return JSON.stringify({
        Financials: { 'P/E': 'N/A', 'EPS': 'N/A' },
        Indicators: { 'RSI': 'N/A', 'MACD': 'N/A' },
        Sentiment: { 'Score': 'N/A' }
      });
    }
    return stdout;
  } catch (error) {
    console.error('Stock data error:', (error as Error).message);
    // Provide fallback data instead of throwing
    return JSON.stringify({
      Financials: { 'P/E': 'N/A', 'EPS': 'N/A' },
      Indicators: { 'RSI': 'N/A', 'MACD': 'N/A' },
      Sentiment: { 'Score': 'N/A' }
    });
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
  company: string | undefined
): Promise<MarketAnalysis | null> {
  if (!company) return null; // Add null check
  
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
    // Handle different types of requests (general market vs specific company)
    if (request.query && !request.company) {
      // General market query without specific company
      return await handleGeneralMarketQuery(request);
    } else {
      // Company-specific query
      validateAnalysisRequest(request);
      
      const cached = await getCachedAnalysis(request.company);
      if (cached) return cached;
      
      return await handleCompanySpecificQuery(request);
    }
  } catch (error) {
    logger.error('Analysis failed', error);
    throw error;
  }
}

// New function to handle general market queries
async function handleGeneralMarketQuery(request: AnalysisRequest): Promise<MarketAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = generatePrompt(request);
    
    const result = await model.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error('Failed to generate analysis');
    }

    const text = result.response.text();
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    // Return a properly formatted response for general market queries
    return {
      content: text,  // Store the full response in the content field
      summary: extractSummary(text),
      keyHighlights: extractKeyPoints(text),
      metrics: {
        score: calculateScore(text),
        confidence: calculateConfidence(text),
        risk: determineRisk(text)
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('General market analysis failed', error);
    throw error;
  }
}

// Handle company-specific queries
async function handleCompanySpecificQuery(request: AnalysisRequest): Promise<MarketAnalysis> {
  return await withRateLimit(
    request.company || 'general',  // Provide fallback key for rate limiter
    async (): Promise<MarketAnalysis> => {
      // Fix error on line 338 - ensure company is a string
      const companyName = request.company || 'Unknown';
      const ticker = getTickerFromCompany(companyName);
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
        company: companyName,
        type: request.type,
        analysis: {
          technical: parsedAnalysis.technicalAnalysis || 'Technical analysis unavailable',
          fundamental: parsedAnalysis.fundamentalAnalysis || 'Fundamental analysis unavailable',
          risk: parsedAnalysis.riskAssessment || 'Risk assessment unavailable'
        },
        content: text,  // Store full response
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
}

// Helper functions to extract summary and key points from general market analysis
function extractSummary(text: string): string {
  // Look for sections that might contain a summary
  const sections = text.split('\n#');
  
  // Try to find a summary section
  const summarySection = sections.find(s => 
    s.toLowerCase().includes('summary') || 
    s.toLowerCase().includes('overview') ||
    s.toLowerCase().includes('sentiment')
  );
  
  if (summarySection) {
    const lines = summarySection.split('\n');
    // Return first few lines after the heading
    return lines.slice(1, 4).join('\n').trim();
  }
  
  // If no summary section found, return first paragraph
  return text.split('\n\n')[0].trim();
}

function extractKeyPoints(text: string): string[] {
  // Look for bullet points
  const bulletPoints = text.match(/^[•\-\*]\s(.+)$/gm);
  
  if (bulletPoints && bulletPoints.length > 0) {
    return bulletPoints
      .map(point => point.replace(/^[•\-\*]\s/, '').trim())
      .filter(point => point.length > 0);
  }
  
  // If no bullet points, try to find key sections
  const keyPointsSection = text.split('\n#').find(s => 
    s.toLowerCase().includes('key points') || 
    s.toLowerCase().includes('highlights')
  );
  
  if (keyPointsSection) {
    return keyPointsSection
      .split('\n')
      .slice(1) // Skip the heading
      .map(line => line.trim())
      .filter(line => line.length > 5);
  }
  
  // Fallback: extract sentences that might be key points
  return text
    .split('.')
    .map(s => s.trim())
    .filter(s => 
      s.length > 15 && 
      s.length < 100 && 
      (s.includes('market') || s.includes('India') || s.includes('economy'))
    )
    .slice(0, 5);
}

// Update validation to handle general market queries
function validateAnalysisRequest(request: AnalysisRequest): void {
  // If it's a general query without company, skip validation
  if (request.query && !request.company) {
    return;
  }
  
  // Otherwise validate the company
  if (!request.company?.trim()) {
    throw new AnalysisError('Company name is required for company-specific analysis', 'INVALID_INPUT');
  }
  
  // Check if the company is in our list of Indian companies
  // Make this check more forgiving - just check if we recognize the company
  const normalizedCompany = request.company.toUpperCase();
  const isIndianCompany = 
    INDIAN_COMPANIES.some(ticker => ticker.startsWith(normalizedCompany)) ||
    Object.keys(getCommonNameMappings()).some(name => 
      name.includes(normalizedCompany) || normalizedCompany.includes(name)
    );
  
  if (!isIndianCompany) {
    throw new AnalysisError(
      'Company not found in Indian markets',
      'COMPANY_NOT_FOUND'
    );
  }
}

// Helper function to get common name mappings
function getCommonNameMappings(): Record<string, string> {
  return {
    'TCS': 'TCS.NS',
    'INFOSYS': 'INFY.NS',
    'HINDUSTAN UNILEVER': 'HINDUNILVR.NS',
    'HDFC': 'HDFCBANK.NS',
    'HDFC BANK': 'HDFCBANK.NS',
    'BHARTI AIRTEL': 'BHARTIARTL.NS',
    'LARSEN': 'LT.NS',
    'L&T': 'LT.NS',
    'RELIANCE': 'RELIANCE.NS',
    'WIPRO': 'WIPRO.NS'
  };
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
  
  rateLimiter.set(key, Date.now()); // Use current time, not stale 'now'
  return fn();
}
