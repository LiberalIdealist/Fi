import { NextRequest } from 'next/server';
import { getMarketAnalysis } from '@/utils/gemini';

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const analysis = await getMarketAnalysis(body);
    
    return new Response(JSON.stringify(analysis), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Analysis failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
