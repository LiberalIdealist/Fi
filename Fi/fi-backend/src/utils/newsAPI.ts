import axios from 'axios';
import NodeCache from 'node-cache';

// Cache news for 30 minutes
const newsCache = new NodeCache({ stdTTL: 1800 });

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  description: string;
}

// Add this interface
interface NewsAPIResponse {
  articles?: Array<{
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

/**
 * Fetches news articles from News API based on the given query
 * @param query Search query for news
 * @param maxResults Maximum number of articles to return
 * @returns Promise resolving to array of news articles
 */
export async function getMarketNews(
  query: string, 
  maxResults: number = 5
): Promise<NewsArticle[]> {
  try {
    // Create a cache key based on the query and limit
    const cacheKey = `news_${query}_${maxResults}`;
    
    // Check if we have cached results
    const cachedResults = newsCache.get<NewsArticle[]>(cacheKey);
    if (cachedResults) {
      console.log(`Using cached news for: ${query}`);
      return cachedResults;
    }
    
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (!API_KEY) {
      throw new Error('News API key not configured');
    }
    
    // Format the date for the API (last 7 days)
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const fromDate = date.toISOString().split('T')[0];
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        apiKey: API_KEY,
        language: 'en',
        from: fromDate,
        sortBy: 'relevancy',
        pageSize: maxResults
      }
    });
    
    // Then update the problematic lines
    // From:
    // if (!response.data.articles || response.data.articles.length === 0) {
    // To:
    const data = response.data as NewsAPIResponse;
    if (!data.articles || data.articles.length === 0) {
      return [];
    }
    
    // From:
    // const articles: NewsArticle[] = response.data.articles.map((article: any) => ({
    // To:
    const articles: NewsArticle[] = (response.data as NewsAPIResponse).articles?.map((article: any) => ({
      title: article.title,
      source: article.source.name,
      url: article.url,
      publishedAt: article.publishedAt,
      description: article.description
    })) ?? [];
    
    // Cache the results
    newsCache.set(cacheKey, articles);
    
    return articles;
  } catch (error: any) {
    console.error(`Error fetching news articles for "${query}":`, error.message);
    return [];
  }
}