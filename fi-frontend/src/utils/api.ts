import { MarketAnalysis, AnalysisRequest } from '@/types/analysis';

export async function getMarketAnalysis(request: AnalysisRequest): Promise<MarketAnalysis> {
  try {
    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Analysis request failed');
    }

    const data = await response.json();
    return data as MarketAnalysis;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to get market analysis');
  }
}