export async function getStockData(symbol: string) {
    const response = await fetch(`/api/market/getStockData?symbol=${symbol}`);
    if (!response.ok) throw new Error("Failed to fetch stock data");
    return response.json();
  }
  
  export async function getMutualFunds() {
    const response = await fetch(`/api/market/getMutualFunds`);
    if (!response.ok) throw new Error("Failed to fetch mutual fund data");
    return response.json();
  }