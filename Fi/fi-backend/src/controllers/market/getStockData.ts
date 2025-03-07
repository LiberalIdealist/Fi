import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

const YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v7/finance/quote";
const NEWS_API = "https://newsapi.org/v2/everything";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface StockQuoteResponse {
  quoteResponse: {
    result: Array<{
      symbol: string;
      regularMarketPrice: number;
      regularMarketChange: number;
      regularMarketChangePercent: number;
      // Add other properties you're using
    }>;
  };
}

interface NewsAPIResponse {
  articles: Array<{
    title: string;
    description: string;
    url: string;
    urlToImage?: string;
    publishedAt: string;
    source: {
      name: string;
    };
  }>;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string;

    if (!symbol) {
      res.status(400).json({ error: "Stock symbol is required" });
      return; // Remove the 'return' keyword before res
    }

    // Fetch stock data from Yahoo Finance
    const stockResponse = await axios.get<StockQuoteResponse>(YAHOO_FINANCE_API, {
      params: { symbols: symbol },
    });

    const stockData = stockResponse.data.quoteResponse.result[0];

    // Fetch relevant news using News API
    const newsResponse = await axios.get<NewsAPIResponse>(NEWS_API, {
      params: {
        q: symbol,
        apiKey: NEWS_API_KEY,
        language: "en",
        sortBy: "publishedAt",
      },
    });

    const newsData = newsResponse.data.articles.slice(0, 5);

    res.json({
      stock: stockData,
      news: newsData,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

export default router;