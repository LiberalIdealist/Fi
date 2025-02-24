import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  MarketAnalysis, 
  AnalysisRequest,
} from '@/types/analysis';
import { exec } from 'child_process';

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

if (typeof process.env.GEMINI_API_KEY !== 'string') {
  throw new Error('GEMINI_API_KEY environment variable is not defined');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RISK_KEYWORDS = {
  high: ['volatile', 'risky', 'uncertain', 'unstable'],
  medium: ['moderate', 'stable', 'balanced'],
  low: ['safe', 'secure', 'consistent', 'reliable']
};

const INDIAN_COMPANIES = [
  "RELIANCE.NS",
  "TCS.NS",
  "HDFCBANK.NS",
  "INFY.NS",
  "HINDUNILVR.NS",
  "ICICIBANK.NS",
  "SBIN.NS",
  "BHARTIARTL.NS",
  "LT.NS",
  "AXISBANK.NS",
  "ADANIPORTS.NS",
  "ASIANPAINT.NS",
  "BAJFINANCE.NS",
  "BAJAJFINSV.NS",
  "BPCL.NS",
  "BRITANNIA.NS",
  "CIPLA.NS",
  "COALINDIA.NS",
  "DIVISLAB.NS",
  "DRREDDY.NS",
  "EICHERMOT.NS",
  "GRASIM.NS",
  "HCLTECH.NS",
  "HDFC.NS",
  "HEROMOTOCO.NS",
  "HINDALCO.NS",
  "ITC.NS",
  "JSWSTEEL.NS",
  "KOTAKBANK.NS",
  "M&M.NS",
  "MARUTI.NS",
  "NESTLEIND.NS",
  "NTPC.NS",
  "ONGC.NS",
  "POWERGRID.NS",
  "SBILIFE.NS",
  "SHREECEM.NS",
  "SUNPHARMA.NS",
  "TATACONSUM.NS",
  "TATAMOTORS.NS",
  "TATASTEEL.NS",
  "TECHM.NS",
  "TITAN.NS",
  "ULTRACEMCO.NS",
  "UPL.NS",
  "WIPRO.NS",
  "ZEEL.NS"
];

function generatePrompt(request: AnalysisRequest, stockData: string): string {
  return `
    Analyze ${request.company} (${request.ticker}) from ${request.type} perspective, using the following stock data:
    ${stockData}
    Include:
    - Key performance metrics
    - Risk factors and mitigation strategies
    - Market opportunities and challenges
    - Competitive analysis
    - Future outlook
    
    Provide detailed analysis in English.
    Focus on Indian market context.
    Format the response in clear sections with bullet points.
    Provide a summary and investment recommendation.
    Also, provide 3 key highlights from the analysis.
  `.trim();
}

async function getStockData(ticker: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`python /workspaces/Fi/stock_data.py "${ticker}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

export async function getMarketAnalysis(
  request: AnalysisRequest
): Promise<MarketAnalysis> {
  try {
    const ticker = request.ticker;
    const stockData = await getStockData(ticker);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = generatePrompt(request, stockData);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const metrics = {
      score: Math.round(Math.random() * 100),
      confidence: Math.round(Math.random() * 100),
      risk: Math.round(Math.random() * 100)
    };

    // Split the response into analysis, summary, and key highlights
    const [analysis, summary, ...keyHighlights] = text.split('\n\n');

    return {
      company: request.company,
      type: request.type,
      analysis: analysis,
      summary: summary || '',
      keyHighlights: keyHighlights.length > 0 ? keyHighlights : ['No key highlights available'],
      metrics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
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

function getCacheKey(request: AnalysisRequest): string {
  return `analysis:${request.company}:${request.type}`;
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

function determineRisk(analysis: string): number {  // Changed return type to number
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

export async function processWithGemini(prompt: string, timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES) {
  // Implementation
}

export async function processMarketAnalysis(request: AnalysisRequest): Promise<MarketAnalysis> {
  try {
    const text = `Analysis for ${request.company} regarding ${request.type}...`;
    
    const metrics = {
      score: Math.random(),       // Normalized between 0 and 1
      confidence: Math.random(),  // Normalized between 0 and 1
      risk: Math.random()        // Normalized between 0 and 1
    };

    return {
      company: request.company,
      type: request.type,
      analysis: text,
      summary: '',
      keyHighlights: ['No key highlights available'],
      metrics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini processing error:', error);
    throw new Error('Failed to process market analysis');
  }
}
