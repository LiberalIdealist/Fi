import axios from 'axios';
import fs from 'fs';
import path from 'path';
// Remove picklejs import
// import * as pickle from 'picklejs';

interface StockData {
  symbol: string;
  companyName?: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52Week?: number;
  low52Week?: number;
}

interface MarketData {
  indices: {
    nifty: { value: number; change: number },
    sensex: { value: number; change: number },
    niftyBank?: { value: number; change: number },
    niftyIT?: { value: number; change: number },
    niftyPharma?: { value: number; change: number },
    dowJones?: { value: number; change: number },
    nasdaq?: { value: number; change: number }
  },
  topGainers: StockData[],
  topLosers: StockData[],
  sectors: { [sector: string]: number }, // sector performance
  timestamp: string
}

interface YahooChartMeta {
  chartPreviousClose: number;
  regularMarketPrice: number;
  regularMarketVolume?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  [key: string]: any; // For other potential properties
}

interface YahooChartResult {
  meta: YahooChartMeta;
  [key: string]: any; // For other properties like timestamp, indicators
}

interface YahooFinanceResponse {
  chart: {
    result: YahooChartResult[] | null;
    error?: any;
  }
}

// Cache path - change to JSON file
const CACHE_PATH = path.join(process.cwd(), 'stock_cache.json');
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

// Common Indian stock tickers with company names
const COMMON_INDIAN_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd' },
  { symbol: 'ITC.NS', name: 'ITC Ltd' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd' },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries Ltd' }
];

// Indian market sectors
const INDIAN_SECTORS = [
  'IT', 'Banking', 'Pharma', 'Auto', 'Energy', 'FMCG', 
  'Metals', 'Telecom', 'Cement', 'Infrastructure'
];

/**
 * Ensures the symbol has .NS suffix for Indian stocks
 * @param symbol Stock ticker symbol
 * @returns Properly formatted symbol
 */
function normalizeIndianSymbol(symbol: string): string {
  // If already has .NS or .BO suffix, return as is
  if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) {
    return symbol;
  }
  
  // Check if it's one of our known Indian stocks without suffix
  const knownStock = COMMON_INDIAN_STOCKS.find(
    stock => stock.symbol.split('.')[0].toUpperCase() === symbol.toUpperCase()
  );
  
  if (knownStock) {
    return knownStock.symbol;
  }
  
  // Default to adding .NS suffix for Indian stocks
  return `${symbol}.NS`;
}

/**
 * Save data to JSON cache file
 */
async function saveToCache(data: any): Promise<void> {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

/**
 * Load data from JSON cache file
 */
async function loadFromCache(): Promise<any> {
  try {
    const data = fs.readFileSync(CACHE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
}

/**
 * Fetches stock market data focusing on Indian markets
 * @returns Promise resolving to market data
 */
export async function fetchStockMarketData(): Promise<MarketData> {
  try {
    // Check if cache exists and is fresh
    if (fs.existsSync(CACHE_PATH)) {
      const stats = fs.statSync(CACHE_PATH);
      const lastModified = stats.mtime.getTime();
      const now = new Date().getTime();
      
      // If cache is fresh (less than 1 hour old)
      if (now - lastModified < CACHE_TTL) {
        const cachedData = await loadFromCache();
        console.log('Using cached stock market data');
        return cachedData;
      }
    }
    
    // Define the indices to track (prioritizing Indian indices)
    const indices = [
      { symbol: '^NSEI', name: 'nifty' },           // Nifty 50
      { symbol: '^BSESN', name: 'sensex' },         // BSE Sensex
      { symbol: '^NSEBANK', name: 'niftyBank' },    // Nifty Bank
      { symbol: '^CNXIT', name: 'niftyIT' },        // Nifty IT
      { symbol: '^CNXPHARMA', name: 'niftyPharma'}, // Nifty Pharma
      { symbol: '^DJI', name: 'dowJones' },         // Dow Jones (US)
      { symbol: '^IXIC', name: 'nasdaq' }           // NASDAQ (US)
    ];
    
    // Fetch indices data
    const indicesPromises = indices.map(index => 
      axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}?interval=1d`)
        .catch(() => ({ data: { chart: { result: null } } })) // Handle failed requests gracefully
    );
    
    const responses = await Promise.all(indicesPromises);
    const indicesData: any = {};
    
    responses.forEach((response, index) => {
      const yahooResponse = response.data as YahooFinanceResponse;
      if (yahooResponse?.chart?.result && yahooResponse.chart.result.length > 0) {
        const result = yahooResponse.chart.result[0];
        const quote = result.meta;
        const previousClose = quote.chartPreviousClose;
        const currentValue = quote.regularMarketPrice;
        const change = currentValue - previousClose;
        
        indicesData[indices[index].name] = {
          value: currentValue,
          change: change,
          changePercent: (change / previousClose) * 100
        };
      }
    });
    
    // Fetch real-time data for select Indian stocks to identify gainers/losers
    const stockPromises = COMMON_INDIAN_STOCKS.map(stock => 
      fetchStockDetails(stock.symbol)
        .catch(() => null)
    );
    
    const stockResults = await Promise.all(stockPromises);
    const validStocks = stockResults.filter(stock => stock !== null) as StockData[];
    
    // Sort stocks to find top gainers and losers
    validStocks.sort((a, b) => b.changePercent - a.changePercent);
    
    const topGainers = validStocks
      .filter(stock => stock.changePercent > 0)
      .slice(0, 5);
      
    const topLosers = [...validStocks]
      .filter(stock => stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
    
    // Generate sector performance data (in a real app, this would come from an API)
    // Here we're generating random but realistic sector performance values
    const sectors: { [sector: string]: number } = {};
    INDIAN_SECTORS.forEach(sector => {
      // Generate random performance between -3% and +3%
      sectors[sector] = parseFloat((Math.random() * 6 - 3).toFixed(2));
    });
    
    const marketData: MarketData = {
      indices: {
        nifty: indicesData.nifty || { value: 0, change: 0 },
        sensex: indicesData.sensex || { value: 0, change: 0 },
        niftyBank: indicesData.niftyBank,
        niftyIT: indicesData.niftyIT,
        niftyPharma: indicesData.niftyPharma,
        dowJones: indicesData.dowJones,
        nasdaq: indicesData.nasdaq
      },
      topGainers: topGainers.length > 0 ? topGainers : generateDummyStocks(true),
      topLosers: topLosers.length > 0 ? topLosers : generateDummyStocks(false),
      sectors,
      timestamp: new Date().toISOString()
    };
    
    // Cache the data
    await saveToCache(marketData);
    
    return marketData;
  } catch (error: any) {
    console.error('Error fetching stock market data:', error.message);
    
    // Return dummy data in case of error
    return {
      indices: {
        nifty: { value: 22000, change: 150 },
        sensex: { value: 72000, change: 400 }
      },
      topGainers: generateDummyStocks(true),
      topLosers: generateDummyStocks(false),
      sectors: INDIAN_SECTORS.reduce((acc, sector) => ({
        ...acc,
        [sector]: parseFloat((Math.random() * 6 - 3).toFixed(2))
      }), {}),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Fetches detailed information for a specific stock
 * @param symbol Stock symbol (e.g., 'RELIANCE' or 'RELIANCE.NS')
 * @returns Promise resolving to stock data
 */
export async function fetchStockDetails(symbol: string): Promise<StockData | null> {
  try {
    // Ensure symbol has .NS for Indian stocks
    const normalizedSymbol = normalizeIndianSymbol(symbol);
    
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${normalizedSymbol}?interval=1d`
    );
    
    const yahooResponse = response.data as YahooFinanceResponse;
    if (!yahooResponse.chart.result || yahooResponse.chart.result.length === 0) {
      return null;
    }
    
    const result = yahooResponse.chart.result[0];
    const quote = result.meta;
    const previousClose = quote.chartPreviousClose;
    const currentPrice = quote.regularMarketPrice;
    const change = currentPrice - previousClose;
    
    // Find the company name if it's a known stock
    const stockInfo = COMMON_INDIAN_STOCKS.find(stock => stock.symbol === normalizedSymbol);
    
    return {
      symbol: normalizedSymbol,
      companyName: stockInfo?.name,
      currentPrice,
      change,
      changePercent: (change / previousClose) * 100,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap,
      high52Week: quote.fiftyTwoWeekHigh,
      low52Week: quote.fiftyTwoWeekLow
    };
  } catch (error: any) {
    console.error(`Error fetching details for ${symbol}:`, error.message);
    return null;
  }
}

/**
 * Fetches mutual fund data for Indian market
 * @param symbol Mutual fund symbol or name
 * @returns Promise resolving to mutual fund data
 */
export async function fetchIndianMutualFundDetails(symbol: string) {
  try {
    // This would ideally connect to a proper API for mutual fund data
    // As Yahoo Finance doesn't properly support Indian mutual funds
    // For now, we'll return dummy data
    
    const commonFunds = [
      { symbol: 'HDFCMIP', name: 'HDFC Mid-Cap Opportunities Fund' },
      { symbol: 'AXISMF', name: 'Axis Bluechip Fund' },
      { symbol: 'ICICIPRU', name: 'ICICI Prudential Bluechip Fund' },
      { symbol: 'SBIMF', name: 'SBI Small Cap Fund' }
    ];
    
    const fundInfo = commonFunds.find(fund => 
      fund.symbol.toLowerCase().includes(symbol.toLowerCase()) || 
      fund.name.toLowerCase().includes(symbol.toLowerCase())
    );
    
    if (!fundInfo) {
      return null;
    }
    
    // Generate realistic dummy data
    return {
      symbol: fundInfo.symbol,
      name: fundInfo.name,
      nav: parseFloat((Math.random() * 100 + 20).toFixed(2)),
      oneYearReturns: parseFloat((Math.random() * 40 - 10).toFixed(2)),
      threeYearReturns: parseFloat((Math.random() * 60 - 5).toFixed(2)),
      fiveYearReturns: parseFloat((Math.random() * 80).toFixed(2)),
      aum: parseFloat((Math.random() * 10000 + 1000).toFixed(2)), // AUM in crores
      category: ['Equity', 'Debt', 'Hybrid', 'Index'][Math.floor(Math.random() * 4)]
    };
  } catch (error: any) {
    console.error(`Error fetching mutual fund details for ${symbol}:`, error.message);
    return null;
  }
}

/**
 * Generate dummy stock data for fallback
 * @param gainers Whether to generate gainers (true) or losers (false)
 * @returns Array of dummy stock data
 */
function generateDummyStocks(gainers: boolean): StockData[] {
  // Use subset of real Indian companies for more realistic data
  const stocks = gainers ? 
    COMMON_INDIAN_STOCKS.slice(0, 5) : 
    COMMON_INDIAN_STOCKS.slice(5, 10);
  
  return stocks.map((stock, index) => {
    const baseChange = gainers ? 
      (Math.random() * 5 + 1) : // 1% to 6% gain
      (Math.random() * -5 - 1); // -1% to -6% loss
      
    const changePercent = parseFloat(baseChange.toFixed(2));
    const currentPrice = parseFloat((Math.random() * 900 + 100).toFixed(2));
    const change = parseFloat((currentPrice * changePercent / 100).toFixed(2));
    
    return {
      symbol: stock.symbol,
      companyName: stock.name,
      currentPrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000) + 500000,
      marketCap: Math.floor(Math.random() * 500000) + 10000, // in crores
      high52Week: currentPrice * 1.3,
      low52Week: currentPrice * 0.7
    };
  });
}