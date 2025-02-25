export async function fetchStockData(ticker: string): Promise<string> {
  try {
    const response = await fetch(`/api/stock/${ticker}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    return await response.text();
  } catch (error) {
    console.error('Stock data fetch error:', error);
    throw error;
  }
}