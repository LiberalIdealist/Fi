import { NextResponse } from "next/server";
import { analyzeUserFinancialProfile } from "@/utils/chatGPT";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await analyzeUserFinancialProfile(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in ChatGPT Profiling:", error);
    return NextResponse.json({ error: "Failed to analyze profile" }, { status: 500 });
  }
}