import { NextRequest, NextResponse } from "next/server";
import { analyzeUserFinancialProfile } from "@/utils/chatGPT";

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();

    if (!userData) {
      return NextResponse.json({ error: "User data is required" }, { status: 400 });
    }

    // Analyze user financial profile using ChatGPT-4o
    const profileAnalysis = await analyzeUserFinancialProfile(userData);

    return NextResponse.json({ message: "User financial profiling complete", profile: profileAnalysis });
  } catch (error) {
    console.error("Error in financial profiling:", error);
    return NextResponse.json({ error: "Failed to generate profile insights" }, { status: 500 });
  }
}