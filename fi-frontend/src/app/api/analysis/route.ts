import { NextResponse } from 'next/server';
import { getMarketAnalysis } from '@/utils/gemini';
import { AnalysisRequest } from '@/types/analysis';

export async function POST(request: Request) {
  try {
    const data: AnalysisRequest = await request.json();
    const analysis = await getMarketAnalysis(data);
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
