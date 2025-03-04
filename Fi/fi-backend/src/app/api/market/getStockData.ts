import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { error } from "node:console";
import { Router } from "express";

const YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v7/finance/quote";
const NEWS_API = "https://newsapi.org/v2/everything";
const NEWS_API_KEY = process.env.NEWS_API_KEY; // Store this in your .env file

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 });
    }

    // Fetch stock data from Yahoo Finance
    const stockResponse = await axios.get(YAHOO_FINANCE_API, {
      params: { symbols: symbol },
    });

    const stockData = stockResponse.data.quoteResponse.result[0];

    // Fetch relevant news using News API
    const newsResponse = await axios.get(NEWS_API, {
      params: {
        q: symbol,
        apiKey: NEWS_API_KEY,
        language: "en",
        sortBy: "publishedAt",
      },
    });

    const newsData = newsResponse.data.articles.slice(0, 5); // Limit to 5 news articles

    return NextResponse.json({
      stock: stockData,
      news: newsData,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
export default Router();