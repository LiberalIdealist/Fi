import { NextResponse } from "next/server";

const NEWS_API_KEY = process.env.NEWS_API_KEY; // Ensure this is set in your environment variables

export async function GET() {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=stocks OR mutual funds OR investments&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }

    const newsData = await response.json();
    return NextResponse.json(newsData);
  } catch (error) {
    console.error("Error fetching financial news:", error);
    return NextResponse.json({ error: "Failed to fetch financial news" }, { status: 500 });
  }
}