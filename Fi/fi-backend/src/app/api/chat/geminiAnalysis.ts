import { NextRequest, NextResponse } from "next/server";
import { analyzeRiskProfile } from "@/utils/gemini"; // Utility function for Gemini AI

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();

    if (!requestData || Object.keys(requestData).length === 0) {
      return NextResponse.json({ error: "No data provided for analysis" }, { status: 400 });
    }

    // Call Gemini AI to analyze the provided data
    const analysisResult = await analyzeRiskProfile(requestData);

    return NextResponse.json({ message: "Analysis completed", analysisResult });
  } catch (error) {
    console.error("Error processing Gemini analysis:", error);
    return NextResponse.json({ error: "Failed to analyze data with Gemini" }, { status: 500 });
  }
}
export default analyzeRiskProfile;