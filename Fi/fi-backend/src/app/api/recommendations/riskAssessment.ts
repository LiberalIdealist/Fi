import { NextRequest, NextResponse } from "next/server";
import { analyzeRiskProfile } from "@/utils/gemini";

export async function POST(req: NextRequest) {
  try {
    const userProfile = await req.json();

    if (!userProfile) {
      return NextResponse.json({ error: "User responses are required" }, { status: 400 });
    }

    // Extract risk profile & insights using ChatGPT-4o
    const profileAnalysis = await analyzeRiskProfile(userProfile);

    return NextResponse.json({ message: "Risk assessment completed", riskProfile: profileAnalysis });
  } catch (error) {
    console.error("Error assessing risk:", error);
    return NextResponse.json({ error: "Failed to analyze risk profile" }, { status: 500 });
  }
}