import axios from 'axios';
import NodeCache from 'node-cache';

// Cache search results for 1 hour
const searchCache = new NodeCache({ stdTTL: 3600 });

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Fetches search results from Google using the Google Custom Search API
 * @param query Search query string
 * @param limit Number of results to return (max 10)
 * @returns Promise resolving to array of search results
 */
export async function fetchGoogleSearchResults(
  query: string, 
  limit: number = 5
): Promise<GoogleSearchResult[]> {
  try {
    // Create a cache key based on the query and limit
    const cacheKey = `search_${query}_${limit}`;
    
    // Check if we have cached results
    const cachedResults = searchCache.get<GoogleSearchResult[]>(cacheKey);
    if (cachedResults) {
      console.log(`Using cached search results for: ${query}`);
      return cachedResults;
    }
    
    // Google Search API endpoint
    const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
    const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!API_KEY || !SEARCH_ENGINE_ID) {
      throw new Error('Google Search API key or Search Engine ID not configured');
    }
    
    const url = `https://www.googleapis.com/customsearch/v1`;
    const response = await axios.get(url, {
      params: {
        key: API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: query,
        num: limit
      }
    });
    
    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }
    
    // Transform the response to a simpler format
    const results: GoogleSearchResult[] = response.data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));
    
    // Cache the results
    searchCache.set(cacheKey, results);
    
    return results;
  } catch (error: any) {
    console.error(`Error fetching Google search results for "${query}":`, error.message);
    return [];
  }
}