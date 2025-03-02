import axios from 'axios';

// API configurations
const API_TIMEOUT = 10000; // 10s
const DEFAULT_RETRIES = 3;

// Temporary logging to verify environment variable
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

// Function to fetch stock data from Python script
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

// Gemini AI handler for stock analysis
export const queryGemini = async (query: string, context?: unknown) => {
  try {
    const response = await axios.post("/api/analysis", { prompt: query, context }, { timeout: API_TIMEOUT });
    return response.data;
  } catch (error) {
    console.error("Error querying Gemini:", (error as Error).message);
    return null;
  }
};

// Main function to process stock-related queries
export const analyzeStockQuery = async (query: string) => {
  // Handle different types of queries
  if (query.includes("sentiment")) {
    return getSentimentAnalysis(["Reliance Q3 results are bullish", "TCS sees profit surge"]);
  }

  if (query.includes("PE ratio") || query.includes("financials")) {
    return getStockDataFromAPI("RELIANCE.NS", "PE_Ratio");
  }

  return queryGemini(query);
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

// Get market analysis for Indian stocks
export async function getMarketAnalysis(request: any): Promise<any> {
  try {
    // Determine if it's a general market query or company specific
    if (request.query && !request.company) {
      return handleGeneralMarketQuery(request);
    } else {
      // Validate request (ensure it's an Indian company)
      validateAnalysisRequest(request);
      
      // Check cache to avoid redundant calls
      const cachedAnalysis = await getCachedAnalysis(request.company);
      if (cachedAnalysis) {
        return cachedAnalysis;
      }
      
      // Process company specific query
      const analysis = await handleCompanySpecificQuery(request);
      
      // Cache results for future use
      analysisCache.set(request.company || 'general', {
        data: analysis,
        timestamp: Date.now()
      });
      
      return analysis;
    }
  } catch (error) {
    console.error('Analysis failed', error);
    throw error;
  }
}

// Helper functions
function validateAnalysisRequest(request: any) {
  // Ensure the company is an Indian company
  // Implementation details...
}

async function getCachedAnalysis(company: string | undefined) { 
  // Implement cache retrieval
  return null; 
}

async function handleGeneralMarketQuery(request: any) { 
  // Implementation for general market queries
  return {}; 
}

async function handleCompanySpecificQuery(request: any) {
  try {
    const { company, metrics = ['Financials', 'Indicators', 'Sentiment'] } = request;
    
    // Get the stock ticker symbol
    const ticker = company + '.NS'; // Add .NS suffix for NSE stocks
    
    // Fetch stock data using the API
    const stockData = await getStockDataFromAPI(ticker, '');
    
    if (!stockData) {
      throw new Error(`Failed to fetch data for ${company}`);
    }
    
    // Filter requested metrics if specified
    let filteredData = stockData;
    if (Array.isArray(metrics) && metrics.length > 0) {
      filteredData = {};
      metrics.forEach(metric => {
        if (stockData[metric]) {
          filteredData[metric] = stockData[metric];
        }
      });
    }
    
    // Generate summary using Gemini
    const summary = await generateSummary(company, filteredData);
    
    return {
      company,
      ticker,
      data: filteredData,
      summary, // Add summary to response
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error analyzing ${request.company}:`, error);
    throw error;
  }
}

// Add this new function
async function generateSummary(company: string, data: any) {
  try {
    const prompt = `
      Generate a concise market analysis summary for ${company} based on the following data:
      
      ${JSON.stringify(data, null, 2)}
      
      Include insights on:
      1. Current financial performance
      2. Technical indicators and their significance
      3. Key recommendations for investors
      
      Format the response as a structured analysis.
    `;
    
    const response = await queryGemini(prompt);
    return response?.result || "Summary generation failed";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary due to an error";
  }
}

// Cache analysis results to reduce API calls
const analysisCache = new Map<string, {
  data: any;
  timestamp: number;
}>();